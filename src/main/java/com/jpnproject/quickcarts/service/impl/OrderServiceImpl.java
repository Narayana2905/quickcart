package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.*;
import com.jpnproject.quickcarts.entity.*;
import com.jpnproject.quickcarts.exception.BadRequestException;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.CartRepository;
import com.jpnproject.quickcarts.repository.OrderRepository;
import com.jpnproject.quickcarts.service.CouponService;
import com.jpnproject.quickcarts.service.InventoryService;
import com.jpnproject.quickcarts.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * Implementation of {@link OrderService}.
 * Converts an active cart into an order, reserving inventory for each item,
 * and optionally applies a coupon discount to the item subtotal.
 */
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final InventoryService inventoryService;
    private final CouponService couponService;

    @Override
    @Transactional
    public OrderResponse checkout(CheckoutRequest request) {
        Cart cart = cartRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user id: " + request.getUserId()));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }
        if (cart.getDarkStore() == null) {
            throw new BadRequestException("Cart is not associated with a dark store");
        }

        Order order = new Order();
        order.setUserId(cart.getUserId());
        order.setDarkStore(cart.getDarkStore());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setDeliveryPincode(request.getDeliveryPincode());

        BigDecimal itemsSubtotal = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            // reserve stock; throws BadRequestException if insufficient
            inventoryService.reserveStock(cart.getDarkStore().getId(), cartItem.getProductVariant().getId(), cartItem.getQuantity());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductVariant(cartItem.getProductVariant());
            orderItem.setProductName(cartItem.getProductVariant().getProduct().getName() + " - " + cartItem.getProductVariant().getVariantName());
            orderItem.setPriceAtPurchase(cartItem.getProductVariant().getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            order.getItems().add(orderItem);

            itemsSubtotal = itemsSubtotal.add(cartItem.getProductVariant().getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }

        BigDecimal discount = BigDecimal.ZERO;
        if (StringUtils.hasText(request.getCouponCode())) {
            // validates expiry, usage limit, min order value; throws BadRequestException on failure
            ApplyCouponResponse applied = couponService.validate(new ApplyCouponRequest(request.getCouponCode(), itemsSubtotal) {});
            discount = applied.getDiscountAmount();
            order.setCouponCode(request.getCouponCode().toUpperCase());
        }
        order.setDiscountAmount(discount);

        order.setTotalAmount(itemsSubtotal.subtract(discount).add(order.getDeliveryFee()));
        Order saved = orderRepository.save(order);

        // only mark the coupon used after the order is successfully persisted
        if (StringUtils.hasText(request.getCouponCode())) {
            couponService.markUsed(request.getCouponCode());
        }

        // clear cart after successful order placement
        cart.getItems().clear();
        cart.setDarkStore(null);
        cartRepository.save(cart);

        return toResponse(saved, itemsSubtotal);
    }

    @Override
    public OrderResponse getById(Long id) {
        Order order = findEntity(id);
        return toResponse(order, computeItemsSubtotal(order));
    }

    @Override
    public List<OrderResponse> getByUser(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(o -> toResponse(o, computeItemsSubtotal(o)))
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long id, UpdateOrderStatusRequest request) {
        Order order = findEntity(id);
        validateStatusTransition(order.getStatus(), request.getStatus());
        order.setStatus(request.getStatus());
        Order saved = orderRepository.save(order);
        return toResponse(saved, computeItemsSubtotal(saved));
    }

    @Override
    @Transactional
    public OrderResponse cancel(Long id, CancelOrderRequest request) {
        Order order = findEntity(id);
        if (order.getStatus() == OrderStatus.OUT_FOR_DELIVERY || order.getStatus() == OrderStatus.DELIVERED) {
            throw new BadRequestException("Order cannot be cancelled at this stage");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled");
        }

        for (OrderItem item : order.getItems()) {
            inventoryService.releaseStock(order.getDarkStore().getId(), item.getProductVariant().getId(), item.getQuantity());
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(request.getReason());
        Order saved = orderRepository.save(order);
        return toResponse(saved, computeItemsSubtotal(saved));
    }

    /** Enforces a forward-only status lifecycle: PLACED -> PACKED -> OUT_FOR_DELIVERY -> DELIVERED. */
    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        if (current == OrderStatus.CANCELLED || current == OrderStatus.DELIVERED) {
            throw new BadRequestException("Order is already in a terminal state: " + current);
        }
        List<OrderStatus> order = List.of(OrderStatus.PLACED, OrderStatus.PACKED, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED);
        if (order.indexOf(next) != order.indexOf(current) + 1) {
            throw new BadRequestException("Invalid status transition from " + current + " to " + next);
        }
    }

    private BigDecimal computeItemsSubtotal(Order order) {
        return order.getItems().stream()
                .map(i -> i.getPriceAtPurchase().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Order findEntity(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    private OrderResponse toResponse(Order order, BigDecimal itemsSubtotal) {
        List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> new OrderItemResponse(
                item.getId(),
                item.getProductVariant().getId(),
                item.getProductName(),
                item.getPriceAtPurchase(),
                item.getQuantity(),
                item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity()))
        )).toList();

        return new OrderResponse(
                order.getId(),
                order.getUserId(),
                order.getDarkStore().getId(),
                order.getDarkStore().getName(),
                order.getDeliveryAddress(),
                order.getDeliveryPincode(),
                itemsSubtotal,
                order.getCouponCode(),
                order.getDiscountAmount(),
                order.getDeliveryFee(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCancellationReason(),
                itemResponses,
                order.getCreatedAt()
        );
    }
}
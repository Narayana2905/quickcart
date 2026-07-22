package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.AddCartItemRequest;
import com.jpnproject.quickcarts.dto.CartItemResponse;
import com.jpnproject.quickcarts.dto.CartResponse;
import com.jpnproject.quickcarts.dto.UpdateCartItemRequest;
import com.jpnproject.quickcarts.entity.*;
import com.jpnproject.quickcarts.exception.BadRequestException;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.*;
import com.jpnproject.quickcarts.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * Implementation of {@link CartService}.
 * Cart items are always scoped to one dark store; adding an item from a
 * different store clears the existing cart first (Zepto-style behavior).
 */
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final DarkStoreRepository darkStoreRepository;
    private final ProductVariantRepository productVariantRepository;
    private final InventoryRepository inventoryRepository;

    @Override
    public CartResponse addItem(AddCartItemRequest request) {
        DarkStore store = darkStoreRepository.findById(request.getDarkStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Dark store not found with id: " + request.getDarkStoreId()));

        ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found with id: " + request.getProductVariantId()));

        validateStock(request.getDarkStoreId(), request.getProductVariantId(), request.getQuantity());

        Cart existingOrNewCart = cartRepository.findByUserId(request.getUserId()).orElseGet(() -> {
            Cart newCart = new Cart();
            newCart.setUserId(request.getUserId());
            return newCart;
        });

        // Single dark store per cart: switching stores clears existing items
        if (existingOrNewCart.getDarkStore() != null && !existingOrNewCart.getDarkStore().getId().equals(store.getId())) {
            existingOrNewCart.getItems().clear();
        }
        existingOrNewCart.setDarkStore(store);

        // final reference required for safe capture inside lambda below
        final Cart cart = cartRepository.save(existingOrNewCart);

        CartItem item = cartItemRepository.findByCartIdAndProductVariantId(cart.getId(), variant.getId())
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProductVariant(variant);
                    newItem.setQuantity(0);
                    return newItem;
                });
        item.setQuantity(item.getQuantity() + request.getQuantity());
        cartItemRepository.save(item);

        return toResponse(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Override
    public CartResponse updateItem(Long userId, Long cartItemId, UpdateCartItemRequest request) {
        Cart cart = findCartByUser(userId);
        CartItem item = findItem(cart, cartItemId);

        validateStock(cart.getDarkStore().getId(), item.getProductVariant().getId(), request.getQuantity());

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);
        return toResponse(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Override
    public CartResponse removeItem(Long userId, Long cartItemId) {
        Cart cart = findCartByUser(userId);
        CartItem item = findItem(cart, cartItemId);
        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        return toResponse(cartRepository.findById(cart.getId()).orElseThrow());
    }

    @Override
    public CartResponse getCart(Long userId) {
        return toResponse(findCartByUser(userId));
    }

    @Override
    public void clearCart(Long userId) {
        Cart cart = findCartByUser(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    /** Ensures requested quantity does not exceed sellable (available - reserved) stock. */
    private void validateStock(Long darkStoreId, Long productVariantId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByDarkStoreIdAndProductVariantId(darkStoreId, productVariantId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not available at selected store"));
        int sellable = inventory.getAvailableQuantity() - inventory.getReservedQuantity();
        if (quantity > sellable) {
            throw new BadRequestException("Only " + sellable + " unit(s) available in stock");
        }
    }

    private Cart findCartByUser(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user id: " + userId));
    }

    private CartItem findItem(Cart cart, Long cartItemId) {
        return cart.getItems().stream()
                .filter(i -> i.getId().equals(cartItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream().map(item -> {
            BigDecimal price = item.getProductVariant().getPrice();
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
            return new CartItemResponse(
                    item.getId(),
                    item.getProductVariant().getId(),
                    item.getProductVariant().getVariantName(),
                    item.getProductVariant().getProduct().getName(),
                    price,
                    item.getQuantity(),
                    subtotal
            );
        }).toList();

        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setUserId(cart.getUserId());
        response.setDarkStoreId(cart.getDarkStore() != null ? cart.getDarkStore().getId() : null);
        response.setDarkStoreName(cart.getDarkStore() != null ? cart.getDarkStore().getName() : null);
        response.setItems(itemResponses);
        response.setTotalAmount(total);
        response.setTotalItems(itemResponses.stream().mapToInt(CartItemResponse::getQuantity).sum());
        return response;
    }
}
package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.CancelOrderRequest;
import com.jpnproject.quickcarts.dto.CheckoutRequest;
import com.jpnproject.quickcarts.dto.OrderResponse;
import com.jpnproject.quickcarts.dto.UpdateOrderStatusRequest;

import java.util.List;

/**
 * Service contract for order placement and lifecycle management.
 */
public interface OrderService {

    /** Places an order from the user's current cart, reserves stock, and clears the cart. */
    OrderResponse checkout(CheckoutRequest request);

    /** Fetches an order by id. */
    OrderResponse getById(Long id);

    /** Fetches order history for a user, most recent first. */
    List<OrderResponse> getByUser(Long userId);

    /** Advances the order to a new status (PACKED, OUT_FOR_DELIVERY, DELIVERED). */
    OrderResponse updateStatus(Long id, UpdateOrderStatusRequest request);

    /** Cancels an order (only allowed before OUT_FOR_DELIVERY) and releases reserved stock. */
    OrderResponse cancel(Long id, CancelOrderRequest request);
}
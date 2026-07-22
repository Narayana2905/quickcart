package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.AddCartItemRequest;
import com.jpnproject.quickcarts.dto.CartResponse;
import com.jpnproject.quickcarts.dto.UpdateCartItemRequest;

/**
 * Service contract for cart operations.
 * Enforces single-dark-store-per-cart rule and validates stock availability.
 */
public interface CartService {

    /** Adds an item to the user's cart. Clears existing items if the dark store differs. */
    CartResponse addItem(AddCartItemRequest request);

    /** Updates the quantity of an existing cart item. */
    CartResponse updateItem(Long userId, Long cartItemId, UpdateCartItemRequest request);

    /** Removes a single item from the cart. */
    CartResponse removeItem(Long userId, Long cartItemId);

    /** Fetches the current cart for a user. */
    CartResponse getCart(Long userId);

    /** Clears all items from the user's cart. */
    void clearCart(Long userId);
}
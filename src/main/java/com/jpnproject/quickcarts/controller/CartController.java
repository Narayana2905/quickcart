package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.AddCartItemRequest;
import com.jpnproject.quickcarts.dto.CartResponse;
import com.jpnproject.quickcarts.dto.UpdateCartItemRequest;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST APIs for cart management.
 * Note: userId is accepted as a request parameter for now; will be derived
 * from the authenticated principal once security is introduced.
 */
@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Cart management APIs")
public class CartController {

    private final CartService cartService;

    @PostMapping("/items")
    @Operation(summary = "Add item to cart", description = "Adds a product variant to the cart; clears cart if switching dark stores")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(@Valid @RequestBody AddCartItemRequest request) {
        CartResponse response = cartService.addItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item added to cart successfully", response));
    }

    @PutMapping("/items/{cartItemId}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @Parameter(description = "User id") @RequestParam Long userId,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartResponse response = cartService.updateItem(userId, cartItemId, request);
        return ResponseEntity.ok(ApiResponse.success("Cart item updated successfully", response));
    }

    @DeleteMapping("/items/{cartItemId}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @Parameter(description = "User id") @RequestParam Long userId,
            @PathVariable Long cartItemId) {
        CartResponse response = cartService.removeItem(userId, cartItemId);
        return ResponseEntity.ok(ApiResponse.success("Cart item removed successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get current cart", description = "Fetches the active cart for a user")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @Parameter(description = "User id") @RequestParam Long userId) {
        CartResponse response = cartService.getCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart fetched successfully", response));
    }

    @DeleteMapping
    @Operation(summary = "Clear cart", description = "Removes all items from the user's cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @Parameter(description = "User id") @RequestParam Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully", null));
    }
}
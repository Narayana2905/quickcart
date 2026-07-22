package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.*;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST APIs for order placement and lifecycle management.
 */
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order", description = "Order placement and lifecycle APIs")
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    @Operation(summary = "Checkout cart", description = "Places an order from the user's active cart and reserves stock")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(@Valid @RequestBody CheckoutRequest request) {
        OrderResponse response = orderService.checkout(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by id")
    public ResponseEntity<ApiResponse<OrderResponse>> getById(@PathVariable Long id) {
        OrderResponse response = orderService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Order fetched successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get order history", description = "Fetches all orders for a user, most recent first")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getByUser(
            @Parameter(description = "User id") @RequestParam Long userId) {
        List<OrderResponse> response = orderService.getByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Order history fetched successfully", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Advances order status forward through the lifecycle")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
        OrderResponse response = orderService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully", response));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel order", description = "Cancels an order and releases reserved stock, if before dispatch")
    public ResponseEntity<ApiResponse<OrderResponse>> cancel(@PathVariable Long id, @Valid @RequestBody CancelOrderRequest request) {
        OrderResponse response = orderService.cancel(id, request);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", response));
    }
}
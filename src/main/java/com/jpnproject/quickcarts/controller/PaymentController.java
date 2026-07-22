package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.*;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST APIs for payment initiation, gateway callback handling, and refunds.
 */
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Payment and refund management APIs")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Initiate payment", description = "Starts a payment for an order; COD is auto-confirmed")
    public ResponseEntity<ApiResponse<PaymentResponse>> initiate(@Valid @RequestBody InitiatePaymentRequest request) {
        PaymentResponse response = paymentService.initiate(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment initiated successfully", response));
    }

    @PostMapping("/{id}/callback")
    @Operation(summary = "Payment gateway callback", description = "Confirms success/failure of an online payment")
    public ResponseEntity<ApiResponse<PaymentResponse>> handleCallback(@PathVariable Long id, @Valid @RequestBody PaymentCallbackRequest request) {
        PaymentResponse response = paymentService.handleCallback(id, request);
        return ResponseEntity.ok(ApiResponse.success("Payment status updated successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by id")
    public ResponseEntity<ApiResponse<PaymentResponse>> getById(@PathVariable Long id) {
        PaymentResponse response = paymentService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Payment fetched successfully", response));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get payments by order", description = "Lists all payment attempts for an order")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getByOrder(@PathVariable Long orderId) {
        List<PaymentResponse> response = paymentService.getByOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success("Payments fetched successfully", response));
    }

    @PostMapping("/{id}/refund")
    @Operation(summary = "Issue refund", description = "Refunds a successful payment, fully or partially")
    public ResponseEntity<ApiResponse<RefundResponse>> issueRefund(@PathVariable Long id, @Valid @RequestBody RefundRequest request) {
        RefundResponse response = paymentService.issueRefund(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Refund issued successfully", response));
    }
}
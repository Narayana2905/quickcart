package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.AssignRiderRequest;
import com.jpnproject.quickcarts.dto.DeliveryAssignmentResponse;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.DeliveryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/deliveries")
@RequiredArgsConstructor
@Tag(name = "Delivery", description = "Rider assignment and delivery tracking APIs")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping("/assign")
    @Operation(summary = "Assign rider to order")
    public ResponseEntity<ApiResponse<DeliveryAssignmentResponse>> assign(@Valid @RequestBody AssignRiderRequest request) {
        DeliveryAssignmentResponse response = deliveryService.assignRider(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Rider assigned successfully", response));
    }

    @PatchMapping("/{orderId}/picked-up")
    @Operation(summary = "Mark order picked up")
    public ResponseEntity<ApiResponse<DeliveryAssignmentResponse>> markPickedUp(@PathVariable Long orderId) {
        DeliveryAssignmentResponse response = deliveryService.markPickedUp(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order marked picked up", response));
    }

    @PatchMapping("/{orderId}/delivered")
    @Operation(summary = "Mark order delivered")
    public ResponseEntity<ApiResponse<DeliveryAssignmentResponse>> markDelivered(@PathVariable Long orderId) {
        DeliveryAssignmentResponse response = deliveryService.markDelivered(orderId);
        return ResponseEntity.ok(ApiResponse.success("Order marked delivered", response));
    }

    @PatchMapping("/{orderId}/failed")
    @Operation(summary = "Mark delivery failed")
    public ResponseEntity<ApiResponse<DeliveryAssignmentResponse>> markFailed(@PathVariable Long orderId, @RequestParam String reason) {
        DeliveryAssignmentResponse response = deliveryService.markFailed(orderId, reason);
        return ResponseEntity.ok(ApiResponse.success("Delivery marked failed", response));
    }

    @GetMapping("/{orderId}/track")
    @Operation(summary = "Track order delivery")
    public ResponseEntity<ApiResponse<DeliveryAssignmentResponse>> track(@PathVariable Long orderId) {
        DeliveryAssignmentResponse response = deliveryService.trackOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success("Delivery status fetched successfully", response));
    }
}
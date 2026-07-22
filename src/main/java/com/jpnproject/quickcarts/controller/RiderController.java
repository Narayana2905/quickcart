package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.RiderRequest;
import com.jpnproject.quickcarts.dto.RiderResponse;
import com.jpnproject.quickcarts.dto.UpdateRiderLocationRequest;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.RiderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/riders")
@RequiredArgsConstructor
@Tag(name = "Rider", description = "Delivery rider management APIs")
public class RiderController {

    private final RiderService riderService;

    @PostMapping
    @Operation(summary = "Onboard rider")
    public ResponseEntity<ApiResponse<RiderResponse>> create(@Valid @RequestBody RiderRequest request) {
        RiderResponse response = riderService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Rider onboarded successfully", response));
    }

    @PatchMapping("/{id}/location")
    @Operation(summary = "Update rider live location")
    public ResponseEntity<ApiResponse<RiderResponse>> updateLocation(@PathVariable Long id, @Valid @RequestBody UpdateRiderLocationRequest request) {
        RiderResponse response = riderService.updateLocation(id, request);
        return ResponseEntity.ok(ApiResponse.success("Rider location updated successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get rider by id")
    public ResponseEntity<ApiResponse<RiderResponse>> getById(@PathVariable Long id) {
        RiderResponse response = riderService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Rider fetched successfully", response));
    }

    @GetMapping("/store/{darkStoreId}/available")
    @Operation(summary = "Get available riders at a store")
    public ResponseEntity<ApiResponse<List<RiderResponse>>> getAvailable(@PathVariable Long darkStoreId) {
        List<RiderResponse> response = riderService.getAvailableByStore(darkStoreId);
        return ResponseEntity.ok(ApiResponse.success("Available riders fetched successfully", response));
    }
}
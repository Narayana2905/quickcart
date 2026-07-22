package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.DarkStoreRequest;
import com.jpnproject.quickcarts.dto.DarkStoreResponse;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.DarkStoreService;
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
 * REST APIs for managing dark stores (micro-fulfilment centers).
 */
@RestController
@RequestMapping("/api/v1/dark-stores")
@RequiredArgsConstructor
@Tag(name = "Dark Store", description = "Dark store (micro-warehouse) management APIs")
public class DarkStoreController {

    private final DarkStoreService darkStoreService;

    @PostMapping
    @Operation(summary = "Create dark store", description = "Registers a new dark store with location and operating hours")
    public ResponseEntity<ApiResponse<DarkStoreResponse>> create(@Valid @RequestBody DarkStoreRequest request) {
        DarkStoreResponse response = darkStoreService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Dark store created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update dark store", description = "Updates details of an existing dark store")
    public ResponseEntity<ApiResponse<DarkStoreResponse>> update(@PathVariable Long id, @Valid @RequestBody DarkStoreRequest request) {
        DarkStoreResponse response = darkStoreService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Dark store updated successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get dark store by id")
    public ResponseEntity<ApiResponse<DarkStoreResponse>> getById(@PathVariable Long id) {
        DarkStoreResponse response = darkStoreService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Dark store fetched successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all active dark stores")
    public ResponseEntity<ApiResponse<List<DarkStoreResponse>>> getAll() {
        List<DarkStoreResponse> response = darkStoreService.getAll();
        return ResponseEntity.ok(ApiResponse.success("Dark stores fetched successfully", response));
    }

    @GetMapping("/nearest")
    @Operation(summary = "Find nearest dark store", description = "Returns the closest active dark store to given coordinates")
    public ResponseEntity<ApiResponse<DarkStoreResponse>> findNearest(
            @Parameter(description = "User latitude") @RequestParam Double latitude,
            @Parameter(description = "User longitude") @RequestParam Double longitude) {
        DarkStoreResponse response = darkStoreService.findNearestStore(latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success("Nearest dark store fetched successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate dark store", description = "Soft-deletes a dark store by marking it inactive")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        darkStoreService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Dark store deactivated successfully", null));
    }
}
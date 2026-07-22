package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.InventoryRequest;
import com.jpnproject.quickcarts.dto.InventoryResponse;
import com.jpnproject.quickcarts.dto.StockUpdateRequest;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST APIs for store-level inventory (stock) management.
 */
@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory", description = "Store-level stock management APIs")
public class InventoryController {

    private final InventoryService inventoryService;

    @PostMapping
    @Operation(summary = "Create inventory record", description = "Maps a product variant to a dark store with initial stock")
    public ResponseEntity<ApiResponse<InventoryResponse>> create(@Valid @RequestBody InventoryRequest request) {
        InventoryResponse response = inventoryService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Inventory created successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get inventory by id")
    public ResponseEntity<ApiResponse<InventoryResponse>> getById(@PathVariable Long id) {
        InventoryResponse response = inventoryService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Inventory fetched successfully", response));
    }

    @GetMapping("/store/{darkStoreId}")
    @Operation(summary = "Get inventory by dark store", description = "Lists all stock records for a given dark store")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getByStore(@PathVariable Long darkStoreId) {
        List<InventoryResponse> response = inventoryService.getByStore(darkStoreId);
        return ResponseEntity.ok(ApiResponse.success("Store inventory fetched successfully", response));
    }

    @GetMapping("/store/{darkStoreId}/low-stock")
    @Operation(summary = "Get low stock items", description = "Lists items at or below the low-stock threshold for a store")
    public ResponseEntity<ApiResponse<List<InventoryResponse>>> getLowStock(@PathVariable Long darkStoreId) {
        List<InventoryResponse> response = inventoryService.getLowStock(darkStoreId);
        return ResponseEntity.ok(ApiResponse.success("Low stock items fetched successfully", response));
    }

    @PatchMapping("/{id}/increase")
    @Operation(summary = "Increase stock", description = "Adds quantity to available stock, e.g. on restock")
    public ResponseEntity<ApiResponse<InventoryResponse>> increaseStock(@PathVariable Long id, @Valid @RequestBody StockUpdateRequest request) {
        InventoryResponse response = inventoryService.increaseStock(id, request);
        return ResponseEntity.ok(ApiResponse.success("Stock increased successfully", response));
    }

    @PatchMapping("/{id}/decrease")
    @Operation(summary = "Decrease stock", description = "Removes quantity from available stock, e.g. damage or expiry")
    public ResponseEntity<ApiResponse<InventoryResponse>> decreaseStock(@PathVariable Long id, @Valid @RequestBody StockUpdateRequest request) {
        InventoryResponse response = inventoryService.decreaseStock(id, request);
        return ResponseEntity.ok(ApiResponse.success("Stock decreased successfully", response));
    }
}
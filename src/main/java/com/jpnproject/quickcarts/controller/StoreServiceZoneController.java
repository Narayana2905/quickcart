package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.StoreServiceZoneRequest;
import com.jpnproject.quickcarts.dto.StoreServiceZoneResponse;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.StoreServiceZoneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST APIs for pincode-to-dark-store serviceability mapping.
 */
@RestController
@RequestMapping("/api/v1/service-zones")
@RequiredArgsConstructor
@Tag(name = "Service Zone", description = "Delivery serviceability mapping APIs")
public class StoreServiceZoneController {

    private final StoreServiceZoneService zoneService;

    @PostMapping
    @Operation(summary = "Map pincode to dark store", description = "Registers a pincode as serviceable by a given dark store")
    public ResponseEntity<ApiResponse<StoreServiceZoneResponse>> create(@Valid @RequestBody StoreServiceZoneRequest request) {
        StoreServiceZoneResponse response = zoneService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service zone created successfully", response));
    }

    @GetMapping("/check")
    @Operation(summary = "Check serviceability", description = "Checks if a pincode is currently serviceable")
    public ResponseEntity<ApiResponse<StoreServiceZoneResponse>> checkServiceability(@RequestParam String pincode) {
        StoreServiceZoneResponse response = zoneService.checkServiceability(pincode);
        return ResponseEntity.ok(ApiResponse.success("Pincode is serviceable", response));
    }

    @GetMapping("/store/{darkStoreId}")
    @Operation(summary = "Get service zones by store", description = "Lists all pincodes served by a given dark store")
    public ResponseEntity<ApiResponse<List<StoreServiceZoneResponse>>> getByStore(@PathVariable Long darkStoreId) {
        List<StoreServiceZoneResponse> response = zoneService.getByStore(darkStoreId);
        return ResponseEntity.ok(ApiResponse.success("Service zones fetched successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate service zone", description = "Marks a pincode-store mapping as inactive")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        zoneService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Service zone deactivated successfully", null));
    }
}
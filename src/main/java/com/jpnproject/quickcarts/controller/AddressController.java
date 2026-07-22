package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.AddressRequest;
import com.jpnproject.quickcarts.dto.AddressResponse;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.AddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST APIs for managing a user's saved delivery addresses.
 * Ownership is always derived from the authenticated principal.
 */
@RestController
@RequestMapping("/api/v1/addresses")
@RequiredArgsConstructor
@Tag(name = "Address", description = "User saved-address management APIs")
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    @Operation(summary = "Add address")
    public ResponseEntity<ApiResponse<AddressResponse>> create(Authentication authentication, @Valid @RequestBody AddressRequest request) {
        AddressResponse response = addressService.create(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address added successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update address")
    public ResponseEntity<ApiResponse<AddressResponse>> update(Authentication authentication, @PathVariable Long id, @Valid @RequestBody AddressRequest request) {
        AddressResponse response = addressService.update(authentication.getName(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get my addresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAll(Authentication authentication) {
        List<AddressResponse> response = addressService.getAll(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Addresses fetched successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete address")
    public ResponseEntity<ApiResponse<Void>> delete(Authentication authentication, @PathVariable Long id) {
        addressService.delete(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully", null));
    }
}
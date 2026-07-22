package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.BrandRequest;
import com.jpnproject.quickcarts.dto.BrandResponse;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.BrandService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
@Tag(name = "Brand", description = "Brand management APIs")
public class BrandController {

    private final BrandService brandService;

    @PostMapping
    @Operation(summary = "Create a new brand")
    public ResponseEntity<ApiResponse<BrandResponse>> create(@Valid @RequestBody BrandRequest request) {
        BrandResponse response = brandService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Brand created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing brand")
    public ResponseEntity<ApiResponse<BrandResponse>> update(@PathVariable Long id, @Valid @RequestBody BrandRequest request) {
        BrandResponse response = brandService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Brand updated successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get brand by id")
    public ResponseEntity<ApiResponse<BrandResponse>> getById(@PathVariable Long id) {
        BrandResponse response = brandService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Brand fetched successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all brands")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getAll() {
        List<BrandResponse> response = brandService.getAll();
        return ResponseEntity.ok(ApiResponse.success("Brands fetched successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete brand by id")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        brandService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Brand deleted successfully", null));
    }
}
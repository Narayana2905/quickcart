package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.ProductRequest;
import com.jpnproject.quickcarts.dto.ProductResponse;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Product", description = "Product management APIs")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @Operation(summary = "Create a new product with variants and images")
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing product")
    public ResponseEntity<ApiResponse<ProductResponse>> update(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by id")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        ProductResponse response = productService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Product fetched successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all active products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getAll() {
        List<ProductResponse> response = productService.getAll();
        return ResponseEntity.ok(ApiResponse.success("Products fetched successfully", response));
    }

    @GetMapping("/search")
    @Operation(summary = "Search products by name keyword")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> search(
            @Parameter(description = "search keyword") @RequestParam String keyword) {
        List<ProductResponse> response = productService.search(keyword);
        return ResponseEntity.ok(ApiResponse.success("Search results fetched successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product by id")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }
}
package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.ProductRatingSummaryResponse;
import com.jpnproject.quickcarts.dto.ReviewRequest;
import com.jpnproject.quickcarts.dto.ReviewResponse;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Tag(name = "Review", description = "Product review and rating APIs")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @Operation(summary = "Add or update review", description = "One review per user per product; resubmitting updates the existing one")
    public ResponseEntity<ApiResponse<ReviewResponse>> upsert(Authentication authentication, @Valid @RequestBody ReviewRequest request) {
        ReviewResponse response = reviewService.upsert(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Review saved successfully", response));
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get reviews and rating summary for a product")
    public ResponseEntity<ApiResponse<ProductRatingSummaryResponse>> getByProduct(@PathVariable Long productId) {
        ProductRatingSummaryResponse response = reviewService.getByProduct(productId);
        return ResponseEntity.ok(ApiResponse.success("Reviews fetched successfully", response));
    }
}
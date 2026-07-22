package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.*;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
@Tag(name = "Coupon", description = "Coupon and discount APIs")
public class CouponController {

    private final CouponService couponService;

    @PostMapping
    @Operation(summary = "Create coupon")
    public ResponseEntity<ApiResponse<CouponResponse>> create(@Valid @RequestBody CouponRequest request) {
        CouponResponse response = couponService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Coupon created successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all coupons")
    public ResponseEntity<ApiResponse<List<CouponResponse>>> getAll() {
        List<CouponResponse> response = couponService.getAll();
        return ResponseEntity.ok(ApiResponse.success("Coupons fetched successfully", response));
    }

    @PostMapping("/validate")
    @Operation(summary = "Validate and preview coupon discount", description = "Does not mark the coupon as used; call this before checkout")
    public ResponseEntity<ApiResponse<ApplyCouponResponse>> validate(@Valid @RequestBody ApplyCouponRequest request) {
        ApplyCouponResponse response = couponService.validate(request);
        return ResponseEntity.ok(ApiResponse.success("Coupon applied successfully", response));
    }
}
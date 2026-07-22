package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.WishlistResponse;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Save-for-later product wishlist APIs")
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/{productId}")
    @Operation(summary = "Add product to wishlist")
    public ResponseEntity<ApiResponse<WishlistResponse>> add(Authentication authentication, @PathVariable Long productId) {
        WishlistResponse response = wishlistService.add(authentication.getName(), productId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Added to wishlist", response));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Remove product from wishlist")
    public ResponseEntity<ApiResponse<Void>> remove(Authentication authentication, @PathVariable Long productId) {
        wishlistService.remove(authentication.getName(), productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }

    @GetMapping
    @Operation(summary = "Get my wishlist")
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getAll(Authentication authentication) {
        List<WishlistResponse> response = wishlistService.getAll(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Wishlist fetched successfully", response));
    }
}
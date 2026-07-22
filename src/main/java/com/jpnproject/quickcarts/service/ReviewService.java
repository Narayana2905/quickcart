package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.ProductRatingSummaryResponse;
import com.jpnproject.quickcarts.dto.ReviewRequest;
import com.jpnproject.quickcarts.dto.ReviewResponse;

public interface ReviewService {
    /** Adds or updates the authenticated user's review for a product (one review per user per product). */
    ReviewResponse upsert(String username, ReviewRequest request);

    ProductRatingSummaryResponse getByProduct(Long productId);
}
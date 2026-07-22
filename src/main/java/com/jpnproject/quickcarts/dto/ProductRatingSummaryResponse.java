package com.jpnproject.quickcarts.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRatingSummaryResponse {
    private Long productId;
    private Double averageRating;
    private Long totalReviews;
    private List<ReviewResponse> reviews;
}
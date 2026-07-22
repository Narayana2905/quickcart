package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.ProductRatingSummaryResponse;
import com.jpnproject.quickcarts.dto.ReviewRequest;
import com.jpnproject.quickcarts.dto.ReviewResponse;
import com.jpnproject.quickcarts.entity.AppUser;
import com.jpnproject.quickcarts.entity.Product;
import com.jpnproject.quickcarts.entity.ProductReview;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.ProductRepository;
import com.jpnproject.quickcarts.repository.ProductReviewRepository;
import com.jpnproject.quickcarts.repository.UserRepository;
import com.jpnproject.quickcarts.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ProductReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewResponse upsert(String username, ReviewRequest request) {
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        ProductReview review = reviewRepository.findByProductIdAndUserId(product.getId(), user.getId())
                .orElseGet(() -> {
                    ProductReview newReview = new ProductReview();
                    newReview.setProduct(product);
                    newReview.setUser(user);
                    return newReview;
                });

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return toResponse(reviewRepository.save(review));
    }

    @Override
    public ProductRatingSummaryResponse getByProduct(Long productId) {
        var reviews = reviewRepository.findByProductId(productId).stream().map(this::toResponse).toList();
        Double avg = reviewRepository.findAverageRatingByProductId(productId);
        return new ProductRatingSummaryResponse(productId, avg != null ? avg : 0.0, (long) reviews.size(), reviews);
    }

    private ReviewResponse toResponse(ProductReview review) {
        return new ReviewResponse(review.getId(), review.getProduct().getId(), review.getUser().getUsername(), review.getRating(), review.getComment());
    }
}
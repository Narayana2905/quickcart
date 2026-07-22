package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.*;

import java.util.List;

public interface CouponService {
    CouponResponse create(CouponRequest request);
    List<CouponResponse> getAll();

    /** Validates a coupon against cart total and returns computed discount, without marking it used. */
    ApplyCouponResponse validate(ApplyCouponRequest request);

    /** Increments usedCount — call this on successful order checkout, after validate(). */
    void markUsed(String code);
}
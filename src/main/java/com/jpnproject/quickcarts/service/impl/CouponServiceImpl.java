package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.*;
import com.jpnproject.quickcarts.entity.Coupon;
import com.jpnproject.quickcarts.entity.DiscountType;
import com.jpnproject.quickcarts.exception.BadRequestException;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.CouponRepository;
import com.jpnproject.quickcarts.service.CouponService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;

    @Override
    public CouponResponse create(CouponRequest request) {
        Coupon coupon = new Coupon();
        BeanUtils.copyProperties(request, coupon);
        coupon.setCode(request.getCode().toUpperCase());
        return toResponse(couponRepository.save(coupon));
    }

    @Override
    public List<CouponResponse> getAll() {
        return couponRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public ApplyCouponResponse validate(ApplyCouponRequest request) {
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndActiveTrue(request.getCode())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or inactive coupon code"));

        if (coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Coupon has expired");
        }
        if (coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit reached");
        }
        if (request.getCartTotal().compareTo(coupon.getMinOrderValue()) < 0) {
            throw new BadRequestException("Cart total does not meet minimum order value of " + coupon.getMinOrderValue());
        }

        BigDecimal discount = coupon.getDiscountType() == DiscountType.FLAT
                ? coupon.getDiscountValue()
                : request.getCartTotal().multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        if (coupon.getMaxDiscountAmount() != null && discount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
            discount = coupon.getMaxDiscountAmount();
        }
        if (discount.compareTo(request.getCartTotal()) > 0) {
            discount = request.getCartTotal();
        }

        BigDecimal finalAmount = request.getCartTotal().subtract(discount);
        return new ApplyCouponResponse(coupon.getCode(), discount, finalAmount);
    }

    @Override
    public void markUsed(String code) {
        Coupon coupon = couponRepository.findByCodeIgnoreCaseAndActiveTrue(code)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or inactive coupon code"));
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);
    }

    private CouponResponse toResponse(Coupon coupon) {
        CouponResponse response = new CouponResponse();
        BeanUtils.copyProperties(coupon, response);
        return response;
    }
}
package com.jpnproject.quickcarts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "coupons")
public class Coupon extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Coupon code is required")
    @Column(nullable = false, unique = true)
    private String code;

    @NotNull(message = "Discount type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @Positive(message = "Discount value must be positive")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @NotNull(message = "Minimum order value is required")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal minOrderValue = BigDecimal.ZERO;

    /** Cap on discount amount, applicable for PERCENTAGE type. Null = no cap. */
    private BigDecimal maxDiscountAmount;

    @NotNull(message = "Expiry date is required")
    @Future(message = "Expiry date must be in the future")
    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @NotNull(message = "Usage limit is required")
    @Min(value = 1, message = "Usage limit must be at least 1")
    @Column(nullable = false)
    private Integer usageLimit;

    @Column(nullable = false)
    private Integer usedCount = 0;

    private boolean active = true;
}
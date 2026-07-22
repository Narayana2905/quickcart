package com.jpnproject.quickcarts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a placed order, created from a user's cart at checkout.
 */
@Getter
@Setter
@Entity
@Table(name = "orders")
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User id is required")
    @Column(nullable = false)
    private Long userId;

    @NotNull(message = "Dark store is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dark_store_id", nullable = false)
    private DarkStore darkStore;

    @NotBlank(message = "Delivery address is required")
    @Column(nullable = false)
    private String deliveryAddress;

    @NotBlank(message = "Delivery pincode is required")
    @Column(nullable = false)
    private String deliveryPincode;

    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @NotNull(message = "Delivery fee is required")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    /** Coupon code applied at checkout, if any. */
    private String couponCode;

    /** Discount amount deducted from the item subtotal, defaults to zero when no coupon is applied. */
    @NotNull(message = "Discount amount is required")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PLACED;

    private String cancellationReason;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
}
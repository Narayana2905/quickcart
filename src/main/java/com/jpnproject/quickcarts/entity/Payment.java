package com.jpnproject.quickcarts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Represents a payment transaction against an order.
 * One order can have multiple payment attempts (e.g. retry after failure).
 */
@Getter
@Setter
@Entity
@Table(name = "payments")
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Order is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @NotNull(message = "Payment status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;

    /** Reference id returned by external payment gateway (null for COD). */
    private String gatewayTransactionId;

    private String failureReason;
}
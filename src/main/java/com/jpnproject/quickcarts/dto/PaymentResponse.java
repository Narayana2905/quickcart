package com.jpnproject.quickcarts.dto;

import com.jpnproject.quickcarts.entity.PaymentMethod;
import com.jpnproject.quickcarts.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private BigDecimal amount;
    private PaymentMethod method;
    private PaymentStatus status;
    private String gatewayTransactionId;
    private String failureReason;
    private LocalDateTime createdAt;
}
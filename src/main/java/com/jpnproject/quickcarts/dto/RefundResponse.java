package com.jpnproject.quickcarts.dto;

import com.jpnproject.quickcarts.entity.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RefundResponse {
    private Long id;
    private Long paymentId;
    private BigDecimal amount;
    private String reason;
    private PaymentStatus status;
}
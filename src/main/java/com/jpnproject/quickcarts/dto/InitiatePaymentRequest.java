package com.jpnproject.quickcarts.dto;

import com.jpnproject.quickcarts.entity.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InitiatePaymentRequest {

    @NotNull(message = "Order id is required")
    private Long orderId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod method;
}
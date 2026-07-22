package com.jpnproject.quickcarts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/** Simulates the gateway webhook/callback payload confirming payment result. */
@Getter
@Setter
public class PaymentCallbackRequest {

    @NotNull(message = "Success flag is required")
    private Boolean success;

    @NotBlank(message = "Gateway transaction id is required")
    private String gatewayTransactionId;

    private String failureReason;
}
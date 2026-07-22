package com.jpnproject.quickcarts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckoutRequest {

    @NotNull(message = "User id is required")
    private Long userId;

    @NotBlank(message = "Delivery address is required")
    private String deliveryAddress;

    @NotBlank(message = "Delivery pincode is required")
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid pincode")
    private String deliveryPincode;

    /** Optional coupon code to apply at checkout. */
    private String couponCode;
}
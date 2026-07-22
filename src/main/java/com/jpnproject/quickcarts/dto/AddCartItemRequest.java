package com.jpnproject.quickcarts.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddCartItemRequest {

    @NotNull(message = "User id is required")
    private Long userId;

    @NotNull(message = "Dark store id is required")
    private Long darkStoreId;

    @NotNull(message = "Product variant id is required")
    private Long productVariantId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
}
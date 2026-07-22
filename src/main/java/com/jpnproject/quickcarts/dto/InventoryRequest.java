package com.jpnproject.quickcarts.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InventoryRequest {

    @NotNull(message = "Dark store id is required")
    private Long darkStoreId;

    @NotNull(message = "Product variant id is required")
    private Long productVariantId;

    @NotNull(message = "Available quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer availableQuantity;

    @Min(value = 0)
    private Integer lowStockThreshold;
}
package com.jpnproject.quickcarts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StockUpdateRequest {

    @NotNull(message = "Quantity is required")
    private Integer quantity;
}
package com.jpnproject.quickcarts.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignRiderRequest {

    @NotNull(message = "Order id is required")
    private Long orderId;

    @NotNull(message = "Rider id is required")
    private Long riderId;
}
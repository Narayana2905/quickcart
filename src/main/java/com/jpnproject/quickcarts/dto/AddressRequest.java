package com.jpnproject.quickcarts.dto;

import com.jpnproject.quickcarts.entity.AddressType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressRequest {

    @NotBlank(message = "Label is required")
    @Size(max = 50)
    private String label;

    @NotNull(message = "Address type is required")
    private AddressType type;

    @NotBlank(message = "Address line is required")
    @Size(max = 255)
    private String addressLine;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid pincode")
    private String pincode;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private Double longitude;

    private boolean isDefault;
}
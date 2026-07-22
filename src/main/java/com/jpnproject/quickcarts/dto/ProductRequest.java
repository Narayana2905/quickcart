package com.jpnproject.quickcarts.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    @Size(max = 150)
    private String name;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "MRP is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "MRP must be positive")
    private BigDecimal mrp;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Selling price must be positive")
    private BigDecimal sellingPrice;

    @NotBlank(message = "Unit is required")
    @Pattern(regexp = "^(kg|g|l|ml|pcs|pack)$", message = "Invalid unit")
    private String unit;

    @NotNull(message = "Unit value is required")
    @Positive(message = "Unit value must be positive")
    private Double unitValue;

    @NotNull(message = "Category id is required")
    private Long categoryId;

    private Long brandId;

    @Valid
    private List<ProductVariantRequest> variants;

    @Valid
    private List<ProductImageRequest> images;
}
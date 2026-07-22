package com.jpnproject.quickcarts.dto;

import com.jpnproject.quickcarts.dto.ProductImageResponse;
import com.jpnproject.quickcarts.dto.ProductVariantResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal mrp;
    private BigDecimal sellingPrice;
    private String unit;
    private Double unitValue;
    private Long categoryId;
    private String categoryName;
    private Long brandId;
    private String brandName;
    private boolean active;
    private List<ProductVariantResponse> variants;
    private List<ProductImageResponse> images;
}
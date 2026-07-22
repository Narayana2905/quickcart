package com.jpnproject.quickcarts.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {
    private Long id;
    private Long darkStoreId;
    private String darkStoreName;
    private Long productVariantId;
    private String variantName;
    private Integer availableQuantity;
    private Integer reservedQuantity;
    private Integer lowStockThreshold;
}
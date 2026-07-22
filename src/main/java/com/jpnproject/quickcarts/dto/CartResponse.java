package com.jpnproject.quickcarts.dto;

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
public class CartResponse {
    private Long id;
    private Long userId;
    private Long darkStoreId;
    private String darkStoreName;
    private List<CartItemResponse> items;
    private BigDecimal totalAmount;
    private Integer totalItems;
}
package com.jpnproject.quickcarts.dto;

import com.jpnproject.quickcarts.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private Long userId;
    private Long darkStoreId;
    private String darkStoreName;
    private String deliveryAddress;
    private String deliveryPincode;
    private BigDecimal itemsSubtotal;
    private String couponCode;
    private BigDecimal discountAmount;
    private BigDecimal deliveryFee;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String cancellationReason;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;
}
package com.jpnproject.quickcarts.dto;

import com.jpnproject.quickcarts.entity.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryAssignmentResponse {
    private Long id;
    private Long orderId;
    private Long riderId;
    private String riderName;
    private String riderPhone;
    private DeliveryStatus status;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
    private String failureReason;
}
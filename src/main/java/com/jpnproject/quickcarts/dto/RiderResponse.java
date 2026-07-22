package com.jpnproject.quickcarts.dto;

import com.jpnproject.quickcarts.entity.RiderStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RiderResponse {
    private Long id;
    private String name;
    private String phone;
    private String vehicleNumber;
    private Long darkStoreId;
    private RiderStatus status;
    private Double currentLatitude;
    private Double currentLongitude;
    private boolean active;
}
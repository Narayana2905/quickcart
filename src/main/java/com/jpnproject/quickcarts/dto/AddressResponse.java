package com.jpnproject.quickcarts.dto;

import com.jpnproject.quickcarts.entity.AddressType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
    private Long id;
    private String label;
    private AddressType type;
    private String addressLine;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private boolean isDefault;
}
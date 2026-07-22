package com.jpnproject.quickcarts.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StoreServiceZoneResponse {
    private Long id;
    private Long darkStoreId;
    private String darkStoreName;
    private String pincode;
    private boolean active;
}
package com.jpnproject.quickcarts.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DarkStoreResponse {
    private Long id;
    private String name;
    private String address;
    private String pincode;
    private Double latitude;
    private Double longitude;
    private LocalTime openingTime;
    private LocalTime closingTime;
    private boolean active;
}
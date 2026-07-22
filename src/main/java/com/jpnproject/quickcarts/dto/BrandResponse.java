package com.jpnproject.quickcarts.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BrandResponse {
    private Long id;
    private String name;
    private String logoUrl;
    private boolean active;
}
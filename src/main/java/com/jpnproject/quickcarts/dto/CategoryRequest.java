package com.jpnproject.quickcarts.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequest {

    @NotBlank(message = "Category name is required")
    @Size(max = 100)
    private String name;

    @Size(max = 255)
    private String imageUrl;

    private Long parentId; // nullable for root category
}
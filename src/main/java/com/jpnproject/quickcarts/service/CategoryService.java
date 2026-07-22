package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.CategoryRequest;
import com.jpnproject.quickcarts.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse create(CategoryRequest request);
    CategoryResponse update(Long id, CategoryRequest request);
    CategoryResponse getById(Long id);
    List<CategoryResponse> getAllRootCategories();
    void delete(Long id);
}
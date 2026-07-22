package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.ProductRequest;
import com.jpnproject.quickcarts.dto.ProductResponse;

import java.util.List;

public interface ProductService {
    ProductResponse create(ProductRequest request);
    ProductResponse update(Long id, ProductRequest request);
    ProductResponse getById(Long id);
    List<ProductResponse> getAll();
    List<ProductResponse> search(String keyword);
    void delete(Long id);
}
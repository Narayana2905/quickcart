package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.BrandRequest;
import com.jpnproject.quickcarts.dto.BrandResponse;

import java.util.List;

public interface BrandService {
    BrandResponse create(BrandRequest request);
    BrandResponse update(Long id, BrandRequest request);
    BrandResponse getById(Long id);
    List<BrandResponse> getAll();
    void delete(Long id);
}
package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.BrandRequest;
import com.jpnproject.quickcarts.dto.BrandResponse;
import com.jpnproject.quickcarts.entity.Brand;
import com.jpnproject.quickcarts.exception.ResourceInUseException;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.BrandRepository;
import com.jpnproject.quickcarts.repository.ProductRepository;
import com.jpnproject.quickcarts.service.BrandService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    @Override
    public BrandResponse create(BrandRequest request) {
        if (brandRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException("Brand already exists");
        }
        Brand brand = new Brand();
        BeanUtils.copyProperties(request, brand);
        Brand saved = brandRepository.save(brand);
        return toResponse(saved);
    }

    @Override
    public BrandResponse update(Long id, BrandRequest request) {
        Brand brand = findEntity(id);
        BeanUtils.copyProperties(request, brand);
        return toResponse(brandRepository.save(brand));
    }

    @Override
    public BrandResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Override
    public List<BrandResponse> getAll() {
        return brandRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public void delete(Long id) {
        Brand brand = findEntity(id);
        if (productRepository.existsByBrandId(id)) {
            throw new ResourceInUseException("Cannot delete brand, products exist under id: " + id);
        }
        brandRepository.delete(brand);
    }

    private Brand findEntity(Long id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + id));
    }

    private BrandResponse toResponse(Brand brand) {
        BrandResponse response = new BrandResponse();
        BeanUtils.copyProperties(brand, response);
        return response;
    }
}
package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.ProductImageResponse;
import com.jpnproject.quickcarts.dto.ProductRequest;
import com.jpnproject.quickcarts.dto.ProductResponse;
import com.jpnproject.quickcarts.dto.ProductVariantResponse;
import com.jpnproject.quickcarts.entity.*;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.BrandRepository;
import com.jpnproject.quickcarts.repository.CategoryRepository;
import com.jpnproject.quickcarts.repository.ProductRepository;
import com.jpnproject.quickcarts.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    @Override
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        mapRequestToEntity(request, product);
        return toResponse(productRepository.save(product));
    }

    @Override
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findEntity(id);
        mapRequestToEntity(request, product);
        return toResponse(productRepository.save(product));
    }

    @Override
    public ProductResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Override
    public List<ProductResponse> getAll() {
        return productRepository.findByActiveTrue().stream().map(this::toResponse).toList();
    }

    @Override
    public List<ProductResponse> search(String keyword) {
        return productRepository.searchByNameOrCategoryName(keyword).stream().map(this::toResponse).toList();
    }

    @Override
    public void delete(Long id) {
        productRepository.delete(findEntity(id));
    }

    private void mapRequestToEntity(ProductRequest request, Product product) {
        BeanUtils.copyProperties(request, product, "categoryId", "brandId", "variants", "images");

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        product.setCategory(category);

        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new ResourceNotFoundException("Brand not found with id: " + request.getBrandId()));
            product.setBrand(brand);
        }

        product.getVariants().clear();
        if (request.getVariants() != null) {
            List<ProductVariant> variants = new ArrayList<>();
            request.getVariants().forEach(v -> {
                ProductVariant variant = new ProductVariant();
                BeanUtils.copyProperties(v, variant);
                variant.setProduct(product);
                variants.add(variant);
            });
            product.getVariants().addAll(variants);
        }

        product.getImages().clear();
        if (request.getImages() != null) {
            List<ProductImage> images = new ArrayList<>();
            request.getImages().forEach(i -> {
                ProductImage image = new ProductImage();
                BeanUtils.copyProperties(i, image);
                image.setProduct(product);
                images.add(image);
            });
            product.getImages().addAll(images);
        }
    }

    private Product findEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    private ProductResponse toResponse(Product product) {
        ProductResponse response = new ProductResponse();
        BeanUtils.copyProperties(product, response);
        response.setCategoryId(product.getCategory().getId());
        response.setCategoryName(product.getCategory().getName());
        if (product.getBrand() != null) {
            response.setBrandId(product.getBrand().getId());
            response.setBrandName(product.getBrand().getName());
        }
        response.setVariants(product.getVariants().stream().map(v -> {
            ProductVariantResponse vr = new ProductVariantResponse();
            BeanUtils.copyProperties(v, vr);
            return vr;
        }).toList());
        response.setImages(product.getImages().stream().map(i -> {
            ProductImageResponse ir = new ProductImageResponse();
            BeanUtils.copyProperties(i, ir);
            return ir;
        }).toList());
        return response;
    }
}
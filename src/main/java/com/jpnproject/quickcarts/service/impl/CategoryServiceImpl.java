package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.CategoryRequest;
import com.jpnproject.quickcarts.dto.CategoryResponse;
import com.jpnproject.quickcarts.entity.Category;
import com.jpnproject.quickcarts.exception.ResourceInUseException;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.CategoryRepository;
import com.jpnproject.quickcarts.repository.ProductRepository;
import com.jpnproject.quickcarts.service.CategoryService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public CategoryResponse create(CategoryRequest request) {
        Category category = new Category();
        BeanUtils.copyProperties(request, category, "parentId");
        if (request.getParentId() != null) {
            category.setParent(findEntity(request.getParentId()));
        }
        return toResponse(categoryRepository.save(category));
    }

    @Override
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = findEntity(id);
        BeanUtils.copyProperties(request, category, "parentId");
        if (request.getParentId() != null) {
            category.setParent(findEntity(request.getParentId()));
        } else {
            category.setParent(null);
        }
        return toResponse(categoryRepository.save(category));
    }

    @Override
    public CategoryResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Override
    public List<CategoryResponse> getAllRootCategories() {
        return categoryRepository.findByParentIsNull().stream().map(this::toResponse).toList();
    }

    @Override
    public void delete(Long id) {
        Category category = findEntity(id);
        if (categoryRepository.existsByParentId(id)) {
            throw new ResourceInUseException("Cannot delete category, sub-categories exist under id: " + id);
        }
        if (productRepository.existsByCategoryId(id)) {
            throw new ResourceInUseException("Cannot delete category, products exist under id: " + id);
        }
        categoryRepository.delete(category);
    }

    private Category findEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }

    private CategoryResponse toResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        BeanUtils.copyProperties(category, response);
        response.setParentId(category.getParent() != null ? category.getParent().getId() : null);
        List<CategoryResponse> subCategories = categoryRepository.findByParentId(category.getId())
                .stream().map(this::toResponse).toList();
        response.setSubCategories(subCategories);
        return response;
    }
}
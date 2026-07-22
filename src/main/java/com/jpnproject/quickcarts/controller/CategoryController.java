package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.CategoryRequest;
import com.jpnproject.quickcarts.dto.CategoryResponse;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Category", description = "Category management APIs")
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @Operation(summary = "Create a new category")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing category")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by id")
    public ResponseEntity<ApiResponse<CategoryResponse>> getById(@PathVariable Long id) {
        CategoryResponse response = categoryService.getById(id);
        return ResponseEntity.ok(ApiResponse.success("Category fetched successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all root categories with sub-categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAll() {
        List<CategoryResponse> response = categoryService.getAllRootCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories fetched successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category by id")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
}
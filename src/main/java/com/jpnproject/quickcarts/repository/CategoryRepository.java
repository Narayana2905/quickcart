package com.jpnproject.quickcarts.repository;

import com.jpnproject.quickcarts.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByParentIsNull();
    List<Category> findByParentId(Long parentId);
    boolean existsByParentId(Long parentId);
}
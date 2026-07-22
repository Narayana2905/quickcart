package com.jpnproject.quickcarts.repository;

import com.jpnproject.quickcarts.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByBrandId(Long brandId);

    List<Product> findByActiveTrue();
    boolean existsByCategoryId(Long categoryId);
    boolean existsByBrandId(Long brandId);
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByName(@Param("keyword") String keyword);
}
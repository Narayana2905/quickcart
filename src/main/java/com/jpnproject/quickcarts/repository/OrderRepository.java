package com.jpnproject.quickcarts.repository;

import com.jpnproject.quickcarts.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Order> findByDarkStoreId(Long darkStoreId);
}
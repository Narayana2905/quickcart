package com.jpnproject.quickcarts.repository;

import com.jpnproject.quickcarts.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByOrderId(Long orderId);
    Optional<Payment> findTopByOrderIdOrderByCreatedAtDesc(Long orderId);
}
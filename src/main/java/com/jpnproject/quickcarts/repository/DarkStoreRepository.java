package com.jpnproject.quickcarts.repository;

import com.jpnproject.quickcarts.entity.DarkStore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DarkStoreRepository extends JpaRepository<DarkStore, Long> {
    List<DarkStore> findByActiveTrue();
    List<DarkStore> findByPincode(String pincode);
}
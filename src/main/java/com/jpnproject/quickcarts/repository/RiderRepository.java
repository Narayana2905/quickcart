package com.jpnproject.quickcarts.repository;

import com.jpnproject.quickcarts.entity.Rider;
import com.jpnproject.quickcarts.entity.RiderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RiderRepository extends JpaRepository<Rider, Long> {
    List<Rider> findByDarkStoreIdAndStatus(Long darkStoreId, RiderStatus status);
    List<Rider> findByActiveTrue();
}
package com.jpnproject.quickcarts.repository;

import com.jpnproject.quickcarts.entity.StoreServiceZone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StoreServiceZoneRepository extends JpaRepository<StoreServiceZone, Long> {
    Optional<StoreServiceZone> findByPincodeAndActiveTrue(String pincode);
    List<StoreServiceZone> findByDarkStoreId(Long darkStoreId);
}
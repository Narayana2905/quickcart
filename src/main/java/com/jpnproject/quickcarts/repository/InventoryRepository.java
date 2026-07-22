package com.jpnproject.quickcarts.repository;

import com.jpnproject.quickcarts.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByDarkStoreId(Long darkStoreId);
    Optional<Inventory> findByDarkStoreIdAndProductVariantId(Long darkStoreId, Long productVariantId);

    @Query("SELECT i FROM Inventory i WHERE i.darkStore.id = :storeId AND (i.availableQuantity - i.reservedQuantity) <= i.lowStockThreshold")
    List<Inventory> findLowStockByStore(@Param("storeId") Long storeId);
}
package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.InventoryRequest;
import com.jpnproject.quickcarts.dto.InventoryResponse;
import com.jpnproject.quickcarts.dto.StockUpdateRequest;

import java.util.List;

/**
 * Service contract for store-level inventory management.
 */
public interface InventoryService {

    /** Creates an inventory record mapping a product variant to a dark store's stock. */
    InventoryResponse create(InventoryRequest request);

    /** Fetches inventory by id. */
    InventoryResponse getById(Long id);

    /** Fetches all inventory records for a given dark store. */
    List<InventoryResponse> getByStore(Long darkStoreId);

    /** Increases available stock (restock). */
    InventoryResponse increaseStock(Long id, StockUpdateRequest request);

    /** Decreases available stock (manual adjustment / damage / expiry). */
    InventoryResponse decreaseStock(Long id, StockUpdateRequest request);

    /** Reserves stock for an order, moving quantity from available to reserved. */
    void reserveStock(Long darkStoreId, Long productVariantId, Integer quantity);

    /** Releases previously reserved stock back to available (on order cancellation). */
    void releaseStock(Long darkStoreId, Long productVariantId, Integer quantity);

    /** Fetches inventory records at/below low-stock threshold for a store. */
    List<InventoryResponse> getLowStock(Long darkStoreId);
}
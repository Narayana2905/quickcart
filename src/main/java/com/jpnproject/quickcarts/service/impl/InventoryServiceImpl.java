package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.InventoryRequest;
import com.jpnproject.quickcarts.dto.InventoryResponse;
import com.jpnproject.quickcarts.dto.StockUpdateRequest;
import com.jpnproject.quickcarts.entity.DarkStore;
import com.jpnproject.quickcarts.entity.Inventory;
import com.jpnproject.quickcarts.entity.ProductVariant;
import com.jpnproject.quickcarts.exception.BadRequestException;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.DarkStoreRepository;
import com.jpnproject.quickcarts.repository.InventoryRepository;
import com.jpnproject.quickcarts.repository.ProductVariantRepository;
import com.jpnproject.quickcarts.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implementation of {@link InventoryService}.
 * Manages available/reserved stock quantities per dark store and product variant.
 */
@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryRepository inventoryRepository;
    private final DarkStoreRepository darkStoreRepository;
    private final ProductVariantRepository productVariantRepository;

    @Override
    public InventoryResponse create(InventoryRequest request) {
        DarkStore store = darkStoreRepository.findById(request.getDarkStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Dark store not found with id: " + request.getDarkStoreId()));
        ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found with id: " + request.getProductVariantId()));

        Inventory inventory = new Inventory();
        inventory.setDarkStore(store);
        inventory.setProductVariant(variant);
        inventory.setAvailableQuantity(request.getAvailableQuantity());
        if (request.getLowStockThreshold() != null) {
            inventory.setLowStockThreshold(request.getLowStockThreshold());
        }
        return toResponse(inventoryRepository.save(inventory));
    }

    @Override
    public InventoryResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Override
    public List<InventoryResponse> getByStore(Long darkStoreId) {
        return inventoryRepository.findByDarkStoreId(darkStoreId).stream().map(this::toResponse).toList();
    }

    @Override
    public InventoryResponse increaseStock(Long id, StockUpdateRequest request) {
        Inventory inventory = findEntity(id);
        inventory.setAvailableQuantity(inventory.getAvailableQuantity() + request.getQuantity());
        return toResponse(inventoryRepository.save(inventory));
    }

    @Override
    public InventoryResponse decreaseStock(Long id, StockUpdateRequest request) {
        Inventory inventory = findEntity(id);
        int sellable = inventory.getAvailableQuantity() - inventory.getReservedQuantity();
        if (request.getQuantity() > sellable) {
            throw new BadRequestException("Insufficient stock to decrease");
        }
        inventory.setAvailableQuantity(inventory.getAvailableQuantity() - request.getQuantity());
        return toResponse(inventoryRepository.save(inventory));
    }

    @Override
    public void reserveStock(Long darkStoreId, Long productVariantId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByDarkStoreIdAndProductVariantId(darkStoreId, productVariantId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for given store and variant"));
        int sellable = inventory.getAvailableQuantity() - inventory.getReservedQuantity();
        if (quantity > sellable) {
            throw new BadRequestException("Insufficient stock to reserve");
        }
        inventory.setReservedQuantity(inventory.getReservedQuantity() + quantity);
        inventoryRepository.save(inventory);
    }

    @Override
    public void releaseStock(Long darkStoreId, Long productVariantId, Integer quantity) {
        Inventory inventory = inventoryRepository.findByDarkStoreIdAndProductVariantId(darkStoreId, productVariantId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for given store and variant"));
        int released = Math.max(0, inventory.getReservedQuantity() - quantity);
        inventory.setReservedQuantity(released);
        inventoryRepository.save(inventory);
    }

    @Override
    public List<InventoryResponse> getLowStock(Long darkStoreId) {
        return inventoryRepository.findLowStockByStore(darkStoreId).stream().map(this::toResponse).toList();
    }

    private Inventory findEntity(Long id) {
        return inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found with id: " + id));
    }

    private InventoryResponse toResponse(Inventory inventory) {
        InventoryResponse response = new InventoryResponse();
        BeanUtils.copyProperties(inventory, response);
        response.setDarkStoreId(inventory.getDarkStore().getId());
        response.setDarkStoreName(inventory.getDarkStore().getName());
        response.setProductVariantId(inventory.getProductVariant().getId());
        response.setVariantName(inventory.getProductVariant().getVariantName());
        return response;
    }
}
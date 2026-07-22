package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.DarkStoreRequest;
import com.jpnproject.quickcarts.dto.DarkStoreResponse;

import java.util.List;

/**
 * Service contract for Dark Store (micro-warehouse) management.
 */
public interface DarkStoreService {

    /** Creates a new dark store. */
    DarkStoreResponse create(DarkStoreRequest request);

    /** Updates an existing dark store by id. */
    DarkStoreResponse update(Long id, DarkStoreRequest request);

    /** Fetches a dark store by id. */
    DarkStoreResponse getById(Long id);

    /** Fetches all active dark stores. */
    List<DarkStoreResponse> getAll();

    /** Soft-deletes (deactivates) a dark store. */
    void delete(Long id);

    /** Finds the nearest active dark store to a given lat/long using Haversine distance. */
    DarkStoreResponse findNearestStore(Double latitude, Double longitude);
}
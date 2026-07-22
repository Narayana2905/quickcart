package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.StoreServiceZoneRequest;
import com.jpnproject.quickcarts.dto.StoreServiceZoneResponse;

import java.util.List;

/**
 * Service contract for pincode-to-dark-store serviceability mapping.
 */
public interface StoreServiceZoneService {

    /** Maps a pincode to a dark store, enabling delivery serviceability. */
    StoreServiceZoneResponse create(StoreServiceZoneRequest request);

    /** Checks whether a given pincode is serviceable and returns the mapped store. */
    StoreServiceZoneResponse checkServiceability(String pincode);

    /** Lists all pincodes served by a given dark store. */
    List<StoreServiceZoneResponse> getByStore(Long darkStoreId);

    /** Deactivates a service zone mapping. */
    void delete(Long id);
}
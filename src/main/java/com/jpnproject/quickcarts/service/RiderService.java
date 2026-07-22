package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.RiderRequest;
import com.jpnproject.quickcarts.dto.RiderResponse;
import com.jpnproject.quickcarts.dto.UpdateRiderLocationRequest;

import java.util.List;

public interface RiderService {
    RiderResponse create(RiderRequest request);
    RiderResponse updateLocation(Long id, UpdateRiderLocationRequest request);
    List<RiderResponse> getAvailableByStore(Long darkStoreId);
    RiderResponse getById(Long id);
}
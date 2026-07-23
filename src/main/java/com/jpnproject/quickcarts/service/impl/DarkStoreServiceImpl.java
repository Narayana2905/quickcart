package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.DarkStoreRequest;
import com.jpnproject.quickcarts.dto.DarkStoreResponse;
import com.jpnproject.quickcarts.entity.DarkStore;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.DarkStoreRepository;
import com.jpnproject.quickcarts.service.DarkStoreService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

/**
 * Implementation of {@link DarkStoreService}.
 * Handles CRUD and nearest-store resolution for dark stores.
 */
@Service
@RequiredArgsConstructor
public class DarkStoreServiceImpl implements DarkStoreService {

    private final DarkStoreRepository darkStoreRepository;

    @Override
    public DarkStoreResponse create(DarkStoreRequest request) {
        DarkStore store = new DarkStore();
        BeanUtils.copyProperties(request, store);
        return toResponse(darkStoreRepository.save(store));
    }

    @Override
    public DarkStoreResponse update(Long id, DarkStoreRequest request) {
        DarkStore store = findEntity(id);
        BeanUtils.copyProperties(request, store);
        return toResponse(darkStoreRepository.save(store));
    }

    @Override
    public DarkStoreResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Override
    public List<DarkStoreResponse> getAll() {
        return darkStoreRepository.findByActiveTrue().stream().map(this::toResponse).toList();
    }

    @Override
    public void delete(Long id) {
        DarkStore store = findEntity(id);
        store.setActive(false);
        darkStoreRepository.save(store);
    }

    @Override
    public DarkStoreResponse findNearestStore(Double latitude, Double longitude) {
        List<DarkStore> stores = darkStoreRepository.findByActiveTrue();
        DarkStore nearest = stores.stream()
                .min(Comparator.comparingDouble(s -> distance(latitude, longitude, s.getLatitude(), s.getLongitude())))
                .orElseThrow(() -> new ResourceNotFoundException("No active dark store found"));
        return toResponse(nearest);
    }

    /** Computes distance in KM between two coordinates using the Haversine formula. */
    private double distance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private DarkStore findEntity(Long id) {
        return darkStoreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dark store not found with id: " + id));
    }

    private DarkStoreResponse toResponse(DarkStore store) {
        DarkStoreResponse response = new DarkStoreResponse();
        BeanUtils.copyProperties(store, response);
        return response;
    }
}
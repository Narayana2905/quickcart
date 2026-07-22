package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.StoreServiceZoneRequest;
import com.jpnproject.quickcarts.dto.StoreServiceZoneResponse;
import com.jpnproject.quickcarts.entity.DarkStore;
import com.jpnproject.quickcarts.entity.StoreServiceZone;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.DarkStoreRepository;
import com.jpnproject.quickcarts.repository.StoreServiceZoneRepository;
import com.jpnproject.quickcarts.service.StoreServiceZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implementation of {@link StoreServiceZoneService}.
 * Determines whether a delivery address (by pincode) is serviceable by a dark store.
 */
@Service
@RequiredArgsConstructor
public class StoreServiceZoneServiceImpl implements StoreServiceZoneService {

    private final StoreServiceZoneRepository zoneRepository;
    private final DarkStoreRepository darkStoreRepository;

    @Override
    public StoreServiceZoneResponse create(StoreServiceZoneRequest request) {
        DarkStore store = darkStoreRepository.findById(request.getDarkStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Dark store not found with id: " + request.getDarkStoreId()));

        StoreServiceZone zone = new StoreServiceZone();
        zone.setDarkStore(store);
        zone.setPincode(request.getPincode());
        return toResponse(zoneRepository.save(zone));
    }

    @Override
    public StoreServiceZoneResponse checkServiceability(String pincode) {
        StoreServiceZone zone = zoneRepository.findByPincodeAndActiveTrue(pincode)
                .orElseThrow(() -> new ResourceNotFoundException("Pincode not serviceable: " + pincode));
        return toResponse(zone);
    }

    @Override
    public List<StoreServiceZoneResponse> getByStore(Long darkStoreId) {
        return zoneRepository.findByDarkStoreId(darkStoreId).stream().map(this::toResponse).toList();
    }

    @Override
    public void delete(Long id) {
        StoreServiceZone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service zone not found with id: " + id));
        zone.setActive(false);
        zoneRepository.save(zone);
    }

    private StoreServiceZoneResponse toResponse(StoreServiceZone zone) {
        StoreServiceZoneResponse response = new StoreServiceZoneResponse();
        BeanUtils.copyProperties(zone, response);
        response.setDarkStoreId(zone.getDarkStore().getId());
        response.setDarkStoreName(zone.getDarkStore().getName());
        return response;
    }
}
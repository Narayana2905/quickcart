package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.RiderRequest;
import com.jpnproject.quickcarts.dto.RiderResponse;
import com.jpnproject.quickcarts.dto.UpdateRiderLocationRequest;
import com.jpnproject.quickcarts.entity.DarkStore;
import com.jpnproject.quickcarts.entity.Rider;
import com.jpnproject.quickcarts.entity.RiderStatus;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.DarkStoreRepository;
import com.jpnproject.quickcarts.repository.RiderRepository;
import com.jpnproject.quickcarts.service.RiderService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RiderServiceImpl implements RiderService {

    private final RiderRepository riderRepository;
    private final DarkStoreRepository darkStoreRepository;

    @Override
    public RiderResponse create(RiderRequest request) {
        DarkStore store = darkStoreRepository.findById(request.getDarkStoreId())
                .orElseThrow(() -> new ResourceNotFoundException("Dark store not found with id: " + request.getDarkStoreId()));

        Rider rider = new Rider();
        BeanUtils.copyProperties(request, rider, "darkStoreId");
        rider.setDarkStore(store);
        return toResponse(riderRepository.save(rider));
    }

    @Override
    public RiderResponse updateLocation(Long id, UpdateRiderLocationRequest request) {
        Rider rider = findEntity(id);
        rider.setCurrentLatitude(request.getLatitude());
        rider.setCurrentLongitude(request.getLongitude());
        return toResponse(riderRepository.save(rider));
    }

    @Override
    public List<RiderResponse> getAvailableByStore(Long darkStoreId) {
        return riderRepository.findByDarkStoreIdAndStatus(darkStoreId, RiderStatus.AVAILABLE)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public RiderResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    private Rider findEntity(Long id) {
        return riderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rider not found with id: " + id));
    }

    private RiderResponse toResponse(Rider rider) {
        RiderResponse response = new RiderResponse();
        BeanUtils.copyProperties(rider, response);
        response.setDarkStoreId(rider.getDarkStore().getId());
        return response;
    }
}
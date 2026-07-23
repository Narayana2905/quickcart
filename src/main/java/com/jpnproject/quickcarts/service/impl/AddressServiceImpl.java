package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.AddressRequest;
import com.jpnproject.quickcarts.dto.AddressResponse;
import com.jpnproject.quickcarts.entity.Address;
import com.jpnproject.quickcarts.entity.AppUser;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.AddressRepository;
import com.jpnproject.quickcarts.repository.UserRepository;
import com.jpnproject.quickcarts.service.AddressService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implementation of {@link AddressService}.
 * Address ownership is always resolved from the authenticated username,
 * never a client-supplied userId, to prevent editing another user's address.
 */
@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    public AddressResponse create(String username, AddressRequest request) {
        AppUser user = findUser(username);

        if (request.isDefault()) {
            clearExistingDefault(user.getId());
        }

        Address address = new Address();
        BeanUtils.copyProperties(request, address);
        address.setUser(user);
        return toResponse(addressRepository.save(address));
    }

    @Override
    public AddressResponse update(String username, Long addressId, AddressRequest request) {
        AppUser user = findUser(username);
        Address address = findOwnedAddress(user.getId(), addressId);

        if (request.isDefault() && !address.isDefault()) {
            clearExistingDefault(user.getId());
        }

        BeanUtils.copyProperties(request, address);
        return toResponse(addressRepository.save(address));
    }

    @Override
    public List<AddressResponse> getAll(String username) {
        AppUser user = findUser(username);
        return addressRepository.findByUserId(user.getId()).stream().map(this::toResponse).toList();
    }

    @Override
    public void delete(String username, Long addressId) {
        AppUser user = findUser(username);
        Address address = findOwnedAddress(user.getId(), addressId);
        addressRepository.delete(address);
    }

    private void clearExistingDefault(Long userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId).ifPresent(existing -> {
            existing.setDefault(false);
            addressRepository.save(existing);
        });
    }

    private AppUser findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private Address findOwnedAddress(Long userId, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));
        if (!address.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Address not found with id: " + addressId);
        }
        return address;
    }

    private AddressResponse toResponse(Address address) {
        AddressResponse response = new AddressResponse();
        BeanUtils.copyProperties(address, response);
        return response;
    }
}
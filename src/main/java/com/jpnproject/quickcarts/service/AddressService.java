package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.AddressRequest;
import com.jpnproject.quickcarts.dto.AddressResponse;

import java.util.List;

public interface AddressService {

    /** Adds a new address for a user. If marked default, unsets the previous default. */
    AddressResponse create(String username, AddressRequest request);

    /** Updates an existing address owned by the user. */
    AddressResponse update(String username, Long addressId, AddressRequest request);

    /** Lists all saved addresses for a user. */
    List<AddressResponse> getAll(String username);

    /** Deletes an address owned by the user. */
    void delete(String username, Long addressId);
}
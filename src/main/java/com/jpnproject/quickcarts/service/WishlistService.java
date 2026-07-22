package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.WishlistResponse;

import java.util.List;

public interface WishlistService {
    WishlistResponse add(String username, Long productId);
    void remove(String username, Long productId);
    List<WishlistResponse> getAll(String username);
}
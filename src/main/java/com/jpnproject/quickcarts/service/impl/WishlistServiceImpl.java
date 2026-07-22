package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.WishlistResponse;
import com.jpnproject.quickcarts.entity.AppUser;
import com.jpnproject.quickcarts.entity.Product;
import com.jpnproject.quickcarts.entity.Wishlist;
import com.jpnproject.quickcarts.exception.BadRequestException;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.ProductRepository;
import com.jpnproject.quickcarts.repository.UserRepository;
import com.jpnproject.quickcarts.repository.WishlistRepository;
import com.jpnproject.quickcarts.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public WishlistResponse add(String username, Long productId) {
        AppUser user = findUser(username);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (wishlistRepository.findByUserIdAndProductId(user.getId(), productId).isPresent()) {
            throw new BadRequestException("Product already in wishlist");
        }

        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setProduct(product);
        return toResponse(wishlistRepository.save(wishlist));
    }

    @Override
    public void remove(String username, Long productId) {
        AppUser user = findUser(username);
        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found in wishlist"));
        wishlistRepository.delete(wishlist);
    }

    @Override
    public List<WishlistResponse> getAll(String username) {
        AppUser user = findUser(username);
        return wishlistRepository.findByUserId(user.getId()).stream().map(this::toResponse).toList();
    }

    private AppUser findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    private WishlistResponse toResponse(Wishlist wishlist) {
        return new WishlistResponse(
                wishlist.getId(),
                wishlist.getProduct().getId(),
                wishlist.getProduct().getName(),
                wishlist.getProduct().getSellingPrice()
        );
    }
}
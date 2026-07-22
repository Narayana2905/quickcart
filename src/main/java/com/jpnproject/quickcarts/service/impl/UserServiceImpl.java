package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.RegisterRequest;
import com.jpnproject.quickcarts.dto.UserDto;
import com.jpnproject.quickcarts.entity.AppUser;
import com.jpnproject.quickcarts.entity.Role;
import com.jpnproject.quickcarts.exception.DuplicateResourceException;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.UserRepository;
import com.jpnproject.quickcarts.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number already registered");
        }

        AppUser user = new AppUser();
        BeanUtils.copyProperties(request, user);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER);

        return toDto(userRepository.save(user));
    }

    @Override
    public UserDto getByUsername(String username) {
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return toDto(user);
    }

    private UserDto toDto(AppUser user) {
        UserDto dto = new UserDto();
        BeanUtils.copyProperties(user, dto);
        return dto;
    }
}
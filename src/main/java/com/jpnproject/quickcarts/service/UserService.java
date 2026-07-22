package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.RegisterRequest;
import com.jpnproject.quickcarts.dto.UserDto;

public interface UserService {

    /** Registers a new user with an encoded password. */
    UserDto register(RegisterRequest request);

    /** Fetches a user's public profile by username. */
    UserDto getByUsername(String username);
}
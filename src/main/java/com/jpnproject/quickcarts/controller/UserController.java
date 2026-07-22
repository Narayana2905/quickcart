package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.RegisterRequest;
import com.jpnproject.quickcarts.dto.UserDto;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "User registration and profile APIs")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    @Operation(summary = "Register new user")
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest request) {
        UserDto response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile", description = "Resolves the profile from the authenticated JWT principal")
    public ResponseEntity<ApiResponse<UserDto>> getProfile(Authentication authentication) {
        UserDto response = userService.getByUsername(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", response));
    }
}
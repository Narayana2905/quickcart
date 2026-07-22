package com.jpnproject.quickcarts.controller;

import com.jpnproject.quickcarts.dto.LoginRequest;
import com.jpnproject.quickcarts.dto.LoginResponse;
import com.jpnproject.quickcarts.dto.UserDto;
import com.jpnproject.quickcarts.exception.ApiResponse;
import com.jpnproject.quickcarts.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login and token issuance APIs")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates credentials and returns a JWT bearer token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        User principal = (User) authentication.getPrincipal();
        String token = jwtUtil.generateJwtToken(authentication);

        UserDto userDto = new UserDto();
        userDto.setUsername(principal.getUsername());

        LoginResponse response = new LoginResponse("Login successful", userDto, token);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}
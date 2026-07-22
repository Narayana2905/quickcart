package com.jpnproject.quickcarts.security;

import org.springframework.stereotype.Component;

/**
 * Centralizes all path patterns used for authorization decisions,
 * so SecurityConfig stays declarative and these don't get scattered
 * or duplicated across filter chain stages.
 */
@Component
public class SecurityPaths {

    /** Paths open to everyone, regardless of HTTP method. */
    public String[] publicPaths() {
        return new String[] {
                "/api/v1/auth/**",
                "/api/v1/users/register",
                "/swagger-ui/**",
                "/swagger-ui.html",
                "/v3/api-docs/**"
        };
    }
}
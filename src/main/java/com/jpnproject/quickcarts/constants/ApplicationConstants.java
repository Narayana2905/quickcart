package com.jpnproject.quickcarts.constants;

// @Component
// @Deprecated
public class ApplicationConstants {
    public static final String JWT_SECRET_KEY = "JWT_SECRET"; // Replace with your actual secret key
    public static final String JWT_SECRET_DEFAULT_VALUE =
            "quickcart-dev-secret-key-change-this-in-production-min-256-bits";
    public static final long JWT_EXPIRATION_MS = 86_400_000; // 1 day
    private ApplicationConstants() {}
}
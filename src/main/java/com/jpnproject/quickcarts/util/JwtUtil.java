package com.jpnproject.quickcarts.util;

import org.springframework.core.env.Environment;
import com.jpnproject.quickcarts.constants.ApplicationConstants;
import lombok.RequiredArgsConstructor;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtUtil {

    private final Environment env;
    // This class will contain utility methods for generating and validating JWT tokens.
    // It will use the jjwt library to create and parse JWT tokens.
    // The methods will include generating a token, validating a token, and extracting claims from a token.

    public String generateJwtToken(Authentication authentication) {
        User principal = (User) authentication.getPrincipal();
        SecretKey key = getSigningKey();

        return Jwts.builder()
                .issuer("QuickCart")
                .subject(principal.getUsername())
                .claim("username", principal.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ApplicationConstants.JWT_EXPIRATION_MS))
                .signWith(key)
                .compact();
        // hmacShaKeyFor: The secret key is converted into a SecretKey object using the Keys.hmacShaKeyFor method. This method takes the secret key as a byte array and generates a key suitable for signing the JWT.
        // StamdardCharsets.UTF_8: The secret key is converted into a byte array using the UTF-8 character encoding. This ensures that the key is properly encoded and can be used for signing the JWT.
        // jwt for the authenticated user is generated using the jjwt library. The token includes the issuer, subject (username), roles, issued at time, expiration time, and is signed with a secret key using the HS256 algorithm.
        // issuer: The issuer of the token, which is set to "QuickCart" in this case.
        // subject: The subject of the token, which is set to the username of the authenticated user.
        // claim: Additional information about the user, such as their roles, can be included as claims in the token. In this case, the username is included as a claim.    
        // signWith: The token is signed with a secret key using the HS256 algorithm. The secret key is retrieved from the application properties or a default value is used if not found.
        // compact: The token is compacted into a string format that can be sent to the client.
        // principal: The principal represents the authenticated user and is obtained from the Authentication object. It is cast to a User object to access the username and other user details.
        
    }
     private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        String secret = env.getProperty(ApplicationConstants.JWT_SECRET_KEY, ApplicationConstants.JWT_SECRET_DEFAULT_VALUE);
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
    public String extractUsername(String token) {
        return parseClaims(token).getSubject();
    }

    /** Returns true if the token is well-formed, signed correctly, and not expired. */
    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception ex) {
            return false;
        }
    }
}
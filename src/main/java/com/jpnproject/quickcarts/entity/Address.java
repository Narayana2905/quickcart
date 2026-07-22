package com.jpnproject.quickcarts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

/**
 * A saved delivery address belonging to a user.
 */
@Getter
@Setter
@Entity
@Table(name = "addresses")
public class Address extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "User is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @NotBlank(message = "Label is required")
    @Size(max = 50)
    private String label; // e.g. "Home", "Mom's place"

    @NotNull(message = "Address type is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AddressType type;

    @NotBlank(message = "Address line is required")
    @Size(max = 255)
    @Column(nullable = false)
    private String addressLine;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid pincode")
    @Column(nullable = false)
    private String pincode;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    @Column(nullable = false)
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    @Column(nullable = false)
    private Double longitude;

    private boolean isDefault = false;
}
package com.jpnproject.quickcarts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "dark_stores")
public class DarkStore extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Store name is required")
    @Size(max = 100)
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Address is required")
    @Size(max = 255)
    @Column(nullable = false)
    private String address;

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

    @NotNull(message = "Opening time is required")
    @Column(nullable = false)
    private java.time.LocalTime openingTime;

    @NotNull(message = "Closing time is required")
    @Column(nullable = false)
    private java.time.LocalTime closingTime;

    private boolean active = true;
}
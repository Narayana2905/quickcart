package com.jpnproject.quickcarts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "riders")
public class Rider extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Size(max = 100)
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Invalid phone number")
    @Column(nullable = false, unique = true)
    private String phone;

    @NotBlank(message = "Vehicle number is required")
    @Column(nullable = false)
    private String vehicleNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dark_store_id")
    private DarkStore darkStore;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RiderStatus status = RiderStatus.OFFLINE;

    private Double currentLatitude;
    private Double currentLongitude;

    private boolean active = true;
}
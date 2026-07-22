package com.jpnproject.quickcarts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "store_service_zones")
public class StoreServiceZone extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Dark store is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dark_store_id", nullable = false)
    private DarkStore darkStore;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Invalid pincode")
    @Column(nullable = false)
    private String pincode;

    private boolean active = true;
}
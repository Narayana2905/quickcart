package com.jpnproject.quickcarts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "inventory", uniqueConstraints = @UniqueConstraint(columnNames = {"dark_store_id", "product_variant_id"}))
public class Inventory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Dark store is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dark_store_id", nullable = false)
    private DarkStore darkStore;

    @NotNull(message = "Product variant is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @NotNull(message = "Available quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    @Column(nullable = false)
    private Integer availableQuantity;

    @NotNull(message = "Reserved quantity is required")
    @Min(value = 0, message = "Reserved quantity cannot be negative")
    @Column(nullable = false)
    private Integer reservedQuantity = 0;

    @NotNull(message = "Low stock threshold is required")
    @Min(value = 0)
    @Column(nullable = false)
    private Integer lowStockThreshold = 10;
}
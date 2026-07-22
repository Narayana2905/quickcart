package com.jpnproject.quickcarts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "products")
public class Product extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Size(max = 150)
    @Column(nullable = false)
    private String name;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "MRP is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "MRP must be positive")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal mrp;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Selling price must be positive")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal sellingPrice;

    @NotBlank(message = "Unit is required")
    @Pattern(regexp = "^(kg|g|l|ml|pcs|pack)$", message = "Invalid unit")
    private String unit;

    @NotNull(message = "Unit value is required")
    @Positive(message = "Unit value must be positive")
    private Double unitValue;

    @NotNull(message = "Category is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProductVariant> variants = new ArrayList<>();

    private boolean active = true;
}
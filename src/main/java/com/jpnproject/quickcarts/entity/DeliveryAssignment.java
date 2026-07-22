package com.jpnproject.quickcarts.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/** Links an Order to the Rider fulfilling it, and tracks delivery progress. */
@Getter
@Setter
@Entity
@Table(name = "delivery_assignments")
public class DeliveryAssignment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Order is required")
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @NotNull(message = "Rider is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rider_id", nullable = false)
    private Rider rider;

    @NotNull(message = "Delivery status is required")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeliveryStatus status = DeliveryStatus.ASSIGNED;

    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
    private String failureReason;
}
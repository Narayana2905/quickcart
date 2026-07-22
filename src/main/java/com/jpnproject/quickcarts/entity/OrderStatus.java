package com.jpnproject.quickcarts.entity;

/**
 * Represents the lifecycle states of an order.
 */
public enum OrderStatus {
    PLACED,
    PACKED,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}
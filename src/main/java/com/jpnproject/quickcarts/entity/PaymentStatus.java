package com.jpnproject.quickcarts.entity;

/** Lifecycle states of a payment transaction. */
public enum PaymentStatus {
    PENDING,
    SUCCESS,
    FAILED,
    REFUNDED
}
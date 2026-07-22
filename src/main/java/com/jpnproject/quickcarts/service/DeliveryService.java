package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.AssignRiderRequest;
import com.jpnproject.quickcarts.dto.DeliveryAssignmentResponse;

public interface DeliveryService {

    /** Assigns a rider to an order, marks the rider ON_DELIVERY. */
    DeliveryAssignmentResponse assignRider(AssignRiderRequest request);

    /** Marks the order as picked up from the dark store. */
    DeliveryAssignmentResponse markPickedUp(Long orderId);

    /** Marks the order delivered, and frees up the rider (AVAILABLE). */
    DeliveryAssignmentResponse markDelivered(Long orderId);

    /** Marks delivery as failed, frees up the rider. */
    DeliveryAssignmentResponse markFailed(Long orderId, String reason);

    /** Fetches live delivery tracking info for an order. */
    DeliveryAssignmentResponse trackOrder(Long orderId);
}
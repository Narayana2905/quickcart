package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.AssignRiderRequest;
import com.jpnproject.quickcarts.dto.DeliveryAssignmentResponse;
import com.jpnproject.quickcarts.entity.*;
import com.jpnproject.quickcarts.exception.BadRequestException;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.DeliveryAssignmentRepository;
import com.jpnproject.quickcarts.repository.OrderRepository;
import com.jpnproject.quickcarts.repository.RiderRepository;
import com.jpnproject.quickcarts.service.DeliveryService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryAssignmentRepository assignmentRepository;
    private final OrderRepository orderRepository;
    private final RiderRepository riderRepository;

    @Override
    public DeliveryAssignmentResponse assignRider(AssignRiderRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));
        Rider rider = riderRepository.findById(request.getRiderId())
                .orElseThrow(() -> new ResourceNotFoundException("Rider not found with id: " + request.getRiderId()));

        if (rider.getStatus() != RiderStatus.AVAILABLE) {
            throw new BadRequestException("Rider is not available");
        }
        if (assignmentRepository.findByOrderId(order.getId()).isPresent()) {
            throw new BadRequestException("Order already has a rider assigned");
        }

        DeliveryAssignment assignment = new DeliveryAssignment();
        assignment.setOrder(order);
        assignment.setRider(rider);
        assignment.setStatus(DeliveryStatus.ASSIGNED);
        assignmentRepository.save(assignment);

        rider.setStatus(RiderStatus.ON_DELIVERY);
        riderRepository.save(rider);

        return toResponse(assignment);
    }

    @Override
    public DeliveryAssignmentResponse markPickedUp(Long orderId) {
        DeliveryAssignment assignment = findByOrder(orderId);
        assignment.setStatus(DeliveryStatus.PICKED_UP);
        assignment.setPickedUpAt(LocalDateTime.now());
        return toResponse(assignmentRepository.save(assignment));
    }

    @Override
    public DeliveryAssignmentResponse markDelivered(Long orderId) {
        DeliveryAssignment assignment = findByOrder(orderId);
        assignment.setStatus(DeliveryStatus.DELIVERED);
        assignment.setDeliveredAt(LocalDateTime.now());
        assignmentRepository.save(assignment);
        freeRider(assignment.getRider());
        return toResponse(assignment);
    }

    @Override
    public DeliveryAssignmentResponse markFailed(Long orderId, String reason) {
        DeliveryAssignment assignment = findByOrder(orderId);
        assignment.setStatus(DeliveryStatus.FAILED);
        assignment.setFailureReason(reason);
        assignmentRepository.save(assignment);
        freeRider(assignment.getRider());
        return toResponse(assignment);
    }

    @Override
    public DeliveryAssignmentResponse trackOrder(Long orderId) {
        return toResponse(findByOrder(orderId));
    }

    private void freeRider(Rider rider) {
        rider.setStatus(RiderStatus.AVAILABLE);
        riderRepository.save(rider);
    }

    private DeliveryAssignment findByOrder(Long orderId) {
        return assignmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("No delivery assignment found for order id: " + orderId));
    }

    private DeliveryAssignmentResponse toResponse(DeliveryAssignment assignment) {
        return new DeliveryAssignmentResponse(
                assignment.getId(),
                assignment.getOrder().getId(),
                assignment.getRider().getId(),
                assignment.getRider().getName(),
                assignment.getRider().getPhone(),
                assignment.getStatus(),
                assignment.getPickedUpAt(),
                assignment.getDeliveredAt(),
                assignment.getFailureReason()
        );
    }
}
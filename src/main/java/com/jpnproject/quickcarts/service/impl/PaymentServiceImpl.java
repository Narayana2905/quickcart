package com.jpnproject.quickcarts.service.impl;

import com.jpnproject.quickcarts.dto.*;
import com.jpnproject.quickcarts.entity.*;
import com.jpnproject.quickcarts.exception.BadRequestException;
import com.jpnproject.quickcarts.exception.ResourceNotFoundException;
import com.jpnproject.quickcarts.repository.OrderRepository;
import com.jpnproject.quickcarts.repository.PaymentRepository;
import com.jpnproject.quickcarts.repository.RefundRepository;
import com.jpnproject.quickcarts.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

/**
 * Implementation of {@link PaymentService}.
 * COD payments are auto-marked SUCCESS; online methods wait for gateway callback.
 */
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;

    @Override
    public PaymentResponse initiate(InitiatePaymentRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setMethod(request.getMethod());
        payment.setStatus(request.getMethod() == PaymentMethod.COD ? PaymentStatus.SUCCESS : PaymentStatus.PENDING);

        return toResponse(paymentRepository.save(payment));
    }

    @Override
    public PaymentResponse handleCallback(Long paymentId, PaymentCallbackRequest request) {
        Payment payment = findEntity(paymentId);
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new BadRequestException("Payment is not in a pending state");
        }

        payment.setGatewayTransactionId(request.getGatewayTransactionId());
        if (Boolean.TRUE.equals(request.getSuccess())) {
            payment.setStatus(PaymentStatus.SUCCESS);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason(request.getFailureReason());
        }
        return toResponse(paymentRepository.save(payment));
    }

    @Override
    public PaymentResponse getById(Long id) {
        return toResponse(findEntity(id));
    }

    @Override
    public List<PaymentResponse> getByOrder(Long orderId) {
        return paymentRepository.findByOrderId(orderId).stream().map(this::toResponse).toList();
    }

    @Override
    public RefundResponse issueRefund(Long paymentId, RefundRequest request) {
        Payment payment = findEntity(paymentId);
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new BadRequestException("Only successful payments can be refunded");
        }
        if (request.getAmount().compareTo(payment.getAmount()) > 0) {
            throw new BadRequestException("Refund amount cannot exceed payment amount");
        }

        Refund refund = new Refund();
        refund.setPayment(payment);
        refund.setAmount(request.getAmount());
        refund.setReason(request.getReason());
        refund.setStatus(PaymentStatus.REFUNDED);
        Refund saved = refundRepository.save(refund);

        payment.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        return toRefundResponse(saved);
    }

    private Payment findEntity(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
    }

    private PaymentResponse toResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        BeanUtils.copyProperties(payment, response);
        response.setOrderId(payment.getOrder().getId());
        return response;
    }

    private RefundResponse toRefundResponse(Refund refund) {
        RefundResponse response = new RefundResponse();
        BeanUtils.copyProperties(refund, response);
        response.setPaymentId(refund.getPayment().getId());
        return response;
    }
}
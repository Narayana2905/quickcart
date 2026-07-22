package com.jpnproject.quickcarts.service;

import com.jpnproject.quickcarts.dto.*;

import java.util.List;

/**
 * Service contract for payment initiation, confirmation, and refunds.
 */
public interface PaymentService {

    /** Initiates a payment for an order. COD is marked SUCCESS immediately; others stay PENDING. */
    PaymentResponse initiate(InitiatePaymentRequest request);

    /** Handles gateway callback/webhook to confirm success or failure of a payment. */
    PaymentResponse handleCallback(Long paymentId, PaymentCallbackRequest request);

    /** Fetches a payment by id. */
    PaymentResponse getById(Long id);

    /** Fetches all payment attempts for an order. */
    List<PaymentResponse> getByOrder(Long orderId);

    /** Issues a refund against a successful payment. */
    RefundResponse issueRefund(Long paymentId, RefundRequest request);
}
// package com.jpnproject.quickcarts.controller;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.jpnproject.quickcarts.dto.*;
// import com.jpnproject.quickcarts.entity.PaymentMethod;
// import com.jpnproject.quickcarts.entity.PaymentStatus;
// import com.jpnproject.quickcarts.service.PaymentService;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
// import org.springframework.test.context.bean.override.mockito.MockitoBean;
// import org.springframework.test.web.servlet.MockMvc;

// import java.math.BigDecimal;
// import java.time.LocalDateTime;
// import java.util.List;

// import static org.mockito.ArgumentMatchers.*;
// import static org.mockito.Mockito.when;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @WebMvcTest(PaymentController.class)
// class PaymentControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Autowired
//     private ObjectMapper objectMapper;

//     @MockitoBean
//     private PaymentService paymentService;

//     @Test
//     void allEndpoints_happyPath() throws Exception {
//         PaymentResponse response = new PaymentResponse(1L, 1L, BigDecimal.TEN, PaymentMethod.UPI,
//                 PaymentStatus.SUCCESS, "txn123", null, LocalDateTime.now());
//         RefundResponse refundResponse = new RefundResponse(1L, 1L, BigDecimal.TEN, "Order cancelled", PaymentStatus.REFUNDED);

//         InitiatePaymentRequest initiateRequest = new InitiatePaymentRequest();
//         initiateRequest.setOrderId(1L);
//         initiateRequest.setMethod(PaymentMethod.UPI);

//         PaymentCallbackRequest callbackRequest = new PaymentCallbackRequest();
//         callbackRequest.setSuccess(true);
//         callbackRequest.setGatewayTransactionId("txn123");

//         RefundRequest refundRequest = new RefundRequest();
//         refundRequest.setAmount(BigDecimal.TEN);
//         refundRequest.setReason("Order cancelled");

//         when(paymentService.initiate(any())).thenReturn(response);
//         when(paymentService.handleCallback(anyLong(), any())).thenReturn(response);
//         when(paymentService.getById(1L)).thenReturn(response);
//         when(paymentService.getByOrder(1L)).thenReturn(List.of(response));
//         when(paymentService.issueRefund(anyLong(), any())).thenReturn(refundResponse);

//         mockMvc.perform(post("/api/v1/payments")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(initiateRequest)))
//                 .andExpect(status().isCreated());

//         mockMvc.perform(post("/api/v1/payments/1/callback")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(callbackRequest)))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/payments/1"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/payments/order/1"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(post("/api/v1/payments/1/refund")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(refundRequest)))
//                 .andExpect(status().isCreated());
//     }
// }
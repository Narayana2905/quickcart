// package com.jpnproject.quickcarts.controller;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.jpnproject.quickcarts.dto.*;
// import com.jpnproject.quickcarts.entity.OrderStatus;
// import com.jpnproject.quickcarts.service.OrderService;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
// import org.springframework.test.context.bean.override.mockito.MockitoBean;
// import org.springframework.test.web.servlet.MockMvc;

// import java.math.BigDecimal;
// import java.time.LocalDateTime;
// import java.util.Collections;
// import java.util.List;

// import static org.mockito.ArgumentMatchers.*;
// import static org.mockito.Mockito.when;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @WebMvcTest(OrderController.class)
// class OrderControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Autowired
//     private ObjectMapper objectMapper;

//     @MockitoBean
//     private OrderService orderService;

//     @Test
//     void allEndpoints_happyPath() throws Exception {
//         OrderResponse response = new OrderResponse(1L, 1L, 1L, "Store A", "Addr", "500001",
//                 BigDecimal.TEN, BigDecimal.ZERO, OrderStatus.PLACED, null, Collections.emptyList(), LocalDateTime.now());

//         CheckoutRequest checkoutRequest = new CheckoutRequest();
//         checkoutRequest.setUserId(1L);
//         checkoutRequest.setDeliveryAddress("Addr");
//         checkoutRequest.setDeliveryPincode("500001");

//         UpdateOrderStatusRequest statusRequest = new UpdateOrderStatusRequest();
//         statusRequest.setStatus(OrderStatus.PACKED);

//         CancelOrderRequest cancelRequest = new CancelOrderRequest();
//         cancelRequest.setReason("Changed mind");

//         when(orderService.checkout(any())).thenReturn(response);
//         when(orderService.getById(1L)).thenReturn(response);
//         when(orderService.getByUser(1L)).thenReturn(List.of(response));
//         when(orderService.updateStatus(anyLong(), any())).thenReturn(response);
//         when(orderService.cancel(anyLong(), any())).thenReturn(response);

//         mockMvc.perform(post("/api/v1/orders/checkout")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(checkoutRequest)))
//                 .andExpect(status().isCreated());

//         mockMvc.perform(get("/api/v1/orders/1"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/orders").param("userId", "1"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(patch("/api/v1/orders/1/status")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(statusRequest)))
//                 .andExpect(status().isOk());

//         mockMvc.perform(patch("/api/v1/orders/1/cancel")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(cancelRequest)))
//                 .andExpect(status().isOk());
//     }
// }
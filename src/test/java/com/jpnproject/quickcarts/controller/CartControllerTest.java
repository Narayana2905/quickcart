// package com.jpnproject.quickcarts.controller;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.jpnproject.quickcarts.dto.AddCartItemRequest;
// import com.jpnproject.quickcarts.dto.CartResponse;
// import com.jpnproject.quickcarts.dto.UpdateCartItemRequest;
// import com.jpnproject.quickcarts.service.CartService;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
// import org.springframework.test.context.bean.override.mockito.MockitoBean;
// import org.springframework.test.web.servlet.MockMvc;

// import java.math.BigDecimal;
// import java.util.Collections;

// import static org.mockito.ArgumentMatchers.*;
// import static org.mockito.Mockito.when;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @WebMvcTest(CartController.class)
// class CartControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Autowired
//     private ObjectMapper objectMapper;

//     @MockitoBean
//     private CartService cartService;

//     @Test
//     void allEndpoints_happyPath() throws Exception {
//         CartResponse response = new CartResponse(1L, 1L, 1L, "Store A", Collections.emptyList(), BigDecimal.TEN, 2);

//         AddCartItemRequest addRequest = new AddCartItemRequest();
//         addRequest.setUserId(1L);
//         addRequest.setDarkStoreId(1L);
//         addRequest.setProductVariantId(1L);
//         addRequest.setQuantity(2);

//         UpdateCartItemRequest updateRequest = new UpdateCartItemRequest();
//         updateRequest.setQuantity(3);

//         when(cartService.addItem(any())).thenReturn(response);
//         when(cartService.updateItem(anyLong(), anyLong(), any())).thenReturn(response);
//         when(cartService.removeItem(anyLong(), anyLong())).thenReturn(response);
//         when(cartService.getCart(anyLong())).thenReturn(response);

//         mockMvc.perform(post("/api/v1/cart/items")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(addRequest)))
//                 .andExpect(status().isCreated());

//         mockMvc.perform(put("/api/v1/cart/items/1").param("userId", "1")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(updateRequest)))
//                 .andExpect(status().isOk());

//         mockMvc.perform(delete("/api/v1/cart/items/1").param("userId", "1"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/cart").param("userId", "1"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(delete("/api/v1/cart").param("userId", "1"))
//                 .andExpect(status().isOk());
//     }
// }
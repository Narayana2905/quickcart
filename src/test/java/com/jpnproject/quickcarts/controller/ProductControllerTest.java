// package com.jpnproject.quickcarts.controller;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.jpnproject.quickcarts.dto.ProductRequest;
// import com.jpnproject.quickcarts.dto.ProductResponse;
// import com.jpnproject.quickcarts.service.ProductService;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
// import org.springframework.test.context.bean.override.mockito.MockitoBean;
// import org.springframework.test.web.servlet.MockMvc;

// import java.math.BigDecimal;
// import java.util.Collections;
// import java.util.List;

// import static org.mockito.ArgumentMatchers.*;
// import static org.mockito.Mockito.when;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @WebMvcTest(ProductController.class)
// class ProductControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Autowired
//     private ObjectMapper objectMapper;

//     @MockitoBean
//     private ProductService productService;

//     @Test
//     void allEndpoints_happyPath() throws Exception {
//         ProductResponse response = new ProductResponse(1L, "Milk", "desc", BigDecimal.TEN, BigDecimal.valueOf(9),
//                 "l", 1.0, 1L, "Dairy", 1L, "Amul", true, Collections.emptyList(), Collections.emptyList());

//         ProductRequest request = new ProductRequest();
//         request.setName("Milk");
//         request.setMrp(BigDecimal.TEN);
//         request.setSellingPrice(BigDecimal.valueOf(9));
//         request.setUnit("l");
//         request.setUnitValue(1.0);
//         request.setCategoryId(1L);

//         when(productService.create(any())).thenReturn(response);
//         when(productService.update(anyLong(), any())).thenReturn(response);
//         when(productService.getById(1L)).thenReturn(response);
//         when(productService.getAll()).thenReturn(List.of(response));
//         when(productService.search(anyString())).thenReturn(List.of(response));

//         mockMvc.perform(post("/api/v1/products")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(request)))
//                 .andExpect(status().isCreated());

//         mockMvc.perform(put("/api/v1/products/1")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(request)))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/products/1"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/products"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/products/search").param("keyword", "Milk"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(delete("/api/v1/products/1"))
//                 .andExpect(status().isOk());
//     }
// }
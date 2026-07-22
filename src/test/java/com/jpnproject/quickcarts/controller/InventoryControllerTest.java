// package com.jpnproject.quickcarts.controller;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.jpnproject.quickcarts.dto.InventoryRequest;
// import com.jpnproject.quickcarts.dto.InventoryResponse;
// import com.jpnproject.quickcarts.dto.StockUpdateRequest;
// import com.jpnproject.quickcarts.service.InventoryService;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
// import org.springframework.test.context.bean.override.mockito.MockitoBean;
// import org.springframework.test.web.servlet.MockMvc;

// import java.util.List;

// import static org.mockito.ArgumentMatchers.*;
// import static org.mockito.Mockito.when;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @WebMvcTest(InventoryController.class)
// class InventoryControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Autowired
//     private ObjectMapper objectMapper;

//     @MockitoBean
//     private InventoryService inventoryService;

//     @Test
//     void allEndpoints_happyPath() throws Exception {
//         InventoryResponse response = new InventoryResponse(1L, 1L, "Store A", 1L, "500ml", 100, 0, 10);

//         InventoryRequest request = new InventoryRequest();
//         request.setDarkStoreId(1L);
//         request.setProductVariantId(1L);
//         request.setAvailableQuantity(100);

//         StockUpdateRequest stockRequest = new StockUpdateRequest();
//         stockRequest.setQuantity(10);

//         when(inventoryService.create(any())).thenReturn(response);
//         when(inventoryService.getById(1L)).thenReturn(response);
//         when(inventoryService.getByStore(1L)).thenReturn(List.of(response));
//         when(inventoryService.getLowStock(1L)).thenReturn(List.of(response));
//         when(inventoryService.increaseStock(anyLong(), any())).thenReturn(response);
//         when(inventoryService.decreaseStock(anyLong(), any())).thenReturn(response);

//         mockMvc.perform(post("/api/v1/inventory")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(request)))
//                 .andExpect(status().isCreated());

//         mockMvc.perform(get("/api/v1/inventory/1"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/inventory/store/1"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/inventory/store/1/low-stock"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(patch("/api/v1/inventory/1/increase")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(stockRequest)))
//                 .andExpect(status().isOk());

//         mockMvc.perform(patch("/api/v1/inventory/1/decrease")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(stockRequest)))
//                 .andExpect(status().isOk());
//     }
// }
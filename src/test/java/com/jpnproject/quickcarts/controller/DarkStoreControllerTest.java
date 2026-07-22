// package com.jpnproject.quickcarts.controller;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.jpnproject.quickcarts.dto.DarkStoreRequest;
// import com.jpnproject.quickcarts.dto.DarkStoreResponse;
// import com.jpnproject.quickcarts.service.DarkStoreService;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
// import org.springframework.test.context.bean.override.mockito.MockitoBean;
// import org.springframework.test.web.servlet.MockMvc;

// import java.time.LocalTime;
// import java.util.List;

// import static org.mockito.ArgumentMatchers.*;
// import static org.mockito.Mockito.when;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @WebMvcTest(DarkStoreController.class)
// class DarkStoreControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Autowired
//     private ObjectMapper objectMapper;

//     @MockitoBean
//     private DarkStoreService darkStoreService;

//     @Test
//     void allEndpoints_happyPath() throws Exception {
//         DarkStoreResponse response = new DarkStoreResponse(1L, "Store A", "Addr", "500001",
//                 17.4, 78.4, LocalTime.of(6, 0), LocalTime.of(23, 0), true);

//         DarkStoreRequest request = new DarkStoreRequest();
//         request.setName("Store A");
//         request.setAddress("Addr");
//         request.setPincode("500001");
//         request.setLatitude(17.4);
//         request.setLongitude(78.4);
//         request.setOpeningTime(LocalTime.of(6, 0));
//         request.setClosingTime(LocalTime.of(23, 0));

//         when(darkStoreService.create(any())).thenReturn(response);
//         when(darkStoreService.update(anyLong(), any())).thenReturn(response);
//         when(darkStoreService.getById(1L)).thenReturn(response);
//         when(darkStoreService.getAll()).thenReturn(List.of(response));
//         when(darkStoreService.findNearestStore(anyDouble(), anyDouble())).thenReturn(response);

//         mockMvc.perform(post("/api/v1/dark-stores")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(request)))
//                 .andExpect(status().isCreated());

//         mockMvc.perform(put("/api/v1/dark-stores/1")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(request)))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/dark-stores/1"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/dark-stores"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/dark-stores/nearest").param("latitude", "17.4").param("longitude", "78.4"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(delete("/api/v1/dark-stores/1"))
//                 .andExpect(status().isOk());
//     }
// }
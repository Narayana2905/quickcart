// package com.jpnproject.quickcarts.controller;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.jpnproject.quickcarts.dto.StoreServiceZoneRequest;
// import com.jpnproject.quickcarts.dto.StoreServiceZoneResponse;
// import com.jpnproject.quickcarts.service.StoreServiceZoneService;
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

// @WebMvcTest(StoreServiceZoneController.class)
// class StoreServiceZoneControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Autowired
//     private ObjectMapper objectMapper;

//     @MockitoBean
//     private StoreServiceZoneService zoneService;

//     @Test
//     void allEndpoints_happyPath() throws Exception {
//         StoreServiceZoneResponse response = new StoreServiceZoneResponse(1L, 1L, "Store A", "500001", true);

//         StoreServiceZoneRequest request = new StoreServiceZoneRequest();
//         request.setDarkStoreId(1L);
//         request.setPincode("500001");

//         when(zoneService.create(any())).thenReturn(response);
//         when(zoneService.checkServiceability(anyString())).thenReturn(response);
//         when(zoneService.getByStore(1L)).thenReturn(List.of(response));

//         mockMvc.perform(post("/api/v1/service-zones")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(request)))
//                 .andExpect(status().isCreated());

//         mockMvc.perform(get("/api/v1/service-zones/check").param("pincode", "500001"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/service-zones/store/1"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(delete("/api/v1/service-zones/1"))
//                 .andExpect(status().isOk());
//     }
// }
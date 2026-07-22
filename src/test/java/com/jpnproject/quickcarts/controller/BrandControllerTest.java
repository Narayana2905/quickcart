// package com.jpnproject.quickcarts.controller;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.jpnproject.quickcarts.dto.BrandRequest;
// import com.jpnproject.quickcarts.dto.BrandResponse;
// import com.jpnproject.quickcarts.service.BrandService;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
// import org.springframework.test.context.bean.override.mockito.MockitoBean;
// import org.springframework.test.web.servlet.MockMvc;

// import java.util.List;

// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.ArgumentMatchers.anyLong;
// import static org.mockito.Mockito.when;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @WebMvcTest(BrandController.class)
// class BrandControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Autowired
//     private ObjectMapper objectMapper;

//     @MockitoBean
//     private BrandService brandService;

//     @Test
//     void allEndpoints_happyPath() throws Exception {
//         BrandResponse response = new BrandResponse(1L, "Amul", "logo.png", true);

//         BrandRequest request = new BrandRequest();
//         request.setName("Amul");
//         request.setLogoUrl("logo.png");

//         when(brandService.create(any())).thenReturn(response);
//         when(brandService.update(anyLong(), any())).thenReturn(response);
//         when(brandService.getById(1L)).thenReturn(response);
//         when(brandService.getAll()).thenReturn(List.of(response));

//         mockMvc.perform(post("/api/v1/brands")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(request)))
//                 .andExpect(status().isCreated())
//                 .andExpect(jsonPath("$.data.name").value("Amul"));

//         mockMvc.perform(put("/api/v1/brands/1")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(request)))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/brands/1"))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.data.id").value(1));

//         mockMvc.perform(get("/api/v1/brands"))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.data.length()").value(1));

//         mockMvc.perform(delete("/api/v1/brands/1"))
//                 .andExpect(status().isOk());
//     }
// }
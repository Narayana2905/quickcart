// package com.jpnproject.quickcarts.controller;

// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.jpnproject.quickcarts.dto.CategoryRequest;
// import com.jpnproject.quickcarts.dto.CategoryResponse;
// import com.jpnproject.quickcarts.service.CategoryService;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
// import org.springframework.test.context.bean.override.mockito.MockitoBean;
// import org.springframework.test.web.servlet.MockMvc;

// import java.util.Collections;
// import java.util.List;

// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.ArgumentMatchers.anyLong;
// import static org.mockito.Mockito.when;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @WebMvcTest(CategoryController.class)
// class CategoryControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Autowired
//     private ObjectMapper objectMapper;

//     @MockitoBean
//     private CategoryService categoryService;

//     @Test
//     void allEndpoints_happyPath() throws Exception {
//         CategoryResponse response = new CategoryResponse(1L, "Dairy", "img.png", null, true, Collections.emptyList());

//         CategoryRequest request = new CategoryRequest();
//         request.setName("Dairy");
//         request.setImageUrl("img.png");

//         when(categoryService.create(any())).thenReturn(response);
//         when(categoryService.update(anyLong(), any())).thenReturn(response);
//         when(categoryService.getById(1L)).thenReturn(response);
//         when(categoryService.getAllRootCategories()).thenReturn(List.of(response));

//         mockMvc.perform(post("/api/v1/categories")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(request)))
//                 .andExpect(status().isCreated());

//         mockMvc.perform(put("/api/v1/categories/1")
//                         .contentType("application/json")
//                         .content(objectMapper.writeValueAsString(request)))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/categories/1"))
//                 .andExpect(status().isOk());

//         mockMvc.perform(get("/api/v1/categories"))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.data.length()").value(1));

//         mockMvc.perform(delete("/api/v1/categories/1"))
//                 .andExpect(status().isOk());
//     }
// }
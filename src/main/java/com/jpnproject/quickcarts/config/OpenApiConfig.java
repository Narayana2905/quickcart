package com.jpnproject.quickcarts.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .servers(List.of(
                        new Server()
                                .url("https://obscure-tribble-6p4xw595vxvcr464-8080.app.github.dev")
                                .description("GitHub Codespaces")
                ));
    }
}
package com.ironpath.auth.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.ironpath.auth.application.dto.LoginRequest
import com.ironpath.auth.application.dto.RegisterRequest
import com.ironpath.common.AbstractIntegrationTest
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@AutoConfigureMockMvc
class AuthControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `should register a new user successfully`() {
        val registerRequest = RegisterRequest(
            email = "test.integration@ironpath.dev",
            password = "Password123!",
            firstName = "Test",
            lastName = "Integration"
        )

        mockMvc.perform(
            post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.accessToken").isNotEmpty)
            .andExpect(jsonPath("$.user.email").value("test.integration@ironpath.dev"))
    }

    @Test
    fun `should login existing user successfully`() {
        // 1. Register
        val registerRequest = RegisterRequest(
            email = "login.integration@ironpath.dev",
            password = "Password123!",
            firstName = "Login",
            lastName = "User"
        )

        mockMvc.perform(
            post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest))
        ).andExpect(status().isCreated)

        // 2. Login
        val loginRequest = LoginRequest(
            email = "login.integration@ironpath.dev",
            password = "Password123!"
        )

        mockMvc.perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.accessToken").isNotEmpty)
    }

    @Test
    fun `should fail login with incorrect password`() {
        val loginRequest = LoginRequest(
            email = "non.existent@ironpath.dev",
            password = "WrongPassword123!"
        )

        mockMvc.perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest))
        )
            .andExpect(status().isUnauthorized)
    }
}

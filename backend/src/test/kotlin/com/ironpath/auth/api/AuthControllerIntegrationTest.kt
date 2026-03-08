package com.ironpath.auth.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.ironpath.auth.application.dto.LoginRequest
import com.ironpath.auth.application.dto.RegisterRequest
import com.ironpath.auth.domain.repository.UserRepository
import com.ironpath.common.AbstractIntegrationTest
import java.util.UUID
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultHandlers.print
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@AutoConfigureMockMvc
class AuthControllerIntegrationTest : AbstractIntegrationTest() {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var userRepository: UserRepository

    private fun randomEmail(prefix: String) = "$prefix-${UUID.randomUUID()}@ironpath.dev"

    @Test
    fun `should register a new user successfully`() {
        val email = randomEmail("register")
        val registerRequest = RegisterRequest(
            email = email,
            password = "Password123!",
            firstName = "Test",
            lastName = "Integration"
        )

        mockMvc.perform(
            post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest))
        ).andDo(print())
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.accessToken").isNotEmpty)
            .andExpect(jsonPath("$.user.email").value(email))
    }

    @Test
    fun `should login existing user successfully`() {
        val email = randomEmail("login")
        // 1. Register
        val registerRequest = RegisterRequest(
            email = email,
            password = "Password123!",
            firstName = "Login",
            lastName = "User"
        )

        mockMvc.perform(
            post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest))
        ).andExpect(status().isCreated)

        // 1b. Verify user exists in DB
        val userInDb = userRepository.findByEmail(email)
        assertNotNull(userInDb, "L'utilisateur devrait exister en base avant le login")

        // 2. Login
        val loginRequest = LoginRequest(
            email = email,
            password = "Password123!"
        )

        mockMvc.perform(
            post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest))
        ).andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.accessToken").isNotEmpty)
            .andExpect(jsonPath("$.user.email").value(email))
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

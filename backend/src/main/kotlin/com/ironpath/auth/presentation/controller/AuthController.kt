package com.ironpath.auth.presentation.controller

import com.ironpath.auth.application.dto.*
import com.ironpath.auth.application.service.AuthService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

/**
 * AuthController — Endpoints REST pour l'authentification.
 *
 * Controller léger : délègue toute la logique à AuthService.
 * Aucune logique métier ici — uniquement le mapping HTTP ↔ DTOs.
 *
 * Routes publiques (pas de JWT requis) :
 * - POST /auth/register → 201 Created
 * - POST /auth/login    → 200 OK
 * - POST /auth/refresh  → 200 OK
 * - POST /auth/logout   → 204 No Content
 */
@RestController
@RequestMapping("/auth")
@Tag(name = "Authentification", description = "Inscription, connexion, refresh et déconnexion JWT")
class AuthController(
    private val authService: AuthService
) {

    /**
     * Inscrit un nouvel utilisateur et retourne les tokens JWT.
     *
     * @param request DTO validé contenant email, password, firstName, lastName
     * @return 201 Created avec AuthResponse (tokens + profil)
     */
    @PostMapping("/register")
    @Operation(summary = "Inscription d'un nouvel utilisateur")
    @ApiResponses(
        ApiResponse(responseCode = "201", description = "Utilisateur créé avec succès"),
        ApiResponse(responseCode = "400", description = "Données de validation invalides"),
        ApiResponse(responseCode = "409", description = "Email déjà utilisé")
    )
    fun register(@Valid @RequestBody request: RegisterRequest): ResponseEntity<AuthResponse> {
        val response = authService.register(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    /**
     * Authentifie un utilisateur et retourne les tokens JWT.
     *
     * @param request DTO contenant email et password
     * @return 200 OK avec AuthResponse (tokens + profil)
     */
    @PostMapping("/login")
    @Operation(summary = "Connexion avec email et mot de passe")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Connexion réussie"),
        ApiResponse(responseCode = "401", description = "Email ou mot de passe incorrect")
    )
    fun login(@Valid @RequestBody request: LoginRequest): ResponseEntity<AuthResponse> {
        val response = authService.login(request)
        return ResponseEntity.ok(response)
    }

    /**
     * Renouvelle l'access token à l'aide du refresh token.
     *
     * @param request DTO contenant le refresh token
     * @return 200 OK avec AuthResponse (nouveau access token)
     */
    @PostMapping("/refresh")
    @Operation(summary = "Renouvellement du token d'accès")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Token renouvelé"),
        ApiResponse(responseCode = "401", description = "Refresh token invalide, expiré ou révoqué")
    )
    fun refresh(@Valid @RequestBody request: RefreshRequest): ResponseEntity<AuthResponse> {
        val response = authService.refresh(request)
        return ResponseEntity.ok(response)
    }

    /**
     * Déconnecte l'utilisateur en révoquant son refresh token.
     *
     * @param request DTO contenant le refresh token à révoquer
     * @return 204 No Content (pas de body en réponse)
     */
    @PostMapping("/logout")
    @Operation(summary = "Déconnexion (révocation du refresh token)")
    @ApiResponses(
        ApiResponse(responseCode = "204", description = "Déconnexion réussie")
    )
    fun logout(@Valid @RequestBody request: RefreshRequest): ResponseEntity<Void> {
        authService.logout(request)
        return ResponseEntity.noContent().build()
    }
}

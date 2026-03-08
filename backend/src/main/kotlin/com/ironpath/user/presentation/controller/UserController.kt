package com.ironpath.user.presentation.controller

import com.ironpath.user.application.dto.UpdateProfileRequest
import com.ironpath.user.application.dto.UserProfileResponse
import com.ironpath.user.application.service.UserService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import java.util.UUID

/**
 * UserController — Endpoints REST pour la gestion du profil utilisateur.
 *
 * Toutes les routes sont protégées par JWT (AuthGuard via SecurityConfig).
 * Le userId est extrait du SecurityContext (injecté par JwtAuthenticationFilter).
 *
 * Routes :
 * - GET  /users/me           → profil de l'utilisateur connecté
 * - PUT  /users/me           → mise à jour du profil
 * - POST /users/me/avatar    → upload d'avatar (URL)
 */
@RestController
@RequestMapping("/users")
@Tag(name = "Profil Utilisateur", description = "CRUD du profil utilisateur connecté")
@SecurityRequirement(name = "Bearer Authentication")
class UserController(
    private val userService: UserService
) {

    /**
     * Récupère le profil de l'utilisateur authentifié.
     */
    @GetMapping("/me")
    @Operation(summary = "Récupérer mon profil")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Profil récupéré"),
        ApiResponse(responseCode = "401", description = "Non authentifié")
    )
    fun getProfile(): ResponseEntity<UserProfileResponse> {
        val userId = extractUserId()
        return ResponseEntity.ok(userService.getProfile(userId))
    }

    /**
     * Met à jour le profil de l'utilisateur authentifié.
     */
    @PutMapping("/me")
    @Operation(summary = "Mettre à jour mon profil")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Profil mis à jour"),
        ApiResponse(responseCode = "400", description = "Données invalides"),
        ApiResponse(responseCode = "401", description = "Non authentifié")
    )
    fun updateProfile(
        @Valid @RequestBody request: UpdateProfileRequest
    ): ResponseEntity<UserProfileResponse> {
        val userId = extractUserId()
        return ResponseEntity.ok(userService.updateProfile(userId, request))
    }

    /**
     * Met à jour l'avatar de l'utilisateur (URL directe pour le MVP).
     *
     * Pour le MVP, le client envoie l'URL de l'image.
     * En production, on implémenterait un upload multipart vers S3/Cloudinary.
     */
    @PostMapping("/me/avatar")
    @Operation(summary = "Mettre à jour mon avatar")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Avatar mis à jour"),
        ApiResponse(responseCode = "401", description = "Non authentifié")
    )
    fun uploadAvatar(@RequestBody body: Map<String, String>): ResponseEntity<UserProfileResponse> {
        val userId = extractUserId()
        val avatarUrl = body["avatarUrl"] ?: throw IllegalArgumentException("avatarUrl est obligatoire")
        return ResponseEntity.ok(userService.updateAvatarUrl(userId, avatarUrl))
    }

    /**
     * Extrait le userId du SecurityContext.
     *
     * Le JwtAuthenticationFilter injecte le userId (UUID sous forme de String)
     * comme principal dans le SecurityContext lors de la validation du JWT.
     *
     * @return le UUID de l'utilisateur authentifié
     * @throws IllegalStateException si le SecurityContext ne contient pas de principal
     */
    private fun extractUserId(): UUID {
        val principal = SecurityContextHolder.getContext().authentication?.principal as? String
            ?: throw IllegalStateException("Utilisateur non authentifié")
        return UUID.fromString(principal)
    }
}

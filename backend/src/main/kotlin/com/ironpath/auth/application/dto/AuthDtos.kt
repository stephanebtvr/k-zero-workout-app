package com.ironpath.auth.application.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.util.UUID

/**
 * RegisterRequest — DTO de requête pour l'inscription d'un nouvel utilisateur.
 *
 * Validations Bean Validation appliquées automatiquement par Spring
 * grâce à @Valid dans le controller.
 */
data class RegisterRequest(
    @field:NotBlank(message = "L'adresse email est obligatoire")
    @field:Email(message = "L'adresse email n'est pas valide")
    val email: String,

    @field:NotBlank(message = "Le mot de passe est obligatoire")
    @field:Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
    val password: String,

    @field:NotBlank(message = "Le prénom est obligatoire")
    val firstName: String,

    @field:NotBlank(message = "Le nom de famille est obligatoire")
    val lastName: String
)

/**
 * LoginRequest — DTO de requête pour la connexion.
 */
data class LoginRequest(
    @field:NotBlank(message = "L'adresse email est obligatoire")
    @field:Email(message = "L'adresse email n'est pas valide")
    val email: String,

    @field:NotBlank(message = "Le mot de passe est obligatoire")
    val password: String
)

/**
 * RefreshRequest — DTO de requête pour le renouvellement du token.
 */
data class RefreshRequest(
    @field:NotBlank(message = "Le refresh token est obligatoire")
    val refreshToken: String
)

/**
 * AuthResponse — DTO de réponse après authentification réussie.
 *
 * Contient les tokens JWT et les informations de base de l'utilisateur.
 * Le client utilise accessToken pour les requêtes API et refreshToken
 * pour renouveler l'accessToken avant son expiration.
 *
 * @property accessToken  JWT d'accès (courte durée, 15 min)
 * @property refreshToken JWT de rafraîchissement (longue durée, 7 jours)
 * @property expiresIn    durée de vie de l'access token en secondes
 * @property user         informations de base de l'utilisateur connecté
 */
data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Long,
    val user: UserSummaryDto
)

/**
 * UserSummaryDto — Résumé des informations utilisateur retourné dans l'AuthResponse.
 *
 * Ne contient que les champs nécessaires côté client pour l'affichage.
 * Le mot de passe n'est JAMAIS inclus dans les DTOs de réponse.
 */
data class UserSummaryDto(
    val id: UUID,
    val email: String,
    val firstName: String,
    val lastName: String,
    val avatarUrl: String? = null
)

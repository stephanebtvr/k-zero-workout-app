package com.ironpath.user.application.dto

import jakarta.validation.constraints.Past
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import java.time.LocalDate
import java.util.UUID

/**
 * UpdateProfileRequest — DTO de requête pour la mise à jour du profil utilisateur.
 *
 * Tous les champs sont optionnels : l'utilisateur peut ne modifier
 * que certains champs sans envoyer les autres.
 */
data class UpdateProfileRequest(
    @field:Size(min = 1, max = 100, message = "Le prénom doit contenir entre 1 et 100 caractères")
    val firstName: String? = null,

    @field:Size(min = 1, max = 100, message = "Le nom doit contenir entre 1 et 100 caractères")
    val lastName: String? = null,

    @field:Past(message = "La date de naissance doit être dans le passé")
    val birthDate: LocalDate? = null,

    @field:Positive(message = "La taille doit être un nombre positif")
    val heightCm: Int? = null
)

/**
 * UserProfileResponse — DTO de réponse avec le profil complet de l'utilisateur.
 */
data class UserProfileResponse(
    val id: UUID,
    val email: String,
    val firstName: String,
    val lastName: String,
    val birthDate: LocalDate?,
    val heightCm: Int?,
    val avatarUrl: String?,
    val createdAt: String
)

package com.ironpath.user.application.service

import com.ironpath.auth.domain.repository.UserRepository
import com.ironpath.common.infrastructure.config.ResourceNotFoundException
import com.ironpath.user.application.dto.UpdateProfileRequest
import com.ironpath.user.application.dto.UserProfileResponse
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * UserService — Service de gestion du profil utilisateur.
 *
 * Couche Application : orchestre les opérations CRUD sur le profil.
 * Utilise le port UserRepository du module auth (entité User partagée).
 *
 * Use cases :
 * - getProfile()    : récupère le profil complet
 * - updateProfile() : met à jour les champs modifiables
 * - uploadAvatar()  : stocke l'avatar et met à jour l'URL
 */
@Service
@Transactional
class UserService(
    private val userRepository: UserRepository
) {
    private val logger = LoggerFactory.getLogger(UserService::class.java)

    /**
     * Récupère le profil complet de l'utilisateur.
     *
     * @param userId UUID de l'utilisateur (extrait du JWT par le controller)
     * @return le profil complet
     * @throws ResourceNotFoundException si l'utilisateur n'existe pas
     */
    fun getProfile(userId: UUID): UserProfileResponse {
        val user = userRepository.findById(userId)
            ?: throw ResourceNotFoundException("Utilisateur", userId)

        return UserProfileResponse(
            id = user.id,
            email = user.email,
            firstName = user.firstName,
            lastName = user.lastName,
            birthDate = user.birthDate,
            heightCm = user.heightCm,
            avatarUrl = user.avatarUrl,
            createdAt = user.createdAt.toString()
        )
    }

    /**
     * Met à jour le profil de l'utilisateur.
     *
     * Seuls les champs fournis (non null) sont mis à jour.
     * Les champs absents du DTO conservent leur valeur actuelle.
     *
     * @param userId  UUID de l'utilisateur
     * @param request DTO avec les champs à modifier
     * @return le profil mis à jour
     * @throws ResourceNotFoundException si l'utilisateur n'existe pas
     */
    fun updateProfile(userId: UUID, request: UpdateProfileRequest): UserProfileResponse {
        val user = userRepository.findById(userId)
            ?: throw ResourceNotFoundException("Utilisateur", userId)

        // Mise à jour partielle : on ne modifie que les champs fournis
        val updatedUser = user.copy(
            firstName = request.firstName?.trim() ?: user.firstName,
            lastName = request.lastName?.trim() ?: user.lastName,
            birthDate = request.birthDate ?: user.birthDate,
            heightCm = request.heightCm ?: user.heightCm
        )

        val saved = userRepository.save(updatedUser)
        logger.info("Profil mis à jour pour l'utilisateur : {}", userId)

        return UserProfileResponse(
            id = saved.id,
            email = saved.email,
            firstName = saved.firstName,
            lastName = saved.lastName,
            birthDate = saved.birthDate,
            heightCm = saved.heightCm,
            avatarUrl = saved.avatarUrl,
            createdAt = saved.createdAt.toString()
        )
    }

    /**
     * Met à jour l'URL de l'avatar de l'utilisateur.
     *
     * Pour le MVP, l'URL est stockée directement.
     * En production, on utiliserait un service de stockage (S3, Cloudinary).
     *
     * @param userId   UUID de l'utilisateur
     * @param avatarUrl URL du fichier avatar uploadé
     * @return le profil mis à jour avec la nouvelle URL d'avatar
     */
    fun updateAvatarUrl(userId: UUID, avatarUrl: String): UserProfileResponse {
        val user = userRepository.findById(userId)
            ?: throw ResourceNotFoundException("Utilisateur", userId)

        val updatedUser = user.copy(avatarUrl = avatarUrl)
        val saved = userRepository.save(updatedUser)

        logger.info("Avatar mis à jour pour l'utilisateur : {}", userId)

        return UserProfileResponse(
            id = saved.id,
            email = saved.email,
            firstName = saved.firstName,
            lastName = saved.lastName,
            birthDate = saved.birthDate,
            heightCm = saved.heightCm,
            avatarUrl = saved.avatarUrl,
            createdAt = saved.createdAt.toString()
        )
    }
}

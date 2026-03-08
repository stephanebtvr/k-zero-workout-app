package com.ironpath.auth.infrastructure.persistence

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

/**
 * SpringDataUserRepository — Interface Spring Data JPA pour les opérations CRUD users.
 *
 * Spring Data génère automatiquement l'implémentation à partir des noms de méthodes.
 * Cette interface est interne à l'infrastructure : le domaine ne la connaît pas.
 */
@Repository
interface SpringDataUserRepository : JpaRepository<UserJpaEntity, UUID> {

    /**
     * Recherche un utilisateur par email (query dérivée du nom de méthode).
     */
    fun findByEmail(email: String): UserJpaEntity?

    /**
     * Vérifie l'existence d'un utilisateur par email (optimisé : SELECT EXISTS).
     */
    fun existsByEmail(email: String): Boolean
}

/**
 * SpringDataRefreshTokenRepository — Interface Spring Data JPA pour les refresh tokens.
 */
@Repository
interface SpringDataRefreshTokenRepository : JpaRepository<RefreshTokenJpaEntity, UUID> {

    /**
     * Recherche un refresh token par son hash SHA-256.
     */
    fun findByTokenHash(tokenHash: String): RefreshTokenJpaEntity?

    /**
     * Révoque tous les refresh tokens d'un utilisateur.
     * Requête bulk UPDATE pour la performance (un seul aller-retour SQL).
     */
    @Modifying
    @Query("UPDATE RefreshTokenJpaEntity r SET r.revoked = true, r.updatedAt = CURRENT_TIMESTAMP WHERE r.userId = :userId AND r.revoked = false")
    fun revokeAllByUserId(userId: UUID)

    /**
     * Révoque un refresh token spécifique par son hash.
     */
    @Modifying
    @Query("UPDATE RefreshTokenJpaEntity r SET r.revoked = true, r.updatedAt = CURRENT_TIMESTAMP WHERE r.tokenHash = :tokenHash AND r.revoked = false")
    fun revokeByTokenHash(tokenHash: String)
}

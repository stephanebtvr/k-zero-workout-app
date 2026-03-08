package com.ironpath.auth.infrastructure.persistence

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

/**
 * RefreshTokenJpaEntity — Entité JPA mappée sur la table `refresh_tokens`.
 *
 * Stocke les refresh tokens sous forme de hash SHA-256.
 * Voir RefreshToken (domaine) pour la documentation métier.
 */
@Entity
@Table(name = "refresh_tokens")
class RefreshTokenJpaEntity(

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    @Column(name = "user_id", nullable = false)
    val userId: UUID = UUID.randomUUID(),

    @Column(name = "token_hash", unique = true, nullable = false, length = 255)
    val tokenHash: String = "",

    @Column(name = "expires_at", nullable = false)
    val expiresAt: Instant = Instant.now(),

    @Column(name = "revoked", nullable = false)
    var revoked: Boolean = false,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)

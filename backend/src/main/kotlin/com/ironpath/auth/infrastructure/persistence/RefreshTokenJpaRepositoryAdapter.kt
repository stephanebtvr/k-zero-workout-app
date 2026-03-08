package com.ironpath.auth.infrastructure.persistence

import com.ironpath.auth.domain.model.RefreshToken
import com.ironpath.auth.domain.repository.RefreshTokenRepository
import org.springframework.stereotype.Component
import java.util.UUID

/**
 * RefreshTokenJpaRepositoryAdapter — Implémentation du port RefreshTokenRepository.
 *
 * Adapter pattern : convertit entre les entités domaine et JPA.
 * Voir UserJpaRepositoryAdapter pour l'explication détaillée du pattern.
 */
@Component
class RefreshTokenJpaRepositoryAdapter(
    private val springDataRefreshTokenRepository: SpringDataRefreshTokenRepository
) : RefreshTokenRepository {

    override fun save(refreshToken: RefreshToken): RefreshToken {
        val jpaEntity = refreshToken.toJpaEntity()
        val saved = springDataRefreshTokenRepository.save(jpaEntity)
        return saved.toDomain()
    }

    override fun findByTokenHash(tokenHash: String): RefreshToken? {
        return springDataRefreshTokenRepository.findByTokenHash(tokenHash)?.toDomain()
    }

    override fun revokeAllByUserId(userId: UUID) {
        springDataRefreshTokenRepository.revokeAllByUserId(userId)
    }

    override fun revokeByTokenHash(tokenHash: String) {
        springDataRefreshTokenRepository.revokeByTokenHash(tokenHash)
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Conversion domaine ↔ JPA pour RefreshToken
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

fun RefreshTokenJpaEntity.toDomain(): RefreshToken = RefreshToken(
    id = this.id,
    userId = this.userId,
    tokenHash = this.tokenHash,
    expiresAt = this.expiresAt,
    revoked = this.revoked,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt
)

fun RefreshToken.toJpaEntity(): RefreshTokenJpaEntity = RefreshTokenJpaEntity(
    id = this.id,
    userId = this.userId,
    tokenHash = this.tokenHash,
    expiresAt = this.expiresAt,
    revoked = this.revoked,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt
)

package com.ironpath.auth.infrastructure.persistence

import com.ironpath.auth.domain.model.User
import com.ironpath.auth.domain.repository.UserRepository
import org.springframework.stereotype.Component
import java.util.UUID

/**
 * UserJpaRepositoryAdapter — Implémentation du port UserRepository via Spring Data JPA.
 *
 * Pattern Adapter (Hexagonal Architecture) :
 * - Le domaine définit l'interface UserRepository (port)
 * - Cette classe l'implémente en utilisant Spring Data JPA (adapter)
 * - Le domaine ne connaît jamais Spring Data, JPA, ni les entités JPA
 *
 * Responsabilités de cet adapter :
 * 1. Convertir les entités domaine (User) ↔ entités JPA (UserJpaEntity)
 * 2. Déléguer les opérations de persistance à Spring Data
 * 3. Encapsuler les détails techniques JPA
 */
@Component
class UserJpaRepositoryAdapter(
    private val springDataUserRepository: SpringDataUserRepository
) : UserRepository {

    /**
     * Recherche un utilisateur par email en convertissant l'entité JPA en entité domaine.
     */
    override fun findByEmail(email: String): User? {
        return springDataUserRepository.findByEmail(email)?.toDomain()
    }

    /**
     * Vérifie l'existence d'un email — délègue directement à Spring Data.
     */
    override fun existsByEmail(email: String): Boolean {
        return springDataUserRepository.existsByEmail(email)
    }

    /**
     * Persiste un utilisateur en convertissant domaine → JPA, puis JPA → domaine.
     */
    override fun save(user: User): User {
        val jpaEntity = user.toJpaEntity()
        val saved = springDataUserRepository.save(jpaEntity)
        return saved.toDomain()
    }

    /**
     * Recherche par ID en convertissant l'entité JPA en entité domaine.
     */
    override fun findById(id: UUID): User? {
        return springDataUserRepository.findById(id).orElse(null)?.toDomain()
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Fonctions d'extension pour la conversion domaine ↔ JPA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Convertit une entité JPA en entité domaine.
 * Direction : Infrastructure → Domaine
 */
fun UserJpaEntity.toDomain(): User = User(
    id = this.id,
    email = this.email,
    passwordHash = this.passwordHash,
    firstName = this.firstName,
    lastName = this.lastName,
    birthDate = this.birthDate,
    heightCm = this.heightCm,
    avatarUrl = this.avatarUrl,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt
)

/**
 * Convertit une entité domaine en entité JPA.
 * Direction : Domaine → Infrastructure
 */
fun User.toJpaEntity(): UserJpaEntity = UserJpaEntity(
    id = this.id,
    email = this.email,
    passwordHash = this.passwordHash,
    firstName = this.firstName,
    lastName = this.lastName,
    birthDate = this.birthDate,
    heightCm = this.heightCm,
    avatarUrl = this.avatarUrl,
    createdAt = this.createdAt,
    updatedAt = this.updatedAt
)

package com.ironpath.auth.infrastructure.persistence

import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

/**
 * UserJpaEntity — Entité JPA mappée sur la table `users` en PostgreSQL.
 *
 * Séparation avec l'entité domaine (User) :
 * Cette séparation est un pilier de Clean Architecture. On distingue deux responsabilités :
 *
 * 1. **User (domaine)** : représente le concept métier, sans aucune dépendance framework.
 *    Peut être testé unitairement sans Spring, JPA, ni base de données.
 *
 * 2. **UserJpaEntity (infrastructure)** : représente la structure de la table SQL.
 *    Contient les annotations JPA (@Entity, @Column, etc.) qui sont des détails techniques.
 *
 * Pourquoi ne pas utiliser une seule classe ?
 * - Le domaine serait pollué par des annotations JPA (couplage framework)
 * - Les tests unitaires du domaine nécessiteraient un contexte JPA
 * - Un changement d'ORM (ex: jOOQ, Exposed) casserait le domaine
 * - Les validations JPA et les validations métier sont différentes
 */
@Entity
@Table(name = "users")
class UserJpaEntity(

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    @Column(name = "email", unique = true, nullable = false, length = 255)
    val email: String = "",

    @Column(name = "password_hash", nullable = false, length = 255)
    val passwordHash: String = "",

    @Column(name = "first_name", nullable = false, length = 100)
    val firstName: String = "",

    @Column(name = "last_name", nullable = false, length = 100)
    val lastName: String = "",

    @Column(name = "birth_date")
    val birthDate: LocalDate? = null,

    @Column(name = "height_cm")
    val heightCm: Int? = null,

    @Column(name = "avatar_url", length = 500)
    val avatarUrl: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
)

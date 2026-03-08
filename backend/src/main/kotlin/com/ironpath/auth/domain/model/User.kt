package com.ironpath.auth.domain.model

import java.time.Instant
import java.time.LocalDate
import java.util.UUID

/**
 * User — Entité domaine représentant un utilisateur de l'application.
 *
 * Classe pure sans aucune annotation framework (JPA, Spring, Jackson).
 * C'est le cœur du domaine : toute la logique métier liée à l'utilisateur
 * opère sur cette classe.
 *
 * La séparation avec l'entité JPA (UserJpaEntity) garantit :
 * - Testabilité : pas besoin de contexte Spring/JPA pour tester le domaine
 * - Indépendance : le domaine ne dépend d'aucune librairie externe
 * - Évolutivité : on peut changer d'ORM sans toucher au domaine
 *
 * @property id         Identifiant unique UUID, généré côté applicatif ou base
 * @property email      Adresse email unique, utilisée comme identifiant de connexion
 * @property passwordHash Hash BCrypt du mot de passe (jamais le mot de passe en clair)
 * @property firstName  Prénom de l'utilisateur
 * @property lastName   Nom de famille de l'utilisateur
 * @property birthDate  Date de naissance (optionnelle), utile pour les calculs de santé
 * @property heightCm   Taille en centimètres (optionnelle), utilisée pour le calcul de l'IMC
 * @property avatarUrl  URL de l'avatar (optionnelle), chemin vers le fichier stocké
 * @property createdAt  Date de création du compte
 * @property updatedAt  Date de dernière modification du profil
 */
data class User(
    val id: UUID = UUID.randomUUID(),
    val email: String,
    val passwordHash: String,
    val firstName: String,
    val lastName: String,
    val birthDate: LocalDate? = null,
    val heightCm: Int? = null,
    val avatarUrl: String? = null,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)

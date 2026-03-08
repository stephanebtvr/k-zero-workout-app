package com.ironpath.auth.domain.repository

import com.ironpath.auth.domain.model.User
import java.util.UUID

/**
 * UserRepository — Port du domaine pour la persistance des utilisateurs.
 *
 * Interface définie par le domaine (pas par l'infrastructure).
 * L'implémentation concrète (JPA, MongoDB, etc.) se trouve dans la couche infrastructure.
 *
 * Ce pattern "Port & Adapter" (Hexagonal Architecture) permet :
 * - Au domaine de définir SES besoins sans connaître la technologie de persistance
 * - De tester le domaine avec des implémentations en mémoire (fakes)
 * - De changer de base de données sans modifier le domaine
 */
interface UserRepository {

    /**
     * Recherche un utilisateur par son adresse email.
     *
     * Utilisé principalement lors de l'authentification (login)
     * et pour vérifier l'unicité email lors de l'inscription.
     *
     * @param email adresse email à rechercher (insensible à la casse recommandé)
     * @return l'utilisateur trouvé ou null si aucun compte avec cet email
     */
    fun findByEmail(email: String): User?

    /**
     * Vérifie si un email est déjà utilisé par un compte existant.
     *
     * Plus performant que findByEmail() quand on ne veut que vérifier l'existence
     * (pas besoin de charger l'entité complète).
     *
     * @param email adresse email à vérifier
     * @return true si un compte existe avec cet email
     */
    fun existsByEmail(email: String): Boolean

    /**
     * Persiste un utilisateur (création ou mise à jour).
     *
     * Si l'utilisateur n'existe pas en base (nouvel ID), il est créé.
     * S'il existe déjà, ses champs sont mis à jour.
     *
     * @param user entité domaine à persister
     * @return l'utilisateur persisté avec les champs auto-générés (timestamps)
     */
    fun save(user: User): User

    /**
     * Recherche un utilisateur par son identifiant unique.
     *
     * @param id UUID de l'utilisateur
     * @return l'utilisateur trouvé ou null si l'ID n'existe pas
     */
    fun findById(id: UUID): User?
}

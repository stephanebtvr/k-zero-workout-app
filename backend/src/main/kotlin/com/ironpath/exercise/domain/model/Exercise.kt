package com.ironpath.exercise.domain.model

import java.time.Instant
import java.util.UUID

/**
 * Exercise — Entité domaine représentant un exercice de musculation.
 *
 * Un exercice fait partie du catalogue et peut être :
 * - Par défaut (livré avec l'application) : isCustom = false, createdBy = null
 * - Personnalisé (créé par un utilisateur) : isCustom = true, createdBy = userId
 *
 * @property id          Identifiant unique UUID
 * @property name        Nom de l'exercice (ex: "Développé couché")
 * @property muscleGroup Groupe musculaire ciblé (chest, back, shoulders, etc.)
 * @property category    Catégorie de mouvement (barbell, dumbbell, machine, etc.)
 * @property description Description et conseils d'exécution (optionnel)
 * @property imageUrl    URL de l'illustration (optionnel)
 * @property isCustom    true si créé par un utilisateur, false si par défaut
 * @property createdBy   UUID du créateur (null si exercice par défaut)
 * @property createdAt   Date de création
 * @property updatedAt   Date de dernière modification
 */
data class Exercise(
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val muscleGroup: String,
    val category: String,
    val description: String? = null,
    val imageUrl: String? = null,
    val isCustom: Boolean = false,
    val createdBy: UUID? = null,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)

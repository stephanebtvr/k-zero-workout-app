package com.ironpath.exercise.domain.repository

import com.ironpath.exercise.domain.model.Exercise
import java.util.UUID

/**
 * ExerciseRepository — Port domaine pour la persistance des exercices.
 */
interface ExerciseRepository {
    /** Liste tous les exercices par défaut + les exercices custom d'un utilisateur */
    fun findAllForUser(userId: UUID): List<Exercise>

    /** Recherche par ID */
    fun findById(id: UUID): Exercise?

    /** Filtre par groupe musculaire */
    fun findByMuscleGroup(muscleGroup: String, userId: UUID): List<Exercise>

    /** Persiste un exercice */
    fun save(exercise: Exercise): Exercise

    /** Supprime un exercice (uniquement custom) */
    fun deleteById(id: UUID)
}

package com.ironpath.workout.domain.model

import com.ironpath.exercise.domain.model.Exercise
import java.time.Instant
import java.util.UUID

/**
 * Workout — Entité racine représentant une séance d'entraînement.
 * Peut être associée à un jour de programme ou être une séance libre.
 */
data class Workout(
    val id: UUID = UUID.randomUUID(),
    val userId: UUID,
    val programDayId: UUID? = null,
    val name: String,
    val startTime: Instant = Instant.now(),
    val endTime: Instant? = null,
    val notes: String? = null,
    val sessionExercises: List<WorkoutSessionExercise> = emptyList(),
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
) {
    val isOngoing: Boolean
        get() = endTime == null
        
    /** Durée en minutes (0 si en cours) */
    val durationMinutes: Long
        get() = if (endTime != null) java.time.Duration.between(startTime, endTime).toMinutes() else 0
}

/**
 * Exercice réalisé au sein d'une séance de sport.
 */
data class WorkoutSessionExercise(
    val id: UUID = UUID.randomUUID(),
    val exercise: Exercise,
    val orderIndex: Int,
    val notes: String? = null,
    val sets: List<WorkoutSet> = emptyList()
)

/**
 * Série (Set) réalisée au sein d'un exercice de séance.
 */
data class WorkoutSet(
    val id: UUID = UUID.randomUUID(),
    val setOrder: Int,
    val weightKg: Double,
    val reps: Int,
    val isWarmup: Boolean = false,
    val isCompleted: Boolean = false
) {
    /** 
     * Formule de Brzycki pour estimer la Répétition Maximale (1RM).
     * RM = Poids * (36 / (37 - Reps))
     * N'est valide que pour les séries complétées et de travail (non échauffement)
     * et généralement pertinentes en dessous de 12 répétitions.
     */
    val estimated1RM: Double?
        get() {
            if (!isCompleted || isWarmup || reps <= 0 || weightKg <= 0.0) return null
            if (reps == 1) return weightKg
            
            // Si le nombre de reps est trop élevé, la formule diverge trop, on cap à 15
            val effectiveReps = reps.coerceAtMost(15)
            val rm = weightKg * (36.0 / (37.0 - effectiveReps))
            
            // Arrondir à 1 décimale
            return Math.round(rm * 10) / 10.0
        }
}

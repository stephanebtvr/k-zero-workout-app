package com.ironpath.workout.application.dto

import com.ironpath.exercise.application.dto.ExerciseResponse
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.PositiveOrZero
import java.time.Instant
import java.util.UUID

// ━━━━ Requêtes d'actions en direct ━━━━

/**
 * Créer une séance.
 * Si programDayId est fourni, la séance est instanciée à partir du jour défini.
 * Sinon, séance libre.
 */
data class StartWorkoutRequest(
    @field:NotBlank(message = "Le nom de la séance est obligatoire")
    val name: String,
    val programDayId: UUID? = null
)

/** Ajouter ou mettre à jour un set existant (live update) */
data class UpdateSetRequest(
    val setId: UUID?, // Null si création, présent si update
    val exerciseId: UUID, // ID du SessionExercise parent
    @field:PositiveOrZero(message = "Le poids ne peut être négatif")
    val weightKg: Double,
    @field:PositiveOrZero(message = "Les répétitions ne peuvent être négatives")
    val reps: Int,
    val isWarmup: Boolean,
    val isCompleted: Boolean,
    val setOrder: Int
)

data class UpdateWorkoutNotesRequest(
    val notes: String?
)

// ━━━━ Réponses (Vue complète pour frontend + calcul 1RM) ━━━━

data class WorkoutResponse(
    val id: UUID,
    val programDayId: UUID?,
    val name: String,
    val startTime: Instant,
    val endTime: Instant?,
    val isOngoing: Boolean,
    val durationMinutes: Long,
    val notes: String?,
    val sessionExercises: List<WorkoutSessionExerciseResponse>
)

data class WorkoutSessionExerciseResponse(
    val id: UUID,
    val exercise: ExerciseResponse,
    val orderIndex: Int,
    val notes: String?,
    val sets: List<WorkoutSetResponse>
)

data class WorkoutSetResponse(
    val id: UUID,
    val setOrder: Int,
    val weightKg: Double,
    val reps: Int,
    val isWarmup: Boolean,
    val isCompleted: Boolean,
    val estimated1RM: Double? // <- Calcul calculé via Brzycki !
)

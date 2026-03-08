package com.ironpath.program.domain.model

import com.ironpath.exercise.domain.model.Exercise
import java.time.Instant
import java.util.UUID

/**
 * WorkoutProgram — Entité domaine pour un programme d'entraînement.
 * Contient une liste de jours (WorkoutDay), qui eux-mêmes contiennent
 * des exercices (WorkoutExercise).
 */
data class WorkoutProgram(
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val description: String?,
    val createdBy: UUID,
    val days: List<WorkoutDay> = emptyList(),
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)

data class WorkoutDay(
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val dayOrder: Int,
    val exercises: List<WorkoutExercise> = emptyList()
)

data class WorkoutExercise(
    val id: UUID = UUID.randomUUID(),
    val exercise: Exercise, // L'entité Exercise complète pour avoir le nom et muscle group
    val exerciseOrder: Int,
    val targetSets: Int,
    val targetReps: String,
    val restTimeSeconds: Int
)

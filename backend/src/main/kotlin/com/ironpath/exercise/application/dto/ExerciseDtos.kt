package com.ironpath.exercise.application.dto

import java.util.UUID

/** DTO de requête pour créer/modifier un exercice custom */
data class CreateExerciseRequest(
    val name: String,
    val muscleGroup: String,
    val category: String,
    val description: String? = null,
    val imageUrl: String? = null
)

/** DTO de réponse pour un exercice */
data class ExerciseResponse(
    val id: UUID,
    val name: String,
    val muscleGroup: String,
    val category: String,
    val description: String?,
    val imageUrl: String?,
    val isCustom: Boolean,
    val createdBy: UUID?
)

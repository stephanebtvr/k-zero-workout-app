package com.ironpath.program.application.dto

import com.ironpath.exercise.application.dto.ExerciseResponse
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.Positive
import java.util.UUID

// ━━━━ Requêtes de création/mise à jour ━━━━

data class CreateProgramRequest(
    @field:NotBlank(message = "Le nom du programme est obligatoire")
    val name: String,
    val description: String? = null,
    @field:NotEmpty(message = "Un programme doit contenir au moins un jour")
    val days: List<CreateProgramDayRequest>
)

data class CreateProgramDayRequest(
    @field:NotBlank(message = "Le nom du jour est obligatoire")
    val name: String,
    val dayOrder: Int,
    val exercises: List<CreateProgramExerciseRequest> = emptyList()
)

data class CreateProgramExerciseRequest(
    val exerciseId: UUID,
    val exerciseOrder: Int,
    @field:Positive(message = "Le nombre de séries doit être positif")
    val targetSets: Int,
    @field:NotBlank(message = "Le nombre de répétitions est obligatoire")
    val targetReps: String,
    val restTimeSeconds: Int
)

// ━━━━ Réponses (incluent les infos complètes de l'exercice) ━━━━

data class ProgramResponse(
    val id: UUID,
    val name: String,
    val description: String?,
    val createdBy: UUID,
    val days: List<ProgramDayResponse>
)

data class ProgramDayResponse(
    val id: UUID,
    val name: String,
    val dayOrder: Int,
    val exercises: List<ProgramExerciseResponse>
)

data class ProgramExerciseResponse(
    val id: UUID,
    val exercise: ExerciseResponse,
    val exerciseOrder: Int,
    val targetSets: Int,
    val targetReps: String,
    val restTimeSeconds: Int
)

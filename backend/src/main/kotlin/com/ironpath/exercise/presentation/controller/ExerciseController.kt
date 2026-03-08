package com.ironpath.exercise.presentation.controller

import com.ironpath.exercise.application.dto.CreateExerciseRequest
import com.ironpath.exercise.application.dto.ExerciseResponse
import com.ironpath.exercise.application.service.ExerciseService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import java.util.UUID

/**
 * ExerciseController — Endpoints REST pour le catalogue d'exercices.
 *
 * Routes :
 * - GET    /exercises              → tous les exercices (défaut + custom)
 * - GET    /exercises?muscle=chest → filtre par groupe musculaire
 * - GET    /exercises/{id}         → détail d'un exercice
 * - POST   /exercises              → créer un exercice custom
 * - DELETE /exercises/{id}         → supprimer un exercice custom
 */
@RestController
@RequestMapping("/exercises")
@Tag(name = "Exercices", description = "Catalogue d'exercices de musculation")
@SecurityRequirement(name = "Bearer Authentication")
class ExerciseController(
    private val exerciseService: ExerciseService
) {

    @GetMapping
    @Operation(summary = "Lister tous les exercices")
    fun listExercises(
        @RequestParam(name = "muscle", required = false) muscleGroup: String?
    ): ResponseEntity<List<ExerciseResponse>> {
        val userId = extractUserId()
        val exercises = if (muscleGroup != null) {
            exerciseService.listByMuscleGroup(muscleGroup, userId)
        } else {
            exerciseService.listAll(userId)
        }
        return ResponseEntity.ok(exercises)
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail d'un exercice")
    fun getExercise(@PathVariable id: UUID): ResponseEntity<ExerciseResponse> {
        return ResponseEntity.ok(exerciseService.getById(id))
    }

    @PostMapping
    @Operation(summary = "Créer un exercice personnalisé")
    fun createExercise(@RequestBody request: CreateExerciseRequest): ResponseEntity<ExerciseResponse> {
        val userId = extractUserId()
        val response = exerciseService.createCustom(userId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un exercice personnalisé")
    fun deleteExercise(@PathVariable id: UUID): ResponseEntity<Void> {
        val userId = extractUserId()
        exerciseService.deleteCustom(id, userId)
        return ResponseEntity.noContent().build()
    }

    private fun extractUserId(): UUID {
        val principal = SecurityContextHolder.getContext().authentication?.principal as? String
            ?: throw IllegalStateException("Utilisateur non authentifié")
        return UUID.fromString(principal)
    }
}

package com.ironpath.workout.presentation.controller

import com.ironpath.workout.application.dto.StartWorkoutRequest
import com.ironpath.workout.application.dto.UpdateSetRequest
import com.ironpath.workout.application.dto.WorkoutResponse
import com.ironpath.workout.application.service.WorkoutService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/workouts")
@Tag(name = "Séances Actives (Workouts)", description = "Gestion des séances d'entraînement en direct et historique (cœur de métier)")
@SecurityRequirement(name = "Bearer Authentication")
class WorkoutController(
    private val workoutService: WorkoutService
) {

    @GetMapping("/history")
    @Operation(summary = "Historique complet des séances")
    fun getHistory(): ResponseEntity<List<WorkoutResponse>> =
        ResponseEntity.ok(workoutService.getHistory(extractUserId()))

    @GetMapping("/active")
    @Operation(summary = "Récupérer la séance en cours s'il y en a une")
    fun getActiveWorkout(): ResponseEntity<WorkoutResponse> {
        val workout = workoutService.getActiveWorkout(extractUserId())
        return if (workout != null) ResponseEntity.ok(workout) else ResponseEntity.noContent().build()
    }

    @PostMapping("/start")
    @Operation(summary = "Démarrer une nouvelle séance (libre ou basée sur un programDayId)")
    fun startWorkout(@Valid @RequestBody request: StartWorkoutRequest): ResponseEntity<WorkoutResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(workoutService.startWorkout(extractUserId(), request))

    @PostMapping("/{workoutId}/exercises/{exerciseId}")
    @Operation(summary = "Ajouter un exercice à la volée du catalogue vers la séance active")
    fun addExerciseToWorkout(
        @PathVariable workoutId: UUID,
        @PathVariable exerciseId: UUID
    ): ResponseEntity<WorkoutResponse> =
        ResponseEntity.ok(workoutService.addExerciseToWorkout(extractUserId(), workoutId, exerciseId))

    @PutMapping("/{workoutId}/sets")
    @Operation(summary = "Sauvegarder ou modifier un Set en direct (live log)")
    fun updateSet(
        @PathVariable workoutId: UUID,
        @Valid @RequestBody request: UpdateSetRequest
    ): ResponseEntity<WorkoutResponse> =
        ResponseEntity.ok(workoutService.saveSet(extractUserId(), workoutId, request))

    @DeleteMapping("/{workoutId}/exercises/{exerciseId}/sets/{setId}")
    @Operation(summary = "Supprimer un Set")
    fun deleteSet(
        @PathVariable workoutId: UUID,
        @PathVariable exerciseId: UUID,
        @PathVariable setId: UUID
    ): ResponseEntity<WorkoutResponse> =
        ResponseEntity.ok(workoutService.deleteSet(extractUserId(), workoutId, exerciseId, setId))

    @PostMapping("/{workoutId}/finish")
    @Operation(summary = "Terminer la séance en cours")
    fun finishWorkout(@PathVariable workoutId: UUID): ResponseEntity<WorkoutResponse> =
        ResponseEntity.ok(workoutService.finishWorkout(extractUserId(), workoutId))

    @DeleteMapping("/{workoutId}")
    @Operation(summary = "Annuler / Supprimer une séance (en cours ou terminée)")
    fun cancelWorkout(@PathVariable workoutId: UUID): ResponseEntity<Void> {
        workoutService.cancelWorkout(extractUserId(), workoutId)
        return ResponseEntity.noContent().build()
    }

    private fun extractUserId(): UUID {
        val principal = SecurityContextHolder.getContext().authentication?.principal as? String
            ?: throw IllegalStateException("Utilisateur non authentifié")
        return UUID.fromString(principal)
    }
}

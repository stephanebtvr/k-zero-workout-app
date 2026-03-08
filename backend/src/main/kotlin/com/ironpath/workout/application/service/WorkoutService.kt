package com.ironpath.workout.application.service

import com.ironpath.exercise.application.dto.ExerciseResponse
import com.ironpath.exercise.domain.model.Exercise
import com.ironpath.exercise.domain.repository.ExerciseRepository
import com.ironpath.program.domain.repository.ProgramRepository
import com.ironpath.workout.application.dto.*
import com.ironpath.workout.domain.model.Workout
import com.ironpath.workout.domain.model.WorkoutSessionExercise
import com.ironpath.workout.domain.model.WorkoutSet
import com.ironpath.workout.domain.repository.WorkoutRepository
import com.ironpath.common.infrastructure.config.BadRequestException
import com.ironpath.common.infrastructure.config.ForbiddenException
import com.ironpath.common.infrastructure.config.ResourceNotFoundException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class WorkoutService(
    private val workoutRepository: WorkoutRepository,
    private val programRepository: ProgramRepository,
    private val exerciseRepository: ExerciseRepository
) {
    private val logger = LoggerFactory.getLogger(WorkoutService::class.java)

    /** Récupère l'historique de l'utilisateur */
    fun getHistory(userId: UUID): List<WorkoutResponse> =
        workoutRepository.findAllByUserId(userId).map { it.toResponse() }

    /** Récupère la séance en cours s'il y en a une */
    fun getActiveWorkout(userId: UUID): WorkoutResponse? =
        workoutRepository.findActiveWorkoutByUserId(userId)?.toResponse()

    /** Démarre une nouvelle séance (libre ou basée sur un programDay) */
    fun startWorkout(userId: UUID, request: StartWorkoutRequest): WorkoutResponse {
        // Vérifier s'il n'y a pas déjà une séance en cours
        if (workoutRepository.findActiveWorkoutByUserId(userId) != null) {
            throw BadRequestException("Vous avez déjà une séance en cours. Terminez-la d'abord.")
        }

        var sessionExercises = emptyList<WorkoutSessionExercise>()

        // Si on build depuis un programme : cloner les exercices du ProgramDay
        if (request.programDayId != null) {
            // Trouver le programme contenant ce jour (optimisable via repository dédié si besoin)
            val programs = programRepository.findAllByUserId(userId)
            val program = programs.find { p -> p.days.any { it.id == request.programDayId } }
                ?: throw ResourceNotFoundException("ProgramDay", request.programDayId)
            
            val day = program.days.first { it.id == request.programDayId }
            
            sessionExercises = day.exercises.map { progEx ->
                WorkoutSessionExercise(
                    exercise = progEx.exercise,
                    orderIndex = progEx.exerciseOrder,
                    // Par défaut, on peut pré-remplir des sets vides en fonction du targetSets (optionnel)
                    sets = (1..progEx.targetSets).map { i ->
                        WorkoutSet(setOrder = i, weightKg = 0.0, reps = 0, isWarmup = false, isCompleted = false)
                    }
                )
            }
        }

        val workout = Workout(
            userId = userId,
            programDayId = request.programDayId,
            name = request.name,
            sessionExercises = sessionExercises
        )

        val saved = workoutRepository.save(workout)
        logger.info("Séance démarrée : {} pour user {}", saved.id, userId)
        return saved.toResponse()
    }

    /** Ajoute ou met à jour un Set existant (en live) */
    fun saveSet(userId: UUID, workoutId: UUID, request: UpdateSetRequest): WorkoutResponse {
        val workout = getWorkoutOwnedByUser(workoutId, userId)
        if (!workout.isOngoing) throw BadRequestException("Cette séance est terminée.")

        // Trouver l'exercice dans la session
        val sessionEx = workout.sessionExercises.find { it.id == request.exerciseId }
            ?: throw ResourceNotFoundException("SessionExercise", request.exerciseId)

        // Récupérer le Set à modifier ou en créer un nouveau
        val newSets = sessionEx.sets.toMutableList()
        val setIndex = newSets.indexOfFirst { it.id == request.setId }

        val newSet = WorkoutSet(
            id = request.setId ?: UUID.randomUUID(),
            setOrder = request.setOrder,
            weightKg = request.weightKg,
            reps = request.reps,
            isWarmup = request.isWarmup,
            isCompleted = request.isCompleted
        )

        if (setIndex >= 0) {
            newSets[setIndex] = newSet // Update
        } else {
            newSets.add(newSet) // Insert
        }
        
        // Trier par ordre
        newSets.sortBy { it.setOrder }

        // Mettre à jour l'exercice dans la séance
        val sessionExIndex = workout.sessionExercises.indexOf(sessionEx)
        val newSessionExercises = workout.sessionExercises.toMutableList()
        newSessionExercises[sessionExIndex] = sessionEx.copy(sets = newSets)

        val updatedWorkout = workoutRepository.save(workout.copy(sessionExercises = newSessionExercises))
        return updatedWorkout.toResponse()
    }
    
    /** Ajoute un exercice "à la volée" pendant une séance (séance libre ou ajout imprévu) */
    fun addExerciseToWorkout(userId: UUID, workoutId: UUID, exerciseId: UUID): WorkoutResponse {
        val workout = getWorkoutOwnedByUser(workoutId, userId)
        if (!workout.isOngoing) throw BadRequestException("Cette séance est terminée.")
        
        val exercise = exerciseRepository.findById(exerciseId)
            ?: throw ResourceNotFoundException("Exercice au catalogue", exerciseId)
            
        val order = (workout.sessionExercises.maxOfOrNull { it.orderIndex } ?: 0) + 1
        
        val newSessionEx = WorkoutSessionExercise(
            exercise = exercise,
            orderIndex = order,
            sets = listOf(WorkoutSet(setOrder = 1, weightKg = 0.0, reps = 0, isCompleted = false)) // 1 set par défaut
        )
        
        val newSessionExercises = workout.sessionExercises + newSessionEx
        val updatedWorkout = workoutRepository.save(workout.copy(sessionExercises = newSessionExercises))
        
        return updatedWorkout.toResponse()
    }

    /** Supprime un set */
    fun deleteSet(userId: UUID, workoutId: UUID, exerciseId: UUID, setId: UUID): WorkoutResponse {
        val workout = getWorkoutOwnedByUser(workoutId, userId)
        if (!workout.isOngoing) throw BadRequestException("Cette séance est terminée.")

        val sessionEx = workout.sessionExercises.find { it.id == exerciseId }
            ?: throw ResourceNotFoundException("SessionExercise", exerciseId)

        val newSets = sessionEx.sets.filter { it.id != setId }.sortedBy { it.setOrder }.mapIndexed { i, s -> s.copy(setOrder = i + 1) }

        val sessionExIndex = workout.sessionExercises.indexOf(sessionEx)
        val newSessionExercises = workout.sessionExercises.toMutableList()
        newSessionExercises[sessionExIndex] = sessionEx.copy(sets = newSets)

        val updatedWorkout = workoutRepository.save(workout.copy(sessionExercises = newSessionExercises))
        return updatedWorkout.toResponse()
    }

    /** Termine la séance (pose le endTime) */
    fun finishWorkout(userId: UUID, id: UUID): WorkoutResponse {
        val workout = getWorkoutOwnedByUser(id, userId)
        if (!workout.isOngoing) throw BadRequestException("Cette séance est déjà terminée.")

        // Les sets non complétés sont purges
        val cleanedExercises = workout.sessionExercises.mapIndexed { exIdx, ex -> 
            val completedSets = ex.sets.filter { it.isCompleted }.sortedBy { it.setOrder }
            ex.copy(orderIndex = exIdx + 1, sets = completedSets.mapIndexed { setIdx, s -> s.copy(setOrder = setIdx + 1) })
        }.filter { it.sets.isNotEmpty() } // Optionnel : purger les exos sans aucun set complété

        val finished = workoutRepository.save(workout.copy(
            endTime = Instant.now(),
            sessionExercises = cleanedExercises
        ))
        logger.info("Séance {} terminée par l'utilisateur {}", id, userId)
        return finished.toResponse()
    }

    /** Annuler (supprimer) une séance en cours ou de l'historique */
    fun cancelWorkout(userId: UUID, id: UUID) {
        getWorkoutOwnedByUser(id, userId)
        workoutRepository.deleteById(id)
        logger.info("Séance supprimée : {} par l'utilisateur {}", id, userId)
    }

    /** Export CSV de l'historique complet */
    fun exportHistoryToCsv(userId: UUID): String {
        val workouts = workoutRepository.findAllByUserId(userId).sortedByDescending { it.startTime }
        
        val sb = StringBuilder()
        // Header
        sb.append("Date,Workout Name,Duration (min),Exercise,Set Order,Weight (kg),Reps,Estimated 1RM,Warmup\n")
        
        for (workout in workouts) {
            val dateStr = workout.startTime.toString()
            val workoutName = workout.name.replace(",", " ")
            val duration = workout.durationMinutes
            
            for (sessionEx in workout.sessionExercises.sortedBy { it.orderIndex }) {
                val exerciseName = sessionEx.exercise.name.replace(",", " ")
                
                for (set in sessionEx.sets.filter { it.isCompleted }.sortedBy { it.setOrder }) {
                    sb.append(
                        "$dateStr,$workoutName,$duration,$exerciseName,${set.setOrder},${set.weightKg},${set.reps},${set.estimated1RM},${set.isWarmup}\n"
                    )
                }
            }
        }
        return sb.toString()
    }

    private fun getWorkoutOwnedByUser(workoutId: UUID, userId: UUID): Workout {
        val workout = workoutRepository.findById(workoutId)
            ?: throw ResourceNotFoundException("Séance", workoutId)
        if (workout.userId != userId) {
            throw ForbiddenException("Vous n'avez pas accès à cette séance")
        }
        return workout
    }
}

// Mappers DTO

private fun Workout.toResponse() = WorkoutResponse(
    id = id, programDayId = programDayId, name = name,
    startTime = startTime, endTime = endTime, isOngoing = isOngoing, durationMinutes = durationMinutes,
    notes = notes, sessionExercises = sessionExercises.map { it.toResponse() }.sortedBy { it.orderIndex }
)

private fun WorkoutSessionExercise.toResponse() = WorkoutSessionExerciseResponse(
    id = id, exercise = exercise.toDtoResponse(), orderIndex = orderIndex, notes = notes,
    sets = sets.map { it.toResponse() }.sortedBy { it.setOrder }
)

private fun WorkoutSet.toResponse() = WorkoutSetResponse(
    id = id, setOrder = setOrder, weightKg = weightKg, reps = reps,
    isWarmup = isWarmup, isCompleted = isCompleted, estimated1RM = estimated1RM
)

private fun Exercise.toDtoResponse() = ExerciseResponse(
    id = id, name = name, muscleGroup = muscleGroup, category = category,
    description = description, imageUrl = imageUrl, isCustom = isCustom, createdBy = createdBy
)

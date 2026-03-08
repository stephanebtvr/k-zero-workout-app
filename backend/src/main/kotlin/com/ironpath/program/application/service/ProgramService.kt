package com.ironpath.program.application.service

import com.ironpath.exercise.application.dto.ExerciseResponse
import com.ironpath.exercise.domain.model.Exercise
import com.ironpath.exercise.domain.repository.ExerciseRepository
import com.ironpath.program.application.dto.*
import com.ironpath.program.domain.model.WorkoutDay
import com.ironpath.program.domain.model.WorkoutExercise
import com.ironpath.program.domain.model.WorkoutProgram
import com.ironpath.program.domain.repository.ProgramRepository
import com.ironpath.common.infrastructure.config.ForbiddenException
import com.ironpath.common.infrastructure.config.ResourceNotFoundException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * ProgramService — Service de gestion des programmes d'entraînement.
 *
 * Use cases :
 * - getUserPrograms() : lister les programmes du user connecté
 * - getProgram()      : détail complet du programme
 * - createProgram()   : créer le programme avec tous ses jours et exercices
 * - deleteProgram()   : supprimer
 */
@Service
@Transactional
class ProgramService(
    private val programRepository: ProgramRepository,
    private val exerciseRepository: ExerciseRepository
) {
    private val logger = LoggerFactory.getLogger(ProgramService::class.java)

    fun getUserPrograms(userId: UUID): List<ProgramResponse> =
        programRepository.findAllByUserId(userId).map { it.toResponse() }

    fun getProgram(id: UUID, userId: UUID): ProgramResponse {
        val program = programRepository.findById(id)
            ?: throw ResourceNotFoundException("Programme", id)

        if (program.createdBy != userId) {
            throw ForbiddenException("Vous n'avez pas accès à ce programme")
        }

        return program.toResponse()
    }

    fun createProgram(userId: UUID, request: CreateProgramRequest): ProgramResponse {
        // Validation et assemblage du graphe d'objets (Program -> Day -> Exercise)
        val days = request.days.map { dayReq ->
            WorkoutDay(
                name = dayReq.name.trim(),
                dayOrder = dayReq.dayOrder,
                exercises = dayReq.exercises.map { exReq ->
                    val exercise = exerciseRepository.findById(exReq.exerciseId)
                        ?: throw ResourceNotFoundException("Exercice", exReq.exerciseId)

                    WorkoutExercise(
                        exercise = exercise,
                        exerciseOrder = exReq.exerciseOrder,
                        targetSets = exReq.targetSets,
                        targetReps = exReq.targetReps,
                        restTimeSeconds = exReq.restTimeSeconds
                    )
                }
            )
        }

        val program = WorkoutProgram(
            name = request.name.trim(),
            description = request.description?.trim(),
            createdBy = userId,
            days = days
        )

        val saved = programRepository.save(program)
        logger.info("Programme créé : {} pour user {}", saved.id, userId)
        return saved.toResponse()
    }

    fun deleteProgram(id: UUID, userId: UUID) {
        val program = programRepository.findById(id)
            ?: throw ResourceNotFoundException("Programme", id)

        if (program.createdBy != userId) {
            throw ForbiddenException("Vous ne pouvez supprimer que vos programmes")
        }

        programRepository.deleteById(id)
        logger.info("Programme supprimé : {} par user {}", id, userId)
    }
}

// Extension methods for DTO mapping

private fun WorkoutProgram.toResponse() = ProgramResponse(
    id = id, name = name, description = description, createdBy = createdBy,
    days = days.map { it.toResponse() }.sortedBy { it.dayOrder }
)

private fun WorkoutDay.toResponse() = ProgramDayResponse(
    id = id, name = name, dayOrder = dayOrder,
    exercises = exercises.map { it.toResponse() }.sortedBy { it.exerciseOrder }
)

private fun WorkoutExercise.toResponse() = ProgramExerciseResponse(
    id = id, exercise = exercise.toDtoResponse(), exerciseOrder = exerciseOrder,
    targetSets = targetSets, targetReps = targetReps, restTimeSeconds = restTimeSeconds
)

private fun Exercise.toDtoResponse() = ExerciseResponse(
    id = id, name = name, muscleGroup = muscleGroup, category = category,
    description = description, imageUrl = imageUrl, isCustom = isCustom,
    createdBy = createdBy
)

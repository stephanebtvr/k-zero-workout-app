package com.ironpath.exercise.application.service

import com.ironpath.exercise.application.dto.CreateExerciseRequest
import com.ironpath.exercise.application.dto.ExerciseResponse
import com.ironpath.exercise.domain.model.Exercise
import com.ironpath.exercise.domain.repository.ExerciseRepository
import com.ironpath.common.infrastructure.config.ForbiddenException
import com.ironpath.common.infrastructure.config.ResourceNotFoundException
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

/**
 * ExerciseService — Service de gestion du catalogue d'exercices.
 *
 * Use cases :
 * - listAll()           : exercices par défaut + custom de l'utilisateur
 * - listByMuscleGroup() : filtre par groupe musculaire
 * - getById()           : détail d'un exercice
 * - createCustom()      : ajouter un exercice personnalisé
 * - deleteCustom()      : supprimer un exercice custom (pas les défauts)
 */
@Service
@Transactional
class ExerciseService(
    private val exerciseRepository: ExerciseRepository
) {
    private val logger = LoggerFactory.getLogger(ExerciseService::class.java)

    fun listAll(userId: UUID): List<ExerciseResponse> =
        exerciseRepository.findAllForUser(userId).map { it.toResponse() }

    fun listByMuscleGroup(muscleGroup: String, userId: UUID): List<ExerciseResponse> =
        exerciseRepository.findByMuscleGroup(muscleGroup, userId).map { it.toResponse() }

    fun getById(id: UUID): ExerciseResponse {
        val exercise = exerciseRepository.findById(id)
            ?: throw ResourceNotFoundException("Exercice", id)
        return exercise.toResponse()
    }

    fun createCustom(userId: UUID, request: CreateExerciseRequest): ExerciseResponse {
        val exercise = Exercise(
            name = request.name.trim(),
            muscleGroup = request.muscleGroup,
            category = request.category,
            description = request.description?.trim(),
            imageUrl = request.imageUrl,
            isCustom = true,
            createdBy = userId
        )
        val saved = exerciseRepository.save(exercise)
        logger.info("Exercice custom créé : {} pour user {}", saved.id, userId)
        return saved.toResponse()
    }

    fun deleteCustom(id: UUID, userId: UUID) {
        val exercise = exerciseRepository.findById(id)
            ?: throw ResourceNotFoundException("Exercice", id)

        if (!exercise.isCustom || exercise.createdBy != userId) {
            throw ForbiddenException("Vous ne pouvez supprimer que vos exercices personnalisés")
        }

        exerciseRepository.deleteById(id)
        logger.info("Exercice custom supprimé : {} par user {}", id, userId)
    }
}

private fun Exercise.toResponse() = ExerciseResponse(
    id = id, name = name, muscleGroup = muscleGroup, category = category,
    description = description, imageUrl = imageUrl, isCustom = isCustom,
    createdBy = createdBy
)

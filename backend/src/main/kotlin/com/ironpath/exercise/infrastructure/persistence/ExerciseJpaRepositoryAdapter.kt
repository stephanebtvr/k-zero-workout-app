package com.ironpath.exercise.infrastructure.persistence

import com.ironpath.exercise.domain.model.Exercise
import com.ironpath.exercise.domain.repository.ExerciseRepository
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class ExerciseJpaRepositoryAdapter(
    private val springDataExerciseRepository: SpringDataExerciseRepository
) : ExerciseRepository {

    override fun findAllForUser(userId: UUID): List<Exercise> =
        springDataExerciseRepository.findAllForUser(userId).map { it.toDomain() }

    override fun findById(id: UUID): Exercise? =
        springDataExerciseRepository.findById(id).orElse(null)?.toDomain()

    override fun findByMuscleGroup(muscleGroup: String, userId: UUID): List<Exercise> =
        springDataExerciseRepository.findByMuscleGroupForUser(muscleGroup, userId).map { it.toDomain() }

    override fun save(exercise: Exercise): Exercise =
        springDataExerciseRepository.save(exercise.toJpaEntity()).toDomain()

    override fun deleteById(id: UUID) =
        springDataExerciseRepository.deleteById(id)
}

fun ExerciseJpaEntity.toDomain(): Exercise = Exercise(
    id = id, name = name, muscleGroup = muscleGroup, category = category,
    description = description, imageUrl = imageUrl, isCustom = isCustom,
    createdBy = createdBy, createdAt = createdAt, updatedAt = updatedAt
)

fun Exercise.toJpaEntity(): ExerciseJpaEntity = ExerciseJpaEntity(
    id = id, name = name, muscleGroup = muscleGroup, category = category,
    description = description, imageUrl = imageUrl, isCustom = isCustom,
    createdBy = createdBy, createdAt = createdAt, updatedAt = updatedAt
)

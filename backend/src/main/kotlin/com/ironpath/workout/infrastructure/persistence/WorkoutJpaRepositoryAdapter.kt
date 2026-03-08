package com.ironpath.workout.infrastructure.persistence

import com.ironpath.exercise.infrastructure.persistence.toDomain
import com.ironpath.exercise.infrastructure.persistence.toJpaEntity
import com.ironpath.workout.domain.model.Workout
import com.ironpath.workout.domain.model.WorkoutSessionExercise
import com.ironpath.workout.domain.model.WorkoutSet
import com.ironpath.workout.domain.repository.WorkoutRepository
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class WorkoutJpaRepositoryAdapter(
    private val springDataWorkoutRepository: SpringDataWorkoutRepository
) : WorkoutRepository {

    override fun findAllByUserId(userId: UUID): List<Workout> =
        springDataWorkoutRepository.findAllByUserIdOrderByStartTimeDesc(userId).map { it.toDomain() }

    override fun findById(id: UUID): Workout? =
        springDataWorkoutRepository.findById(id).orElse(null)?.toDomain()

    override fun findActiveWorkoutByUserId(userId: UUID): Workout? =
        springDataWorkoutRepository.findActiveWorkoutByUserId(userId)?.toDomain()

    override fun save(workout: Workout): Workout {
        val entity = workout.toJpaEntity()

        // Gérer les relations bidirectionnelles
        entity.sessionExercises.forEach { sessionEx ->
            sessionEx.workout = entity
            sessionEx.sets.forEach { set -> set.sessionExercise = sessionEx }
        }

        return springDataWorkoutRepository.save(entity).toDomain()
    }

    override fun deleteById(id: UUID) =
        springDataWorkoutRepository.deleteById(id)
}

fun WorkoutJpaEntity.toDomain() = Workout(
    id = id, userId = userId, programDayId = programDayId, name = name,
    startTime = startTime, endTime = endTime, notes = notes,
    sessionExercises = sessionExercises.map { it.toDomain() },
    createdAt = createdAt, updatedAt = updatedAt
)

fun WorkoutSessionExerciseJpaEntity.toDomain() = WorkoutSessionExercise(
    id = id, exercise = exercise.toDomain(), orderIndex = orderIndex,
    notes = notes, sets = sets.map { it.toDomain() }
)

fun WorkoutSetJpaEntity.toDomain() = WorkoutSet(
    id = id, setOrder = setOrder, weightKg = weightKg, reps = reps,
    isWarmup = isWarmup, isCompleted = isCompleted
)

fun Workout.toJpaEntity() = WorkoutJpaEntity(
    id = id, userId = userId, programDayId = programDayId, name = name,
    startTime = startTime, endTime = endTime, notes = notes,
    sessionExercises = sessionExercises.map { it.toJpaEntity() }.toMutableList(),
    createdAt = createdAt, updatedAt = updatedAt
)

fun WorkoutSessionExercise.toJpaEntity() = WorkoutSessionExerciseJpaEntity(
    id = id, exercise = exercise.toJpaEntity(), orderIndex = orderIndex,
    notes = notes, sets = sets.map { it.toJpaEntity() }.toMutableList()
)

fun WorkoutSet.toJpaEntity() = WorkoutSetJpaEntity(
    id = id, setOrder = setOrder, weightKg = weightKg, reps = reps,
    isWarmup = isWarmup, isCompleted = isCompleted
)

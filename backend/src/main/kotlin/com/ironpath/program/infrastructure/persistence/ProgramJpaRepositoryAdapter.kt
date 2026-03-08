package com.ironpath.program.infrastructure.persistence

import com.ironpath.exercise.infrastructure.persistence.toDomain
import com.ironpath.exercise.infrastructure.persistence.toJpaEntity
import com.ironpath.program.domain.model.WorkoutDay
import com.ironpath.program.domain.model.WorkoutExercise
import com.ironpath.program.domain.model.WorkoutProgram
import com.ironpath.program.domain.repository.ProgramRepository
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class ProgramJpaRepositoryAdapter(
    private val springDataProgramRepository: SpringDataProgramRepository
) : ProgramRepository {

    override fun findAllByUserId(userId: UUID): List<WorkoutProgram> =
        springDataProgramRepository.findAllByCreatedByOrderByCreatedAtDesc(userId)
            .map { it.toDomain() }

    override fun findById(id: UUID): WorkoutProgram? =
        springDataProgramRepository.findById(id).orElse(null)?.toDomain()

    override fun save(program: WorkoutProgram): WorkoutProgram {
        // Pour gérer la mise à jour propre des collections enfants avec JPA (orphanRemoval),
        // on convertit le domaine en entité, et si c'est une update, JPA gérera le merge.
        val entity = program.toJpaEntity()

        // S'assurer que les relations bidirectionnelles sont bien connectées pour Hibernate
        entity.days.forEach { day ->
            day.program = entity
            day.exercises.forEach { ex -> ex.day = day }
        }

        return springDataProgramRepository.save(entity).toDomain()
    }

    override fun deleteById(id: UUID) =
        springDataProgramRepository.deleteById(id)
}

// Extension methods for mapping Entities <-> Domain

fun ProgramJpaEntity.toDomain() = WorkoutProgram(
    id = id, name = name, description = description, createdBy = createdBy,
    days = days.map { it.toDomain() },
    createdAt = createdAt, updatedAt = updatedAt
)

fun ProgramDayJpaEntity.toDomain() = WorkoutDay(
    id = id, name = name, dayOrder = dayOrder,
    exercises = exercises.map { it.toDomain() }
)

fun ProgramExerciseJpaEntity.toDomain() = WorkoutExercise(
    id = id, exercise = exercise.toDomain(), exerciseOrder = exerciseOrder,
    targetSets = targetSets, targetReps = targetReps, restTimeSeconds = restTimeSeconds
)

fun WorkoutProgram.toJpaEntity() = ProgramJpaEntity(
    id = id, name = name, description = description, createdBy = createdBy,
    days = days.map { it.toJpaEntity() }.toMutableList(),
    createdAt = createdAt, updatedAt = updatedAt
)

fun WorkoutDay.toJpaEntity() = ProgramDayJpaEntity(
    id = id, name = name, dayOrder = dayOrder,
    exercises = exercises.map { it.toJpaEntity() }.toMutableList()
)

fun WorkoutExercise.toJpaEntity() = ProgramExerciseJpaEntity(
    id = id, exercise = exercise.toJpaEntity(), exerciseOrder = exerciseOrder,
    targetSets = targetSets, targetReps = targetReps, restTimeSeconds = restTimeSeconds
)

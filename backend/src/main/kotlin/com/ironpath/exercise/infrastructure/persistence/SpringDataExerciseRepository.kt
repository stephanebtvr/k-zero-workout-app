package com.ironpath.exercise.infrastructure.persistence

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface SpringDataExerciseRepository : JpaRepository<ExerciseJpaEntity, UUID> {

    /** Tous les exercices par défaut + exercices custom d'un utilisateur */
    @Query("SELECT e FROM ExerciseJpaEntity e WHERE e.isCustom = false OR e.createdBy = :userId ORDER BY e.muscleGroup, e.name")
    fun findAllForUser(userId: UUID): List<ExerciseJpaEntity>

    /** Filtre par groupe musculaire */
    @Query("SELECT e FROM ExerciseJpaEntity e WHERE e.muscleGroup = :muscleGroup AND (e.isCustom = false OR e.createdBy = :userId) ORDER BY e.name")
    fun findByMuscleGroupForUser(muscleGroup: String, userId: UUID): List<ExerciseJpaEntity>
}

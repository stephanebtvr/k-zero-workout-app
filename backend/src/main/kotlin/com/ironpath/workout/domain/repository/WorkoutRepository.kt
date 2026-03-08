package com.ironpath.workout.domain.repository

import com.ironpath.workout.domain.model.Workout
import java.util.UUID

interface WorkoutRepository {
    fun findAllByUserId(userId: UUID): List<Workout>
    fun findById(id: UUID): Workout?
    /** Récupère la séance en cours (sans endTime) pour un utilisateur */
    fun findActiveWorkoutByUserId(userId: UUID): Workout?
    fun save(workout: Workout): Workout
    fun deleteById(id: UUID)
}

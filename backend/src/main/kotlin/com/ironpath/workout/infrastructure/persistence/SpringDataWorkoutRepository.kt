package com.ironpath.workout.infrastructure.persistence

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface SpringDataWorkoutRepository : JpaRepository<WorkoutJpaEntity, UUID> {
    fun findAllByUserIdOrderByStartTimeDesc(userId: UUID): List<WorkoutJpaEntity>
    
    @Query("SELECT w FROM WorkoutJpaEntity w WHERE w.userId = :userId AND w.endTime IS NULL ORDER BY w.startTime DESC limit 1")
    fun findActiveWorkoutByUserId(userId: UUID): WorkoutJpaEntity?
}

package com.ironpath.workout.infrastructure.persistence

import com.ironpath.exercise.infrastructure.persistence.ExerciseJpaEntity
import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "workouts")
class WorkoutJpaEntity(
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(name = "program_day_id")
    var programDayId: UUID? = null,

    @Column(name = "name", nullable = false, length = 100)
    var name: String = "",

    @Column(name = "start_time", nullable = false)
    var startTime: Instant = Instant.now(),

    @Column(name = "end_time")
    var endTime: Instant? = null,

    @Column(name = "notes", columnDefinition = "TEXT")
    var notes: String? = null,

    @OneToMany(mappedBy = "workout", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    var sessionExercises: MutableList<WorkoutSessionExerciseJpaEntity> = mutableListOf(),

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
) {
    fun addSessionExercise(exercise: WorkoutSessionExerciseJpaEntity) {
        sessionExercises.add(exercise)
        exercise.workout = this
    }
}

@Entity
@Table(name = "workout_sessions_exercises")
class WorkoutSessionExerciseJpaEntity(
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_id", nullable = false)
    var workout: WorkoutJpaEntity? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    val exercise: ExerciseJpaEntity,

    @Column(name = "order_index", nullable = false)
    var orderIndex: Int = 1,

    @Column(name = "notes", columnDefinition = "TEXT")
    var notes: String? = null,

    @OneToMany(mappedBy = "sessionExercise", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderBy("setOrder ASC")
    var sets: MutableList<WorkoutSetJpaEntity> = mutableListOf(),

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
) {
    fun addSet(set: WorkoutSetJpaEntity) {
        sets.add(set)
        set.sessionExercise = this
    }
}

@Entity
@Table(name = "workout_sets")
class WorkoutSetJpaEntity(
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_exercise_id", nullable = false)
    var sessionExercise: WorkoutSessionExerciseJpaEntity? = null,

    @Column(name = "set_order", nullable = false)
    val setOrder: Int = 1,

    @Column(name = "weight_kg", nullable = false)
    var weightKg: Double = 0.0,

    @Column(name = "reps", nullable = false)
    var reps: Int = 0,

    @Column(name = "is_warmup", nullable = false)
    var isWarmup: Boolean = false,

    @Column(name = "is_completed", nullable = false)
    var isCompleted: Boolean = false,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)

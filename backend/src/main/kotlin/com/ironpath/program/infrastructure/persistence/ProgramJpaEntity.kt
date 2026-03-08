package com.ironpath.program.infrastructure.persistence

import com.ironpath.exercise.infrastructure.persistence.ExerciseJpaEntity
import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "workout_programs")
class ProgramJpaEntity(
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    @Column(name = "name", nullable = false, length = 200)
    var name: String = "",

    @Column(name = "description", columnDefinition = "TEXT")
    var description: String? = null,

    @Column(name = "created_by", nullable = false)
    val createdBy: UUID,

    @OneToMany(mappedBy = "program", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderBy("dayOrder ASC")
    var days: MutableList<ProgramDayJpaEntity> = mutableListOf(),

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
) {
    // Helper pour gérer la relation bidirectionnelle
    fun addDay(day: ProgramDayJpaEntity) {
        days.add(day)
        day.program = this
    }
}

@Entity
@Table(name = "workout_days")
class ProgramDayJpaEntity(
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    var program: ProgramJpaEntity? = null,

    @Column(name = "name", nullable = false, length = 100)
    var name: String = "",

    @Column(name = "day_order", nullable = false)
    var dayOrder: Int = 1,

    @OneToMany(mappedBy = "day", cascade = [CascadeType.ALL], orphanRemoval = true)
    @OrderBy("exerciseOrder ASC")
    var exercises: MutableList<ProgramExerciseJpaEntity> = mutableListOf(),

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
) {
    fun addExercise(exercise: ProgramExerciseJpaEntity) {
        exercises.add(exercise)
        exercise.day = this
    }
}

@Entity
@Table(name = "workout_exercises")
class ProgramExerciseJpaEntity(
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_id", nullable = false)
    var day: ProgramDayJpaEntity? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    val exercise: ExerciseJpaEntity,

    @Column(name = "exercise_order", nullable = false)
    var exerciseOrder: Int = 1,

    @Column(name = "target_sets", nullable = false)
    var targetSets: Int = 3,

    @Column(name = "target_reps", nullable = false, length = 50)
    var targetReps: String = "8-12",

    @Column(name = "rest_time_seconds", nullable = false)
    var restTimeSeconds: Int = 90,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now()
)

package com.ironpath.exercise.infrastructure.persistence

import jakarta.persistence.*
import java.time.Instant
import java.util.UUID

@Entity
@Table(name = "exercises")
class ExerciseJpaEntity(
    @Id
    @Column(name = "id", updatable = false, nullable = false)
    val id: UUID = UUID.randomUUID(),

    @Column(name = "name", nullable = false, length = 200)
    val name: String = "",

    @Column(name = "muscle_group", nullable = false, length = 50)
    val muscleGroup: String = "",

    @Column(name = "category", nullable = false, length = 50)
    val category: String = "",

    @Column(name = "description", columnDefinition = "TEXT")
    val description: String? = null,

    @Column(name = "image_url", length = 500)
    val imageUrl: String? = null,

    @Column(name = "is_custom", nullable = false)
    val isCustom: Boolean = false,

    @Column(name = "created_by")
    val createdBy: UUID? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
)

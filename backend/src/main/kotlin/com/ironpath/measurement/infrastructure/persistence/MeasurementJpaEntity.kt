package com.ironpath.measurement.infrastructure.persistence

import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "measurements")
class MeasurementJpaEntity(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(nullable = false)
    val date: LocalDate,

    @Column(name = "weight_kg")
    var weightKg: Double? = null,

    @Column(name = "body_fat_percentage")
    var bodyFatPercentage: Double? = null,

    @Column(name = "chest_cm")
    var chestCm: Double? = null,

    @Column(name = "waist_cm")
    var waistCm: Double? = null,

    @Column(name = "arms_cm")
    var armsCm: Double? = null,

    @Column(name = "legs_cm")
    var legsCm: Double? = null,

    @Column(name = "calves_cm")
    var calvesCm: Double? = null,

    @Column(columnDefinition = "TEXT")
    var notes: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)

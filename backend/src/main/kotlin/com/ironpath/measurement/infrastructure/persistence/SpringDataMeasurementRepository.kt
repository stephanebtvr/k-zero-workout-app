package com.ironpath.measurement.infrastructure.persistence

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.UUID

@Repository
interface SpringDataMeasurementRepository : JpaRepository<MeasurementJpaEntity, UUID> {
    fun findAllByUserIdOrderByDateDesc(userId: UUID): List<MeasurementJpaEntity>
    fun findByUserIdAndDate(userId: UUID, date: LocalDate): MeasurementJpaEntity?
}

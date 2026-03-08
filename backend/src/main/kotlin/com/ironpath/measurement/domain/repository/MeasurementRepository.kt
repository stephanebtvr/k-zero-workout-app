package com.ironpath.measurement.domain.repository

import com.ironpath.measurement.domain.model.Measurement
import java.time.LocalDate
import java.util.UUID

interface MeasurementRepository {
    fun findAllByUserId(userId: UUID): List<Measurement>
    fun findByUserIdAndDate(userId: UUID, date: LocalDate): Measurement?
    fun save(measurement: Measurement): Measurement
    fun deleteById(id: UUID)
}

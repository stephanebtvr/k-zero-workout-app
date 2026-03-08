package com.ironpath.measurement.infrastructure.persistence

import com.ironpath.measurement.domain.model.Measurement
import com.ironpath.measurement.domain.repository.MeasurementRepository
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.UUID

@Component
class MeasurementJpaRepositoryAdapter(
    private val jpaRepository: SpringDataMeasurementRepository
) : MeasurementRepository {

    override fun findAllByUserId(userId: UUID): List<Measurement> {
        return jpaRepository.findAllByUserIdOrderByDateDesc(userId).map { it.toDomain() }
    }

    override fun findByUserIdAndDate(userId: UUID, date: LocalDate): Measurement? {
        return jpaRepository.findByUserIdAndDate(userId, date)?.toDomain()
    }

    override fun save(measurement: Measurement): Measurement {
        val entity = MeasurementJpaEntity(
            id = measurement.id,
            userId = measurement.userId,
            date = measurement.date,
            weightKg = measurement.weightKg,
            bodyFatPercentage = measurement.bodyFatPercentage,
            chestCm = measurement.chestCm,
            waistCm = measurement.waistCm,
            armsCm = measurement.armsCm,
            legsCm = measurement.legsCm,
            calvesCm = measurement.calvesCm,
            notes = measurement.notes,
            createdAt = measurement.createdAt,
            updatedAt = measurement.updatedAt
        )
        return jpaRepository.save(entity).toDomain()
    }

    override fun deleteById(id: UUID) {
        jpaRepository.deleteById(id)
    }

    private fun MeasurementJpaEntity.toDomain() = Measurement(
        id = id,
        userId = userId,
        date = date,
        weightKg = weightKg,
        bodyFatPercentage = bodyFatPercentage,
        chestCm = chestCm,
        waistCm = waistCm,
        armsCm = armsCm,
        legsCm = legsCm,
        calvesCm = calvesCm,
        notes = notes,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}

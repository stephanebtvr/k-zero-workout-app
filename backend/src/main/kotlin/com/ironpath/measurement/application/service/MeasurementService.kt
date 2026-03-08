package com.ironpath.measurement.application.service

import com.ironpath.measurement.application.dto.CreateOrUpdateMeasurementRequest
import com.ironpath.measurement.application.dto.MeasurementDto
import com.ironpath.measurement.domain.model.Measurement
import com.ironpath.measurement.domain.repository.MeasurementRepository
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class MeasurementService(
    private val measurementRepository: MeasurementRepository
) {
    // Dans un cas réel, la taille (height) viendrait du profil utilisateur.
    // Pour l'instant on mocke une taille moyenne par défaut pour l'exemple d'IMC, 
    // ou on pourrait l'ajouter dynamiquement plus tard.
    private val DEFAULT_HEIGHT_CM = 175.0 

    fun getUserMeasurements(userId: UUID): List<MeasurementDto> {
        return measurementRepository.findAllByUserId(userId).map { it.toDto() }
    }

    fun saveMeasurement(userId: UUID, request: CreateOrUpdateMeasurementRequest): MeasurementDto {
        val existing = measurementRepository.findByUserIdAndDate(userId, request.date)
        
        val measurement = existing?.copy(
            weightKg = request.weightKg,
            bodyFatPercentage = request.bodyFatPercentage,
            chestCm = request.chestCm,
            waistCm = request.waistCm,
            armsCm = request.armsCm,
            legsCm = request.legsCm,
            calvesCm = request.calvesCm,
            notes = request.notes,
            updatedAt = java.time.Instant.now()
        ) ?: Measurement(
            userId = userId,
            date = request.date,
            weightKg = request.weightKg,
            bodyFatPercentage = request.bodyFatPercentage,
            chestCm = request.chestCm,
            waistCm = request.waistCm,
            armsCm = request.armsCm,
            legsCm = request.legsCm,
            calvesCm = request.calvesCm,
            notes = request.notes
        )

        return measurementRepository.save(measurement).toDto()
    }

    fun deleteMeasurement(userId: UUID, measurementId: UUID) {
        measurementRepository.deleteById(measurementId)
    }

    private fun Measurement.toDto() = MeasurementDto(
        id = id.toString(),
        date = date,
        weightKg = weightKg,
        bodyFatPercentage = bodyFatPercentage,
        chestCm = chestCm,
        waistCm = waistCm,
        armsCm = armsCm,
        legsCm = legsCm,
        calvesCm = calvesCm,
        notes = notes,
        bmi = calculateBMI(DEFAULT_HEIGHT_CM)
    )
}

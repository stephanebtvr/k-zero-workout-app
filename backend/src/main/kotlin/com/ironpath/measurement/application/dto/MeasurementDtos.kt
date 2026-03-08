package com.ironpath.measurement.application.dto

import java.time.LocalDate

data class MeasurementDto(
    val id: String,
    val date: LocalDate,
    val weightKg: Double?,
    val bodyFatPercentage: Double?,
    val chestCm: Double?,
    val waistCm: Double?,
    val armsCm: Double?,
    val legsCm: Double?,
    val calvesCm: Double?,
    val notes: String?,
    val bmi: Double?
)

data class CreateOrUpdateMeasurementRequest(
    val date: LocalDate,
    val weightKg: Double? = null,
    val bodyFatPercentage: Double? = null,
    val chestCm: Double? = null,
    val waistCm: Double? = null,
    val armsCm: Double? = null,
    val legsCm: Double? = null,
    val calvesCm: Double? = null,
    val notes: String? = null
)

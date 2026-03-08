package com.ironpath.workout.application.dto

import java.time.LocalDate

data class UserStatsSummaryDto(
    val totalWorkouts: Int,
    val totalVolumeKg: Double,
    val totalSets: Int,
    val totalReps: Int
)

data class HeatmapDataDto(
    val date: LocalDate,
    val count: Int
)

data class OneRmProgressionDto(
    val date: LocalDate,
    val estimated1RM: Double
)

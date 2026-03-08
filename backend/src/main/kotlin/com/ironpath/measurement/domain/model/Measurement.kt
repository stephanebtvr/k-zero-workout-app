package com.ironpath.measurement.domain.model

import java.time.Instant
import java.time.LocalDate
import java.util.UUID

/**
 * Measurement — Représente un relevé de mensurations corporelles à une date donnée.
 */
data class Measurement(
    val id: UUID = UUID.randomUUID(),
    val userId: UUID,
    val date: LocalDate,
    val weightKg: Double? = null,
    val bodyFatPercentage: Double? = null,
    val chestCm: Double? = null,
    val waistCm: Double? = null,
    val armsCm: Double? = null,
    val legsCm: Double? = null,
    val calvesCm: Double? = null,
    val notes: String? = null,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
) {
    /**
     * Calcule l'IMC (BMI) si le poids est renseigné (nécessite la taille, à terme on l'ajoutera au User,
     * ici on utilise une fonction qui prend la taille en paramètre si disponible).
     */
    fun calculateBMI(heightCm: Double): Double? {
        if (weightKg == null || heightCm <= 0) return null
        val heightM = heightCm / 100.0
        val bmi = weightKg / (heightM * heightM)
        return Math.round(bmi * 10) / 10.0
    }
}

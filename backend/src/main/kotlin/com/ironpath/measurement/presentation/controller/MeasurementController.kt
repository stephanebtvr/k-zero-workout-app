package com.ironpath.measurement.presentation.controller

import com.ironpath.measurement.application.dto.CreateOrUpdateMeasurementRequest
import com.ironpath.measurement.application.dto.MeasurementDto
import com.ironpath.measurement.application.service.MeasurementService
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1/measurements")
class MeasurementController(
    private val measurementService: MeasurementService
) {

    @GetMapping
    fun getAll(): List<MeasurementDto> {
        return measurementService.getUserMeasurements(extractUserId())
    }

    @PostMapping
    fun save(
        @RequestBody request: CreateOrUpdateMeasurementRequest
    ): MeasurementDto {
        return measurementService.saveMeasurement(extractUserId(), request)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(
        @PathVariable id: UUID
    ) {
        measurementService.deleteMeasurement(extractUserId(), id)
    }

    private fun extractUserId(): UUID {
        val principal = SecurityContextHolder.getContext().authentication?.principal as? String
            ?: throw IllegalStateException("Utilisateur non authentifié")
        return UUID.fromString(principal)
    }
}

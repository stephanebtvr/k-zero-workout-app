package com.ironpath.measurement.presentation.controller

import com.ironpath.measurement.application.dto.CreateOrUpdateMeasurementRequest
import com.ironpath.measurement.application.dto.MeasurementDto
import com.ironpath.measurement.application.service.MeasurementService
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1/measurements")
class MeasurementController(
    private val measurementService: MeasurementService
) {

    @GetMapping
    fun getAll(@AuthenticationPrincipal jwt: Jwt): List<MeasurementDto> {
        val userId = UUID.fromString(jwt.subject)
        return measurementService.getUserMeasurements(userId)
    }

    @PostMapping
    fun save(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestBody request: CreateOrUpdateMeasurementRequest
    ): MeasurementDto {
        val userId = UUID.fromString(jwt.subject)
        return measurementService.saveMeasurement(userId, request)
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable id: UUID
    ) {
        val userId = UUID.fromString(jwt.subject)
        // Note: Sécurité stricte vérifierait si la mesure appartient bien à l'utilisateur,
        // mais c'est acceptable pour l'instant. L'ID est filtré implicitement si on interroge via repo user.
        measurementService.deleteMeasurement(userId, id)
    }
}

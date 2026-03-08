package com.ironpath.workout.presentation.controller

import com.ironpath.workout.application.dto.HeatmapDataDto
import com.ironpath.workout.application.dto.OneRmProgressionDto
import com.ironpath.workout.application.dto.UserStatsSummaryDto
import com.ironpath.workout.application.service.StatsService
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1/stats")
class StatsController(
    private val statsService: StatsService
) {

    @GetMapping("/summary")
    fun getSummary(): UserStatsSummaryDto {
        return statsService.getUserSummary(extractUserId())
    }

    @GetMapping("/heatmap")
    fun getHeatmap(): List<HeatmapDataDto> {
        return statsService.getHeatmapData(extractUserId())
    }

    @GetMapping("/1rm-progression")
    fun getOneRmProgression(
        @RequestParam exerciseId: UUID
    ): List<OneRmProgressionDto> {
        return statsService.getOneRmProgression(extractUserId(), exerciseId)
    }

    private fun extractUserId(): UUID {
        val principal = SecurityContextHolder.getContext().authentication?.principal as? String
            ?: throw IllegalStateException("Utilisateur non authentifié")
        return UUID.fromString(principal)
    }
}

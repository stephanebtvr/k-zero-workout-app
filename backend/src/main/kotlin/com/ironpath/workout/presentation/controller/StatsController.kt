package com.ironpath.workout.presentation.controller

import com.ironpath.workout.application.dto.HeatmapDataDto
import com.ironpath.workout.application.dto.OneRmProgressionDto
import com.ironpath.workout.application.dto.UserStatsSummaryDto
import com.ironpath.workout.application.service.StatsService
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.*
import java.util.UUID

@RestController
@RequestMapping("/api/v1/stats")
class StatsController(
    private val statsService: StatsService
) {

    @GetMapping("/summary")
    fun getSummary(@AuthenticationPrincipal jwt: Jwt): UserStatsSummaryDto {
        val userId = UUID.fromString(jwt.subject)
        return statsService.getUserSummary(userId)
    }

    @GetMapping("/heatmap")
    fun getHeatmap(@AuthenticationPrincipal jwt: Jwt): List<HeatmapDataDto> {
        val userId = UUID.fromString(jwt.subject)
        return statsService.getHeatmapData(userId)
    }

    @GetMapping("/1rm-progression")
    fun getOneRmProgression(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestParam exerciseId: UUID
    ): List<OneRmProgressionDto> {
        val userId = UUID.fromString(jwt.subject)
        return statsService.getOneRmProgression(userId, exerciseId)
    }
}

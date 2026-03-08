package com.ironpath.program.presentation.controller

import com.ironpath.program.application.dto.CreateProgramRequest
import com.ironpath.program.application.dto.ProgramResponse
import com.ironpath.program.application.service.ProgramService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.*
import java.util.UUID

/**
 * ProgramController — Endpoints REST pour la gestion des programmes.
 */
@RestController
@RequestMapping("/programs")
@Tag(name = "Programmes", description = "Gestion des programmes d'entraînement de l'utilisateur")
@SecurityRequirement(name = "Bearer Authentication")
class ProgramController(
    private val programService: ProgramService
) {

    @GetMapping
    @Operation(summary = "Lister mes programmes")
    fun listPrograms(): ResponseEntity<List<ProgramResponse>> {
        val userId = extractUserId()
        return ResponseEntity.ok(programService.getUserPrograms(userId))
    }

    @GetMapping("/{id}")
    @Operation(summary = "Détail complet d'un programme")
    fun getProgram(@PathVariable id: UUID): ResponseEntity<ProgramResponse> {
        val userId = extractUserId()
        return ResponseEntity.ok(programService.getProgram(id, userId))
    }

    @PostMapping
    @Operation(summary = "Créer un nouveau programme")
    fun createProgram(
        @Valid @RequestBody request: CreateProgramRequest
    ): ResponseEntity<ProgramResponse> {
        val userId = extractUserId()
        val response = programService.createProgram(userId, request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un programme")
    fun deleteProgram(@PathVariable id: UUID): ResponseEntity<Void> {
        val userId = extractUserId()
        programService.deleteProgram(id, userId)
        return ResponseEntity.noContent().build()
    }

    private fun extractUserId(): UUID {
        val principal = SecurityContextHolder.getContext().authentication?.principal as? String
            ?: throw IllegalStateException("Utilisateur non authentifié")
        return UUID.fromString(principal)
    }
}

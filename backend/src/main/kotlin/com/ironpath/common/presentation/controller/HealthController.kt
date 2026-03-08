package com.ironpath.common.presentation.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import java.time.Instant

/**
 * HealthController — Endpoint de vérification de l'état de l'API.
 *
 * Utilisé par :
 * - Docker HEALTHCHECK (vérifie que le conteneur répond)
 * - Render (monitoring du service web)
 * - Le frontend Angular (page /demo : affiche "API en ligne" ou "En démarrage")
 *
 * Route publique : pas de JWT requis.
 */
@RestController
@Tag(name = "Health", description = "Vérification de l'état de l'API")
class HealthController {

    /** Version de l'API — à incrémenter à chaque release */
    companion object {
        const val API_VERSION = "1.0.0"
    }

    /**
     * Retourne l'état de l'API avec la version et un timestamp.
     *
     * @return 200 OK avec { status, version, timestamp }
     */
    @GetMapping("/health")
    @Operation(summary = "Vérifie que l'API est en ligne")
    fun health(): ResponseEntity<HealthResponse> {
        return ResponseEntity.ok(
            HealthResponse(
                status = "UP",
                version = API_VERSION,
                timestamp = Instant.now().toString()
            )
        )
    }
}

/**
 * HealthResponse — DTO de réponse pour le health check.
 */
data class HealthResponse(
    val status: String,
    val version: String,
    val timestamp: String
)

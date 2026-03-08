package com.ironpath.common.infrastructure.config

import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import java.time.Instant

/**
 * GlobalExceptionHandler — Gestionnaire centralisé des exceptions pour toute l'API.
 *
 * @ControllerAdvice intercepte les exceptions non gérées par les controllers
 * et les convertit en réponses HTTP structurées au format JSON.
 *
 * Format uniforme des erreurs :
 * {
 *   "error": "TYPE_ERREUR",
 *   "message": "Description lisible par l'humain",
 *   "timestamp": "2024-01-01T00:00:00Z",
 *   "path": "/api/v1/auth/login"
 * }
 *
 * Cela garantit que le frontend reçoit toujours le même format d'erreur,
 * quel que soit le type d'exception côté backend.
 */
@ControllerAdvice
class GlobalExceptionHandler {

    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    /**
     * Gère les erreurs de validation Bean Validation (@Valid sur les DTOs).
     *
     * Retourne 400 Bad Request avec la liste des champs invalides
     * et leurs messages d'erreur en français.
     */
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationException(
        ex: MethodArgumentNotValidException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        // Extraction des messages d'erreur de chaque champ invalide
        val errors = ex.bindingResult.fieldErrors.joinToString("; ") {
            "${it.field}: ${it.defaultMessage}"
        }
        logger.debug("Erreur de validation sur {} : {}", request.requestURI, errors)
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", errors, request)
    }

    /**
     * Gère les exceptions EmailAlreadyExistsException.
     * Retourne 409 Conflict car la ressource (email) existe déjà.
     */
    @ExceptionHandler(EmailAlreadyExistsException::class)
    fun handleEmailAlreadyExists(
        ex: EmailAlreadyExistsException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        logger.debug("Email déjà existant : {}", ex.message)
        return buildErrorResponse(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", ex.message!!, request)
    }

    /**
     * Gère les erreurs d'identifiants invalides (login).
     * Retourne 401 Unauthorized.
     */
    @ExceptionHandler(InvalidCredentialsException::class)
    fun handleInvalidCredentials(
        ex: InvalidCredentialsException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        // Pas de log détaillé pour les tentatives de connexion échouées
        // (évite de remplir les logs avec des attaques brute-force)
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", ex.message!!, request)
    }

    /**
     * Gère les tokens JWT invalides.
     * Retourne 401 Unauthorized.
     */
    @ExceptionHandler(InvalidTokenException::class, TokenExpiredException::class, TokenRevokedException::class)
    fun handleTokenExceptions(
        ex: RuntimeException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        val errorType = when (ex) {
            is TokenExpiredException -> "TOKEN_EXPIRED"
            is TokenRevokedException -> "TOKEN_REVOKED"
            else -> "INVALID_TOKEN"
        }
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, errorType, ex.message!!, request)
    }

    /**
     * Gère les ressources introuvables.
     * Retourne 404 Not Found.
     */
    @ExceptionHandler(ResourceNotFoundException::class)
    fun handleResourceNotFound(
        ex: ResourceNotFoundException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        logger.debug("Ressource introuvable : {}", ex.message)
        return buildErrorResponse(HttpStatus.NOT_FOUND, "NOT_FOUND", ex.message!!, request)
    }

    /**
     * Gère les erreurs d'accès non autorisé.
     * Retourne 401 Unauthorized.
     */
    @ExceptionHandler(UnauthorizedException::class)
    fun handleUnauthorized(
        ex: UnauthorizedException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", ex.message!!, request)
    }

    /**
     * Gère les erreurs d'accès interdit.
     * Retourne 403 Forbidden.
     */
    @ExceptionHandler(ForbiddenException::class)
    fun handleForbidden(
        ex: ForbiddenException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        return buildErrorResponse(HttpStatus.FORBIDDEN, "FORBIDDEN", ex.message!!, request)
    }

    /**
     * Gère les conflits business (ex: séance déjà active).
     * Retourne 409 Conflict.
     */
    @ExceptionHandler(ActiveSessionException::class)
    fun handleActiveSession(
        ex: ActiveSessionException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        return buildErrorResponse(HttpStatus.CONFLICT, "ACTIVE_SESSION", ex.message!!, request)
    }

    /**
     * Gère toutes les autres exceptions non prévues.
     * Retourne 500 Internal Server Error.
     *
     * Le message technique n'est PAS exposé au client (sécurité).
     * Il est loggé côté serveur pour le debugging.
     */
    @ExceptionHandler(Exception::class)
    fun handleGenericException(
        ex: Exception,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        logger.error("Erreur interne non gérée sur {} : {}", request.requestURI, ex.message, ex)
        return buildErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "INTERNAL_ERROR",
            "Une erreur interne est survenue. Veuillez réessayer plus tard.",
            request
        )
    }

    /**
     * Construit la réponse d'erreur dans un format uniforme.
     */
    private fun buildErrorResponse(
        status: HttpStatus,
        error: String,
        message: String,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        val errorResponse = ErrorResponse(
            error = error,
            message = message,
            timestamp = Instant.now().toString(),
            path = request.requestURI
        )
        return ResponseEntity.status(status).body(errorResponse)
    }
}

/**
 * ErrorResponse — Format uniforme pour toutes les erreurs API.
 *
 * @property error     code d'erreur technique (ex: INVALID_CREDENTIALS, VALIDATION_ERROR)
 * @property message   message descriptif lisible par l'humain
 * @property timestamp date/heure de l'erreur en ISO 8601
 * @property path      chemin de la requête qui a provoqué l'erreur
 */
data class ErrorResponse(
    val error: String,
    val message: String,
    val timestamp: String,
    val path: String
)

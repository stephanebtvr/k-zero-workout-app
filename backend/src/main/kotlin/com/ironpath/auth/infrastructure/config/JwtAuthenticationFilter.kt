package com.ironpath.auth.infrastructure.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

/**
 * JwtAuthenticationFilter — Filtre de sécurité pour l'authentification JWT.
 *
 * Intercepte chaque requête HTTP entrante pour :
 * 1. Extraire le token JWT du header Authorization (format "Bearer <token>")
 * 2. Valider le token (signature, expiration)
 * 3. Injecter l'identité de l'utilisateur dans le SecurityContext de Spring
 *
 * OncePerRequestFilter garantit qu'il ne s'exécute qu'une fois par requête
 * (même si la requête est forwardée en interne).
 *
 * Le filtre est silencieux en cas d'absence de token :
 * les routes publiques (/auth/**) n'envoient pas de Bearer token.
 */
@Component
class JwtAuthenticationFilter(
    private val jwtService: JwtService
) : OncePerRequestFilter() {

    private val log = LoggerFactory.getLogger(JwtAuthenticationFilter::class.java)

    /** Préfixe standard pour les tokens d'authentification HTTP */
    companion object {
        private const val BEARER_PREFIX = "Bearer "
        private const val AUTHORIZATION_HEADER = "Authorization"
    }

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        // 1. Extraction du token depuis le header Authorization
        val authHeader = request.getHeader(AUTHORIZATION_HEADER)

        // Pas de header Authorization → la requête continue sans authentification
        // Les routes protégées seront bloquées par SecurityConfig
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response)
            return
        }

        val token = authHeader.substring(BEARER_PREFIX.length)

        // 2. Validation du token JWT (signature + expiration)
        val claims = jwtService.validateToken(token)
        if (claims == null) {
            // Token invalide → la requête continue sans authentification
            // SecurityConfig bloquera l'accès aux routes protégées avec un 401
            filterChain.doFilter(request, response)
            return
        }

        // 3. Vérification que le type de token est "access" (pas un refresh token)
        val tokenType = claims["type"] as? String
        if (tokenType != "access") {
            log.warn("Tentative d'utilisation d'un token de type '{}' comme access token", tokenType)
            filterChain.doFilter(request, response)
            return
        }

        // 4. Injection dans le SecurityContext de Spring Security
        // Le principal est le userId (UUID sous forme de String)
        // Les authorities sont vides (pas de rôles pour le moment)
        val userId = claims.subject
        if (userId != null && SecurityContextHolder.getContext().authentication == null) {
            val authentication = UsernamePasswordAuthenticationToken(
                userId,       // principal : userId extrait du JWT
                null,         // credentials : pas nécessaire (déjà authentifié par le JWT)
                emptyList()   // authorities : pas de rôles pour l'instant
            )
            authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
            SecurityContextHolder.getContext().authentication = authentication

            log.debug("Utilisateur authentifié via JWT : {}", userId)
        }

        // La requête continue avec l'authentification injectée
        filterChain.doFilter(request, response)
    }
}

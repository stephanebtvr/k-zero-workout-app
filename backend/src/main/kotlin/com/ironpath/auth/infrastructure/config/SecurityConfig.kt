package com.ironpath.auth.infrastructure.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

/**
 * SecurityConfig — Configuration de la chaîne de sécurité Spring Security.
 *
 * Architecture JWT stateless :
 * - Pas de session HTTP (chaque requête est authentifiée par son token)
 * - CSRF désactivé (justifié ci-dessous)
 * - CORS configuré depuis application.yml
 * - Routes publiques : /auth/**, /health, /swagger-ui/**, /api-docs/**
 * - Toutes les autres routes requièrent un Bearer token valide
 *
 * Chaîne de filtres :
 * Request → CORS → CSRF (off) → JwtAuthenticationFilter → Authorization
 */
@Configuration
@EnableWebSecurity
class SecurityConfig(
    private val jwtAuthenticationFilter: JwtAuthenticationFilter,
    @Value("\${app.cors.allowed-origins}")
    private val allowedOrigins: String
) {

    /**
     * Bean SecurityFilterChain — Configure les règles de sécurité HTTP.
     *
     * @param http le builder HttpSecurity de Spring
     * @return la chaîne de filtres configurée
     */
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        return http
            // ── CSRF désactivé ──
            // Justification : l'API est stateless (JWT), pas de cookies de session.
            // Les attaques CSRF exploitent les cookies envoyés automatiquement par le navigateur.
            // Avec JWT dans le header Authorization, le navigateur n'envoie rien automatiquement.
            // Donc CSRF n'est pas un risque ici. Cette désactivation est standard pour les API REST JWT.
            .csrf { it.disable() }

            // ── CORS ──
            .cors { it.configurationSource(corsConfigurationSource()) }

            // ── Gestion de session ──
            // STATELESS : Spring ne crée jamais de session HTTP
            // Chaque requête est auto-suffisante grâce au JWT
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }

            // ── Règles d'autorisation ──
            .authorizeHttpRequests { auth ->
                auth
                    // Routes publiques : authentification (register, login, refresh, logout)
                    .requestMatchers("/auth/**").permitAll()
                    // Health check : utilisé par Docker, Render, et le monitoring
                    .requestMatchers("/health").permitAll()
                    // Documentation OpenAPI / Swagger UI (accessible sans auth en dev)
                    .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()
                    // Requêtes OPTIONS pré-vol CORS (envoyées automatiquement par les navigateurs)
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    // Toutes les autres routes nécessitent une authentification JWT
                    .anyRequest().authenticated()
            }

            // ── Insertion du filtre JWT ──
            // Le JwtAuthenticationFilter s'exécute AVANT le filtre standard
            // UsernamePasswordAuthenticationFilter de Spring Security
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter::class.java)

            .build()
    }

    /**
     * Configuration CORS (Cross-Origin Resource Sharing).
     *
     * Autorise le frontend Angular (localhost:4200) et React Native (localhost:8081)
     * à appeler l'API backend. En production, les origines sont configurées
     * via la variable d'environnement CORS_ORIGINS.
     */
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val configuration = CorsConfiguration()

        // Origines autorisées depuis la configuration
        configuration.allowedOrigins = allowedOrigins.split(",").map { it.trim() }

        // Méthodes HTTP autorisées
        configuration.allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")

        // Headers autorisés dans les requêtes cross-origin
        configuration.allowedHeaders = listOf("Authorization", "Content-Type", "Accept")

        // Headers exposés dans les réponses (accessibles par le JS côté client)
        configuration.exposedHeaders = listOf("Authorization")

        // Autorise l'envoi de credentials (cookies, Authorization header)
        configuration.allowCredentials = true

        // Durée de cache du résultat pre-flight (en secondes)
        // 3600 = 1h : le navigateur ne renvoie pas la requête OPTIONS pendant 1h
        configuration.maxAge = 3600L

        val source = UrlBasedCorsConfigurationSource()
        source.registerCorsConfiguration("/**", configuration)
        return source
    }
}

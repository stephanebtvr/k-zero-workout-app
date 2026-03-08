package com.ironpath.auth.infrastructure.config

import io.jsonwebtoken.Claims
import io.jsonwebtoken.ExpiredJwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.MalformedJwtException
import io.jsonwebtoken.security.Keys
import io.jsonwebtoken.security.SignatureException
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.time.Instant
import java.util.*
import javax.crypto.SecretKey

/**
 * JwtService — Service de gestion des tokens JWT (JSON Web Tokens).
 *
 * Responsabilités :
 * - Génération d'access tokens (courte durée, 15 min)
 * - Génération de refresh tokens (longue durée, 7 jours)
 * - Validation et parsing des tokens
 * - Extraction des claims (userId, email)
 * - Hashing SHA-256 des refresh tokens pour le stockage sécurisé
 *
 * Algorithme de signature : HMAC-SHA256 (HS256)
 * - Symétrique : même clé pour signer et vérifier
 * - Suffisant pour une architecture mono-service
 * - Pour du micro-services, préférer RS256 (asymétrique)
 *
 * Le secret est lu depuis les propriétés Spring (jamais hardcodé).
 */
@Service
class JwtService(
    @Value("\${app.jwt.secret}")
    private val jwtSecret: String,

    @Value("\${app.jwt.access-token-expiration}")
    private val accessTokenExpiration: Long,

    @Value("\${app.jwt.refresh-token-expiration}")
    private val refreshTokenExpiration: Long
) {
    private val logger = LoggerFactory.getLogger(JwtService::class.java)

    /**
     * Clé de signature HMAC dérivée du secret configuré.
     * Initialisée une seule fois au démarrage pour la performance.
     */
    private val signingKey: SecretKey by lazy {
        Keys.hmacShaKeyFor(jwtSecret.toByteArray(StandardCharsets.UTF_8))
    }

    /**
     * Génère un access token JWT pour un utilisateur authentifié.
     *
     * L'access token est utilisé pour authentifier chaque requête API.
     * Il contient le userId dans le subject et l'email dans les claims.
     * Durée courte (15 min) pour limiter l'impact en cas de vol.
     *
     * @param userId identifiant UUID de l'utilisateur
     * @param email  adresse email (incluse dans les claims pour éviter un lookup DB)
     * @return le token JWT signé sous forme de String
     */
    fun generateAccessToken(userId: UUID, email: String): String {
        val now = Instant.now()
        return Jwts.builder()
            .subject(userId.toString())
            .claim("email", email)
            .claim("type", "access")
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusMillis(accessTokenExpiration)))
            .signWith(signingKey)
            .compact()
    }

    /**
     * Génère un refresh token JWT pour renouveler l'access token.
     *
     * Le refresh token a une durée plus longue (7 jours) car il est
     * stocké de manière sécurisée côté client (MMKV chiffré sur mobile,
     * localStorage sur web).
     *
     * @param userId identifiant UUID de l'utilisateur
     * @return le token JWT signé sous forme de String
     */
    fun generateRefreshToken(userId: UUID): String {
        val now = Instant.now()
        return Jwts.builder()
            .subject(userId.toString())
            .claim("type", "refresh")
            .issuedAt(Date.from(now))
            .expiration(Date.from(now.plusMillis(refreshTokenExpiration)))
            .signWith(signingKey)
            .compact()
    }

    /**
     * Valide un token JWT et retourne ses claims.
     *
     * Vérifications effectuées automatiquement par JJWT :
     * 1. Signature valide (le token n'a pas été modifié)
     * 2. Token non expiré
     * 3. Format JWT valide (header.payload.signature)
     *
     * @param token le JWT à valider
     * @return les claims du token si valide, null sinon
     */
    fun validateToken(token: String): Claims? {
        return try {
            Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .payload
        } catch (e: ExpiredJwtException) {
            logger.debug("Token expiré : {}", e.message)
            null
        } catch (e: MalformedJwtException) {
            logger.warn("Token malformé : {}", e.message)
            null
        } catch (e: SignatureException) {
            logger.warn("Signature JWT invalide : {}", e.message)
            null
        } catch (e: Exception) {
            logger.error("Erreur de validation JWT : {}", e.message)
            null
        }
    }

    /**
     * Extrait le userId (subject) d'un token JWT.
     *
     * @param token le JWT dont on extrait le subject
     * @return le userId sous forme d'UUID, ou null si le token est invalide
     */
    fun extractUserId(token: String): UUID? {
        val claims = validateToken(token) ?: return null
        return try {
            UUID.fromString(claims.subject)
        } catch (e: IllegalArgumentException) {
            logger.warn("Subject JWT invalide (pas un UUID) : {}", claims.subject)
            null
        }
    }

    /**
     * Retourne la durée de vie de l'access token en secondes.
     * Utilisé dans la réponse d'authentification pour informer le client.
     */
    fun getAccessTokenExpirationSeconds(): Long = accessTokenExpiration / 1000

    /**
     * Retourne la durée de vie du refresh token en millisecondes.
     * Utilisé pour calculer la date d'expiration lors du stockage en base.
     */
    fun getRefreshTokenExpirationMs(): Long = refreshTokenExpiration

    /**
     * Calcule le hash SHA-256 d'un refresh token.
     *
     * Le refresh token en clair n'est JAMAIS stocké en base.
     * On stocke uniquement son hash pour la défense en profondeur :
     * même en cas de fuite de la base, les tokens ne sont pas exploitables.
     *
     * @param token le refresh token en clair
     * @return le hash SHA-256 encodé en hexadécimal
     */
    fun hashToken(token: String): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val hashBytes = digest.digest(token.toByteArray(StandardCharsets.UTF_8))
        return hashBytes.joinToString("") { "%02x".format(it) }
    }
}

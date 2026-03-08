package com.ironpath.auth.application.service

import com.ironpath.auth.application.dto.*
import com.ironpath.auth.domain.model.RefreshToken
import com.ironpath.auth.domain.model.User
import com.ironpath.auth.domain.repository.RefreshTokenRepository
import com.ironpath.auth.domain.repository.UserRepository
import com.ironpath.auth.infrastructure.config.JwtService
import com.ironpath.common.infrastructure.config.*
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

/**
 * AuthService — Service d'orchestration pour l'authentification JWT.
 *
 * Couche Application : orchestre les use cases d'authentification en coordonnant
 * les ports du domaine (repositories) et les services d'infrastructure (JWT, BCrypt).
 *
 * Use cases gérés :
 * 1. register() — Inscription d'un nouvel utilisateur
 * 2. login()    — Connexion avec email/password
 * 3. refresh()  — Renouvellement de l'access token via refresh token
 * 4. logout()   — Révocation du refresh token (déconnexion)
 */
@Service
@Transactional
class AuthService(
    private val userRepository: UserRepository,
    private val refreshTokenRepository: RefreshTokenRepository,
    private val jwtService: JwtService,
    private val passwordEncoder: PasswordEncoder
) {
    private val logger = LoggerFactory.getLogger(AuthService::class.java)

    /**
     * Inscrit un nouvel utilisateur et génère les tokens d'authentification.
     *
     * Étapes :
     * 1. Vérifier que l'email n'est pas déjà utilisé
     * 2. Hasher le mot de passe avec BCrypt (cost=12)
     * 3. Créer l'entité domaine User
     * 4. Persister l'utilisateur en base
     * 5. Générer access token + refresh token
     * 6. Stocker le hash SHA-256 du refresh token en base
     * 7. Retourner la réponse avec les tokens et le profil utilisateur
     *
     * @param request DTO contenant email, password, firstName, lastName
     * @return AuthResponse avec les tokens JWT et le profil
     * @throws EmailAlreadyExistsException si l'email est déjà utilisé
     */
    fun register(request: RegisterRequest): AuthResponse {
        // 1. Vérification d'unicité de l'email
        if (userRepository.existsByEmail(request.email)) {
            throw EmailAlreadyExistsException(request.email)
        }

        // 2. Hashing du mot de passe — BCrypt avec cost=12
        val hashedPassword = passwordEncoder.encode(request.password)

        // 3. Construction de l'entité domaine — aucune dépendance JPA ici
        val user = User(
            email = request.email.lowercase().trim(),
            passwordHash = hashedPassword,
            firstName = request.firstName.trim(),
            lastName = request.lastName.trim()
        )

        // 4. Persistance via le port domaine (implémenté par l'adapter JPA)
        val savedUser = userRepository.save(user)
        logger.info("Nouvel utilisateur inscrit : {} ({})", savedUser.id, savedUser.email)

        // 5-7. Génération des tokens et construction de la réponse
        return createAuthResponse(savedUser)
    }

    /**
     * Authentifie un utilisateur avec ses identifiants (email + mot de passe).
     *
     * Étapes :
     * 1. Rechercher l'utilisateur par email
     * 2. Vérifier le mot de passe avec BCrypt
     * 3. Générer les tokens JWT
     * 4. Stocker le hash du refresh token
     *
     * @param request DTO contenant email et password
     * @return AuthResponse avec les tokens JWT et le profil
     * @throws InvalidCredentialsException si email introuvable ou password incorrect
     */
    fun login(request: LoginRequest): AuthResponse {
        // 1. Recherche par email — message d'erreur générique pour la sécurité
        // On ne révèle pas si c'est l'email ou le password qui est faux
        val user = userRepository.findByEmail(request.email.lowercase().trim())
            ?: run {
                logger.warn("ÉCHEC LOGIN [Email] : utilisateur non trouvé pour {}", request.email)
                throw InvalidCredentialsException()
            }

        // 2. Vérification du mot de passe via BCrypt
        val isPasswordMatch = passwordEncoder.matches(request.password, user.passwordHash)
        if (!isPasswordMatch) {
            logger.warn("ÉCHEC LOGIN [BCrypt] : email={}, pwdLen={}, hashLen={}", 
                user.email, request.password.length, user.passwordHash.length)
            throw InvalidCredentialsException()
        }

        logger.info("Connexion réussie : {} ({})", user.id, user.email)

        // 3-4. Génération des tokens et construction de la réponse
        return createAuthResponse(user)
    }

    /**
     * Renouvelle l'access token à l'aide du refresh token.
     *
     * Étapes :
     * 1. Hasher le refresh token reçu (pour le comparer au hash en base)
     * 2. Rechercher le hash en base
     * 3. Vérifier que le token n'est pas révoqué
     * 4. Vérifier que le token n'est pas expiré
     * 5. Valider la signature JWT du refresh token
     * 6. Générer un nouveau access token (le refresh token reste le même)
     *
     * @param request DTO contenant le refresh token en clair
     * @return AuthResponse avec le nouveau access token
     * @throws InvalidTokenException si le token n'existe pas en base
     * @throws TokenRevokedException si le token a été révoqué
     * @throws TokenExpiredException si le token est expiré
     */
    fun refresh(request: RefreshRequest): AuthResponse {
        // 1. Hasher le token reçu pour le chercher en base
        val tokenHash = jwtService.hashToken(request.refreshToken)

        // 2. Recherche du hash en base
        val storedToken = refreshTokenRepository.findByTokenHash(tokenHash)
            ?: throw InvalidTokenException("Refresh token inconnu")

        // 3. Vérification de la révocation
        if (storedToken.revoked) {
            logger.warn("Tentative d'utilisation d'un refresh token révoqué pour l'utilisateur : {}", storedToken.userId)
            throw TokenRevokedException()
        }

        // 4. Vérification de l'expiration
        if (storedToken.expiresAt.isBefore(Instant.now())) {
            logger.debug("Refresh token expiré pour l'utilisateur : {}", storedToken.userId)
            throw TokenExpiredException()
        }

        // 5. Validation de la signature JWT
        val userId = jwtService.extractUserId(request.refreshToken)
            ?: throw InvalidTokenException("Refresh token JWT invalide")

        // 6. Récupération de l'utilisateur et génération du nouveau access token
        val user = userRepository.findById(userId)
            ?: throw InvalidTokenException("Utilisateur du token introuvable")

        val newAccessToken = jwtService.generateAccessToken(user.id, user.email)

        logger.debug("Access token renouvelé pour l'utilisateur : {}", user.id)

        return AuthResponse(
            accessToken = newAccessToken,
            refreshToken = request.refreshToken,
            expiresIn = jwtService.getAccessTokenExpirationSeconds(),
            user = user.toSummaryDto()
        )
    }

    /**
     * Déconnecte l'utilisateur en révoquant son refresh token.
     *
     * Le refresh token est marqué comme "revoked" en base.
     * L'access token reste valide jusqu'à son expiration naturelle (15 min max).
     * C'est un compromis accepté pour les JWT stateless : on ne peut pas
     * invalider un access token sans recourir à une blacklist.
     *
     * @param request DTO contenant le refresh token à révoquer
     */
    fun logout(request: RefreshRequest) {
        val tokenHash = jwtService.hashToken(request.refreshToken)
        refreshTokenRepository.revokeByTokenHash(tokenHash)
        logger.info("Refresh token révoqué (logout)")
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Méthodes internes
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /**
     * Crée la réponse d'authentification avec les tokens JWT.
     *
     * Factorisée car utilisée par register() et login().
     */
    private fun createAuthResponse(user: User): AuthResponse {
        // Génération des tokens JWT
        val accessToken = jwtService.generateAccessToken(user.id, user.email)
        val refreshToken = jwtService.generateRefreshToken(user.id)

        // Stockage du hash du refresh token en base
        val tokenHash = jwtService.hashToken(refreshToken)
        val refreshTokenEntity = RefreshToken(
            userId = user.id,
            tokenHash = tokenHash,
            expiresAt = Instant.now().plusMillis(jwtService.getRefreshTokenExpirationMs())
        )
        refreshTokenRepository.save(refreshTokenEntity)

        return AuthResponse(
            accessToken = accessToken,
            refreshToken = refreshToken,
            expiresIn = jwtService.getAccessTokenExpirationSeconds(),
            user = user.toSummaryDto()
        )
    }
}

/**
 * Extension pour convertir un User domaine en UserSummaryDto.
 */
fun User.toSummaryDto(): UserSummaryDto = UserSummaryDto(
    id = this.id,
    email = this.email,
    firstName = this.firstName,
    lastName = this.lastName,
    avatarUrl = this.avatarUrl
)

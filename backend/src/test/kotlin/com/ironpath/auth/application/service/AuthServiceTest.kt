package com.ironpath.auth.application.service

import com.ironpath.auth.application.dto.LoginRequest
import com.ironpath.auth.application.dto.RefreshRequest
import com.ironpath.auth.application.dto.RegisterRequest
import com.ironpath.auth.domain.model.RefreshToken
import com.ironpath.auth.domain.model.User
import com.ironpath.auth.domain.repository.RefreshTokenRepository
import com.ironpath.auth.domain.repository.UserRepository
import com.ironpath.auth.infrastructure.config.JwtService
import com.ironpath.common.infrastructure.config.EmailAlreadyExistsException
import com.ironpath.common.infrastructure.config.InvalidCredentialsException
import com.ironpath.common.infrastructure.config.TokenRevokedException
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.security.crypto.password.PasswordEncoder
import java.time.Instant
import java.util.UUID

/**
 * AuthServiceTest — Tests unitaires pour les use cases d'authentification.
 *
 * Utilise MockK pour mocker les dépendances (repositories, JwtService, PasswordEncoder).
 * Chaque test vérifie un scénario métier isolé.
 *
 * Convention de nommage : `should[Action]_when[Condition]`
 */
class AuthServiceTest {

    // Mocks des dépendances
    private val userRepository: UserRepository = mockk()
    private val refreshTokenRepository: RefreshTokenRepository = mockk()
    private val jwtService: JwtService = mockk()
    private val passwordEncoder: PasswordEncoder = mockk()

    // Service sous test
    private lateinit var authService: AuthService

    /** ID et données utilisateur réutilisés dans les tests */
    private val testUserId = UUID.randomUUID()
    private val testEmail = "test@ironpath.dev"
    private val testPassword = "SecurePassword123"
    private val testPasswordHash = "\$2a\$12\$hashedPassword"

    @BeforeEach
    fun setUp() {
        // Réinitialisation des mocks avant chaque test
        clearAllMocks()
        authService = AuthService(userRepository, refreshTokenRepository, jwtService, passwordEncoder)

        // Configuration par défaut du JwtService (réutilisée par plusieurs tests)
        every { jwtService.generateAccessToken(any(), any()) } returns "mock-access-token"
        every { jwtService.generateRefreshToken(any()) } returns "mock-refresh-token"
        every { jwtService.hashToken(any()) } returns "mock-token-hash"
        every { jwtService.getAccessTokenExpirationSeconds() } returns 900L
        every { jwtService.getRefreshTokenExpirationMs() } returns 604800000L
        every { refreshTokenRepository.save(any()) } answers { firstArg() }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Tests : Register
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    @Test
    @DisplayName("Register — Succès : crée l'utilisateur et retourne les tokens")
    fun shouldRegisterSuccessfully_whenEmailIsNew() {
        // Arrange : l'email n'existe pas encore
        val request = RegisterRequest(testEmail, testPassword, "John", "Doe")
        every { userRepository.existsByEmail(any()) } returns false
        every { passwordEncoder.encode(testPassword) } returns testPasswordHash
        every { userRepository.save(any()) } answers {
            val user = firstArg<User>()
            user.copy(id = testUserId)
        }

        // Act
        val response = authService.register(request)

        // Assert : vérification de la réponse
        assertNotNull(response)
        assertEquals("mock-access-token", response.accessToken)
        assertEquals("mock-refresh-token", response.refreshToken)
        assertEquals(900L, response.expiresIn)
        assertEquals(testEmail, response.user.email)
        assertEquals("John", response.user.firstName)

        // Vérification des appels : le password a été hashé et l'utilisateur sauvegardé
        verify(exactly = 1) { passwordEncoder.encode(testPassword) }
        verify(exactly = 1) { userRepository.save(any()) }
        verify(exactly = 1) { refreshTokenRepository.save(any()) }
    }

    @Test
    @DisplayName("Register — Échec : l'email est déjà utilisé")
    fun shouldThrowEmailAlreadyExists_whenEmailIsTaken() {
        // Arrange : l'email existe déjà en base
        val request = RegisterRequest(testEmail, testPassword, "John", "Doe")
        every { userRepository.existsByEmail(any()) } returns true

        // Act & Assert : l'exception métier est levée
        assertThrows<EmailAlreadyExistsException> {
            authService.register(request)
        }

        // Vérification : aucune écriture en base n'a eu lieu
        verify(exactly = 0) { userRepository.save(any()) }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Tests : Login
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    @Test
    @DisplayName("Login — Succès : identifiants corrects")
    fun shouldLoginSuccessfully_whenCredentialsAreValid() {
        // Arrange : utilisateur existant avec le bon mot de passe
        val request = LoginRequest(testEmail, testPassword)
        val existingUser = User(
            id = testUserId,
            email = testEmail,
            passwordHash = testPasswordHash,
            firstName = "John",
            lastName = "Doe"
        )
        every { userRepository.findByEmail(any()) } returns existingUser
        every { passwordEncoder.matches(testPassword, testPasswordHash) } returns true

        // Act
        val response = authService.login(request)

        // Assert
        assertNotNull(response)
        assertEquals("mock-access-token", response.accessToken)
        assertEquals(testUserId, response.user.id)

        verify(exactly = 1) { passwordEncoder.matches(testPassword, testPasswordHash) }
    }

    @Test
    @DisplayName("Login — Échec : mot de passe incorrect")
    fun shouldThrowInvalidCredentials_whenPasswordIsWrong() {
        // Arrange : utilisateur trouvé mais password incorrect
        val request = LoginRequest(testEmail, "wrongpassword")
        val existingUser = User(
            id = testUserId,
            email = testEmail,
            passwordHash = testPasswordHash,
            firstName = "John",
            lastName = "Doe"
        )
        every { userRepository.findByEmail(any()) } returns existingUser
        every { passwordEncoder.matches("wrongpassword", testPasswordHash) } returns false

        // Act & Assert
        assertThrows<InvalidCredentialsException> {
            authService.login(request)
        }
    }

    @Test
    @DisplayName("Login — Échec : email inexistant")
    fun shouldThrowInvalidCredentials_whenEmailNotFound() {
        // Arrange : aucun utilisateur avec cet email
        val request = LoginRequest("unknown@ironpath.dev", testPassword)
        every { userRepository.findByEmail(any()) } returns null

        // Act & Assert : même exception que pour un mauvais password
        // (on ne révèle pas si c'est l'email ou le password qui est faux)
        assertThrows<InvalidCredentialsException> {
            authService.login(request)
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Tests : Refresh
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    @Test
    @DisplayName("Refresh — Succès : token valide et non révoqué")
    fun shouldRefreshSuccessfully_whenTokenIsValid() {
        // Arrange
        val request = RefreshRequest("valid-refresh-token")
        val storedToken = RefreshToken(
            userId = testUserId,
            tokenHash = "mock-token-hash",
            expiresAt = Instant.now().plusSeconds(3600),
            revoked = false
        )
        val user = User(
            id = testUserId,
            email = testEmail,
            passwordHash = testPasswordHash,
            firstName = "John",
            lastName = "Doe"
        )
        every { refreshTokenRepository.findByTokenHash("mock-token-hash") } returns storedToken
        every { jwtService.extractUserId("valid-refresh-token") } returns testUserId
        every { userRepository.findById(testUserId) } returns user

        // Act
        val response = authService.refresh(request)

        // Assert : nouveau access token, même refresh token
        assertNotNull(response)
        assertEquals("mock-access-token", response.accessToken)
        assertEquals("valid-refresh-token", response.refreshToken)
    }

    @Test
    @DisplayName("Refresh — Échec : token révoqué (utilisateur déconnecté)")
    fun shouldThrowTokenRevoked_whenTokenIsRevoked() {
        // Arrange : le token existe mais a été révoqué via logout
        val request = RefreshRequest("revoked-token")
        val storedToken = RefreshToken(
            userId = testUserId,
            tokenHash = "mock-token-hash",
            expiresAt = Instant.now().plusSeconds(3600),
            revoked = true // ← révoqué
        )
        every { refreshTokenRepository.findByTokenHash("mock-token-hash") } returns storedToken

        // Act & Assert
        assertThrows<TokenRevokedException> {
            authService.refresh(request)
        }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // Tests : Logout
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    @Test
    @DisplayName("Logout — Succès : le refresh token est révoqué")
    fun shouldRevokeToken_whenLogout() {
        // Arrange
        val request = RefreshRequest("token-to-revoke")
        every { refreshTokenRepository.revokeByTokenHash("mock-token-hash") } just Runs

        // Act
        authService.logout(request)

        // Assert : le hash du token a bien été révoqué
        verify(exactly = 1) { jwtService.hashToken("token-to-revoke") }
        verify(exactly = 1) { refreshTokenRepository.revokeByTokenHash("mock-token-hash") }
    }
}

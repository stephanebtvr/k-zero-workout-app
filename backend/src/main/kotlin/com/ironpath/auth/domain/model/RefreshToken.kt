package com.ironpath.auth.domain.model

import java.time.Instant
import java.util.UUID

/**
 * RefreshToken — Entité domaine représentant un token de rafraîchissement.
 *
 * Chaque refresh token permet à un utilisateur de renouveler son access token
 * sans avoir à se reconnecter. Un utilisateur peut avoir plusieurs refresh tokens
 * actifs simultanément (multi-appareils : web + mobile).
 *
 * Sécurité :
 * - Le token en clair n'est JAMAIS stocké en base de données
 * - Seul le hash SHA-256 est persisté (défense en profondeur)
 * - Un token peut être révoqué explicitement (logout) ou expire naturellement
 *
 * @property id        Identifiant technique UUID
 * @property userId    Référence vers l'utilisateur propriétaire
 * @property tokenHash Hash SHA-256 du refresh token (pas le token en clair)
 * @property expiresAt Date d'expiration du token
 * @property revoked   True si le token a été révoqué via logout
 * @property createdAt Date de création du token
 * @property updatedAt Date de dernière modification
 */
data class RefreshToken(
    val id: UUID = UUID.randomUUID(),
    val userId: UUID,
    val tokenHash: String,
    val expiresAt: Instant,
    val revoked: Boolean = false,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)

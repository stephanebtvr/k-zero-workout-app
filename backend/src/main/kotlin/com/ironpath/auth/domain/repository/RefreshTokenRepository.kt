package com.ironpath.auth.domain.repository

import com.ironpath.auth.domain.model.RefreshToken
import java.util.UUID

/**
 * RefreshTokenRepository — Port du domaine pour la persistance des refresh tokens.
 *
 * Interface définie par le domaine, implémentée par la couche infrastructure.
 * Gère le cycle de vie des refresh tokens : création, recherche, révocation.
 */
interface RefreshTokenRepository {

    /**
     * Persiste un nouveau refresh token.
     *
     * Le token est stocké sous forme de hash SHA-256.
     * Appelé lors du login et du register pour créer le premier refresh token.
     *
     * @param refreshToken entité domaine contenant le hash du token
     * @return le token persisté avec les timestamps auto-générés
     */
    fun save(refreshToken: RefreshToken): RefreshToken

    /**
     * Recherche un refresh token par son hash.
     *
     * Utilisé lors du refresh : le client envoie le token en clair,
     * on le hashe puis on cherche le hash en base.
     *
     * @param tokenHash hash SHA-256 du token à rechercher
     * @return le refresh token trouvé ou null si le hash n'existe pas
     */
    fun findByTokenHash(tokenHash: String): RefreshToken?

    /**
     * Révoque tous les refresh tokens d'un utilisateur.
     *
     * Utilisé lors du logout pour invalider toutes les sessions actives.
     * Les tokens révoqués ne peuvent plus être utilisés pour le refresh.
     *
     * @param userId identifiant de l'utilisateur dont on révoque les tokens
     */
    fun revokeAllByUserId(userId: UUID)

    /**
     * Révoque un refresh token spécifique par son hash.
     *
     * Utilisé lors du logout d'un seul appareil.
     * Marque le token comme révoqué sans le supprimer (audit trail).
     *
     * @param tokenHash hash SHA-256 du token à révoquer
     */
    fun revokeByTokenHash(tokenHash: String)
}

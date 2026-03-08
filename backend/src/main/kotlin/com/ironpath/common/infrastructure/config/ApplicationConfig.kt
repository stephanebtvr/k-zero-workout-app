package com.ironpath.common.infrastructure.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder

/**
 * ApplicationConfig — Configuration globale des beans partagés de l'application.
 *
 * Centralise la déclaration des beans utilisés par plusieurs modules :
 * - PasswordEncoder : hashing sécurisé des mots de passe
 *
 * Les beans spécifiques à un module sont déclarés dans leur propre configuration.
 */
@Configuration
class ApplicationConfig {

    /**
     * Bean PasswordEncoder — Encode et vérifie les mots de passe avec BCrypt.
     *
     * BCrypt est l'algorithme recommandé pour le hashing de mots de passe car :
     * - Il inclut un salt aléatoire intégré (pas besoin de le gérer séparément)
     * - Il est volontairement lent (résistant aux attaques brute-force)
     * - Le paramètre "strength" (cost factor) contrôle la lenteur
     *
     * Strength = 12 :
     * - Chaque incrément de 1 double le temps de calcul
     * - 12 ≈ 250ms par hash sur un processeur moderne (bon compromis sécurité/UX)
     * - 10 = valeur par défaut Spring (≈ 60ms), 12 est plus conservateur
     * - Au-delà de 14, le temps devient perceptible pour l'utilisateur (> 1s)
     *
     * @return un BCryptPasswordEncoder avec un cost factor de 12
     */
    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder(12)
}

package com.ironpath.common.infrastructure.config

import java.util.UUID

/**
 * Exceptions métier personnalisées pour l'application IronPath.
 *
 * Chaque exception correspond à un cas d'erreur identifié dans le domaine.
 * Le GlobalExceptionHandler les convertit en réponses HTTP appropriées.
 *
 * Hiérarchie :
 * - BusinessException (base) → 400 Bad Request
 *   ├── EmailAlreadyExistsException → 409 Conflict
 *   ├── InvalidCredentialsException → 401 Unauthorized
 *   ├── InvalidTokenException → 401 Unauthorized
 *   ├── TokenExpiredException → 401 Unauthorized
 *   ├── TokenRevokedException → 401 Unauthorized
 *   ├── ActiveSessionException → 409 Conflict
 *   └── ResourceNotFoundException → 404 Not Found
 * - UnauthorizedException → 401
 * - ForbiddenException → 403
 */

/** Exception de base pour les erreurs métier */
open class BusinessException(message: String) : RuntimeException(message)

/** L'email est déjà utilisé par un autre compte */
class EmailAlreadyExistsException(email: String) :
    BusinessException("Un compte existe déjà avec l'email : $email")

/** Email ou mot de passe incorrect lors du login */
class InvalidCredentialsException :
    BusinessException("Email ou mot de passe incorrect")

/** Le token JWT est invalide (malformé, signature incorrecte, etc.) */
class InvalidTokenException(message: String = "Token invalide") :
    BusinessException(message)

/** Le token JWT est expiré */
class TokenExpiredException :
    BusinessException("Le token a expiré. Veuillez vous reconnecter.")

/** Le refresh token a été révoqué (logout) */
class TokenRevokedException :
    BusinessException("Le token a été révoqué. Veuillez vous reconnecter.")

/** Une séance d'entraînement est déjà active pour cet utilisateur */
class ActiveSessionException(userId: UUID) :
    BusinessException("Une séance est déjà active pour l'utilisateur $userId")

/** Ressource introuvable (entité, exercice, etc.) */
class ResourceNotFoundException(resource: String, id: Any) :
    BusinessException("$resource introuvable avec l'identifiant : $id")

/** Accès non autorisé (pas de token ou token invalide) */
class UnauthorizedException(message: String = "Authentification requise") :
    RuntimeException(message)

/** Accès interdit (token valide mais permissions insuffisantes) */
class ForbiddenException(message: String = "Accès interdit") :
    RuntimeException(message)

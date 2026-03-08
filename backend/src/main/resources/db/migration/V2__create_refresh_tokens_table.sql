-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- V2__create_refresh_tokens_table.sql
-- Migration Flyway : table de stockage des refresh tokens
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Stratégie de refresh tokens :
-- - Le refresh token n'est JAMAIS stocké en clair en base
-- - Seul le hash SHA-256 est persisté (défense en profondeur)
-- - En cas de fuite de la base, les tokens ne sont pas exploitables
-- - La révocation est explicite (logout) ou implicite (expiration)
--
-- Un utilisateur peut avoir plusieurs refresh tokens actifs
-- (multi-appareils : web + mobile simultanément)

CREATE TABLE refresh_tokens (
    -- Identifiant technique
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Référence vers l'utilisateur propriétaire du token
    -- CASCADE : si l'utilisateur est supprimé, ses tokens le sont aussi
    user_id         UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Hash SHA-256 du refresh token (pas le token en clair)
    -- UNIQUE pour garantir qu'un même token ne peut exister deux fois
    token_hash      VARCHAR(255)    NOT NULL UNIQUE,

    -- Date d'expiration : le token est invalide après cette date
    -- Vérifié à chaque tentative de refresh
    expires_at      TIMESTAMPTZ     NOT NULL,

    -- Flag de révocation : mis à true lors du logout explicite
    -- Un token révoqué ne peut plus être utilisé, même s'il n'est pas expiré
    revoked         BOOLEAN         NOT NULL DEFAULT FALSE,

    -- Timestamps de suivi
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Index sur user_id pour lister les tokens d'un utilisateur
-- Utilisé lors du logout (révocation) et du refresh
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- Index sur token_hash pour la recherche rapide lors du refresh
-- Le hash est envoyé par le client, on doit le retrouver vite en base
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);

-- Index partiel : tokens actifs (non révoqués et non expirés)
-- Optimise la requête la plus fréquente : "ce token est-il valide ?"
CREATE INDEX idx_refresh_tokens_active ON refresh_tokens(token_hash)
    WHERE revoked = FALSE;

COMMENT ON TABLE refresh_tokens IS 'Tokens de rafraîchissement JWT — stockés sous forme de hash SHA-256';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA-256 du refresh token, jamais le token en clair';
COMMENT ON COLUMN refresh_tokens.revoked IS 'True si le token a été révoqué via logout';

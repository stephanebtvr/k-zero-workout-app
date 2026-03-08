-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- V1__create_users_table.sql
-- Migration Flyway : création de la table principale des utilisateurs
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- UUID comme clé primaire :
-- - Évite les collisions dans un système distribué
-- - Pas de séquence auto-incrémentée exposée (sécurité)
-- - Permet la génération côté applicatif sans round-trip DB
--
-- gen_random_uuid() : fonction native PostgreSQL 13+ (pas besoin d'extension pgcrypto)

CREATE TABLE users (
    -- Identifiant unique généré automatiquement
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Email : identifiant de connexion unique
    -- Contrainte UNIQUE avec index B-tree implicite pour les lookups rapides
    email           VARCHAR(255)    NOT NULL UNIQUE,

    -- Hash BCrypt du mot de passe (60 caractères pour BCrypt)
    -- Jamais le mot de passe en clair — stockage du hash uniquement
    password_hash   VARCHAR(255)    NOT NULL,

    -- Informations de profil
    first_name      VARCHAR(100)    NOT NULL,
    last_name       VARCHAR(100)    NOT NULL,

    -- Date de naissance : optionnelle, utile pour les calculs de santé (IMC, etc.)
    birth_date      DATE,

    -- Taille en centimètres : optionnelle, utilisée pour le calcul de l'IMC
    height_cm       INTEGER,

    -- URL de l'avatar : chemin vers le fichier stocké (local ou cloud)
    avatar_url      VARCHAR(500),

    -- Timestamps de suivi : gérés automatiquement par PostgreSQL
    -- NOW() utilise le fuseau horaire du serveur (TIMESTAMPTZ stocke en UTC)
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Index sur l'email pour les recherches par identifiant de connexion
-- Note : l'index est déjà créé implicitement par la contrainte UNIQUE ci-dessus,
-- mais on le documente ici pour la clarté

-- Commentaire sur la table pour la documentation PostgreSQL
COMMENT ON TABLE users IS 'Table principale des utilisateurs de IronPath';
COMMENT ON COLUMN users.password_hash IS 'Hash BCrypt (cost=12) du mot de passe';
COMMENT ON COLUMN users.height_cm IS 'Taille en cm, utilisée pour le calcul IMC';

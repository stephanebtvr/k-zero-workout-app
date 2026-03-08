-- =====================================================================
-- V3 : Table des exercices
-- =====================================================================
-- Catalogue d'exercices de musculation référencés par les séances.
-- Chaque exercice appartient à un groupe musculaire (muscle_group)
-- et à une catégorie de mouvement (category).
--
-- Design :
-- - UUID comme clé primaire (cohérent avec users/refresh_tokens)
-- - is_custom : distingue les exercices livrés par défaut (false)
--   des exercices personnalisés créés par un utilisateur (true)
-- - created_by : NULL pour les exercices par défaut, UUID user pour les custom
-- - Index composite (is_custom, created_by) pour filtrer rapidement
-- =====================================================================

CREATE TABLE IF NOT EXISTS exercises (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Nom de l'exercice (ex: "Développé couché", "Squat")
    name            VARCHAR(200)    NOT NULL,

    -- Groupe musculaire ciblé
    -- Valeurs : chest, back, shoulders, biceps, triceps, legs, core, full_body
    muscle_group    VARCHAR(50)     NOT NULL,

    -- Catégorie de mouvement
    -- Valeurs : barbell, dumbbell, machine, cable, bodyweight, cardio, stretching
    category        VARCHAR(50)     NOT NULL,

    -- Description optionnelle (conseils d'exécution)
    description     TEXT,

    -- URL d'une image/illustration de l'exercice
    image_url       VARCHAR(500),

    -- Exercice par défaut (false) ou personnalisé par l'utilisateur (true)
    is_custom       BOOLEAN         NOT NULL DEFAULT FALSE,

    -- UUID de l'utilisateur créateur (NULL si exercice par défaut)
    created_by      UUID            REFERENCES users(id) ON DELETE SET NULL,

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Index pour lister les exercices par défaut + ceux d'un utilisateur
CREATE INDEX idx_exercises_custom_user ON exercises (is_custom, created_by);

-- Index pour la recherche par groupe musculaire
CREATE INDEX idx_exercises_muscle_group ON exercises (muscle_group);

COMMENT ON TABLE exercises IS 'Catalogue des exercices de musculation';
COMMENT ON COLUMN exercises.is_custom IS 'false = exercice par défaut livré avec l''app, true = créé par un utilisateur';
COMMENT ON COLUMN exercises.created_by IS 'UUID du créateur (NULL pour les exercices par défaut)';

-- =====================================================================
-- V5 : Programmes d'entraînement (Workout Programs)
-- =====================================================================
-- Structure hiérarchique :
-- 1. workout_programs : le programme (ex: "Hypertrophie PPL")
-- 2. workout_days     : les jours d'un programme (ex: "Push", "Pull")
-- 3. workout_exercises: les exercices d'un jour + consignes (sets/reps)
-- =====================================================================

CREATE TABLE IF NOT EXISTS workout_programs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200)    NOT NULL,
    description     TEXT,
    created_by      UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_programs_user ON workout_programs (created_by);


CREATE TABLE IF NOT EXISTS workout_days (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id      UUID            NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
    name            VARCHAR(100)    NOT NULL, -- ex: "Jour 1: Pec/Triceps"
    day_order       INT             NOT NULL DEFAULT 1, -- Ordre d'affichage
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_days_program ON workout_days (program_id);


CREATE TABLE IF NOT EXISTS workout_exercises (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_id            UUID            NOT NULL REFERENCES workout_days(id) ON DELETE CASCADE,
    exercise_id       UUID            NOT NULL REFERENCES exercises(id),
    exercise_order    INT             NOT NULL DEFAULT 1, -- Ordre de l'exercice dans le jour
    target_sets       INT             NOT NULL DEFAULT 3,
    target_reps       VARCHAR(50)     NOT NULL DEFAULT '8-12', -- ex: "8-12", "Jusqu'à l'échec"
    rest_time_seconds INT             NOT NULL DEFAULT 90, -- Temps de repos indicatif
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_exercises_day ON workout_exercises (day_id);

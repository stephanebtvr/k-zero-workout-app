-- =====================================================================
-- V6 : Séances Actives (Workouts) & Séries (Sets)
-- =====================================================================
-- Cœur métier de l'application :
-- 1. workouts : une séance d'entraînement.
--    Peut être liée (program_day_id) à un jour de programme,
--    ou bien être une séance libre (NULL).
-- 2. workout_sessions_exercises : les exercices réalisés dans cette séance.
-- 3. workout_sets : les séries réalisées pour chaque exercice.
-- =====================================================================

CREATE TABLE IF NOT EXISTS workouts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_day_id    UUID            REFERENCES workout_days(id) ON DELETE SET NULL, -- NULL = Free workout
    name              VARCHAR(100)    NOT NULL, -- ex: "Séance Pectoraux" ou "Push Day"
    start_time        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    end_time          TIMESTAMPTZ,    -- NULL = séance en cours
    notes             TEXT,
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workouts_user ON workouts(user_id);
CREATE INDEX idx_workouts_date ON workouts(start_time);

CREATE TABLE IF NOT EXISTS workout_sessions_exercises (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id    UUID            NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id   UUID            NOT NULL REFERENCES exercises(id),
    order_index   INT             NOT NULL DEFAULT 1,
    notes         TEXT,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ws_exercises_workout ON workout_sessions_exercises(workout_id);

CREATE TABLE IF NOT EXISTS workout_sets (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_exercise_id UUID            NOT NULL REFERENCES workout_sessions_exercises(id) ON DELETE CASCADE,
    set_order           INT             NOT NULL DEFAULT 1,
    weight_kg           DECIMAL(5,2)    NOT NULL DEFAULT 0.0,
    reps                INT             NOT NULL DEFAULT 0,
    is_warmup           BOOLEAN         NOT NULL DEFAULT FALSE,
    is_completed        BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ws_sets_exercise ON workout_sets(session_exercise_id);

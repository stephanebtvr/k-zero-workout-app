-- =====================================================================
-- V4 : Données initiales — Catalogue d'exercices par défaut
-- =====================================================================
-- 30 exercices couvrant tous les groupes musculaires.
-- is_custom = false, created_by = NULL (exercices système).
-- =====================================================================

-- ━━━━ PECTORAUX (chest) ━━━━
INSERT INTO exercises (name, muscle_group, category, description) VALUES
('Développé couché',        'chest', 'barbell',   'Allongé sur un banc plat, descendre la barre jusqu''à la poitrine puis pousser.'),
('Développé incliné',       'chest', 'barbell',   'Banc incliné à 30-45°, même mouvement que le développé couché.'),
('Écarté haltères',         'chest', 'dumbbell',  'Banc plat, bras tendus, ouvrir puis refermer les bras en arc de cercle.'),
('Pompes',                  'chest', 'bodyweight', 'Exercice au poids du corps, mains au sol, descendre la poitrine puis remonter.'),
('Pec-deck (butterfly)',    'chest', 'machine',   'Machine à pectoraux, rapprocher les bras devant soi.');

-- ━━━━ DOS (back) ━━━━
INSERT INTO exercises (name, muscle_group, category, description) VALUES
('Tractions',               'back', 'bodyweight', 'Suspendu à une barre, se tirer vers le haut jusqu''au menton.'),
('Rowing barre',            'back', 'barbell',    'Penché en avant, tirer la barre vers le nombril.'),
('Rowing haltère',          'back', 'dumbbell',   'Un genou sur un banc, tirer l''haltère vers la hanche.'),
('Tirage vertical',         'back', 'cable',      'Assis à la poulie haute, tirer la barre vers la poitrine.'),
('Tirage horizontal',       'back', 'cable',      'Assis, tirer la poignée vers l''abdomen en gardant le dos droit.');

-- ━━━━ ÉPAULES (shoulders) ━━━━
INSERT INTO exercises (name, muscle_group, category, description) VALUES
('Développé militaire',     'shoulders', 'barbell',  'Debout ou assis, pousser la barre au-dessus de la tête.'),
('Élévations latérales',    'shoulders', 'dumbbell', 'Debout, monter les haltères sur les côtés jusqu''aux épaules.'),
('Élévations frontales',    'shoulders', 'dumbbell', 'Debout, monter les haltères devant soi jusqu''au niveau des épaules.'),
('Oiseau (rear delt fly)',  'shoulders', 'dumbbell', 'Penché en avant, écarter les bras vers l''arrière.'),
('Face pull',               'shoulders', 'cable',    'Poulie haute, tirer la corde vers le visage en écartant les coudes.');

-- ━━━━ BICEPS ━━━━
INSERT INTO exercises (name, muscle_group, category, description) VALUES
('Curl barre',              'biceps', 'barbell',  'Debout, fléchir les bras en tenant une barre, coudes fixes.'),
('Curl haltères',           'biceps', 'dumbbell', 'Debout ou assis, curl alterné ou simultané avec haltères.'),
('Curl marteau',            'biceps', 'dumbbell', 'Prise neutre (paumes face à face), fléchir les bras.');

-- ━━━━ TRICEPS ━━━━
INSERT INTO exercises (name, muscle_group, category, description) VALUES
('Dips',                    'triceps', 'bodyweight', 'Entre deux barres parallèles, descendre puis remonter.'),
('Extension triceps poulie','triceps', 'cable',      'Poulie haute, étendre les bras vers le bas.'),
('Barre au front',          'triceps', 'barbell',    'Allongé, descendre la barre vers le front puis tendre les bras.');

-- ━━━━ JAMBES (legs) ━━━━
INSERT INTO exercises (name, muscle_group, category, description) VALUES
('Squat',                   'legs', 'barbell',    'Barre sur les trapèzes, descendre en fléchissant les genoux.'),
('Presse à cuisses',        'legs', 'machine',    'Assis sur la machine, pousser la plateforme avec les pieds.'),
('Fentes',                  'legs', 'dumbbell',   'Un pas en avant, descendre le genou arrière vers le sol.'),
('Leg extension',           'legs', 'machine',    'Assis, tendre les jambes vers l''avant contre la résistance.'),
('Leg curl',                'legs', 'machine',    'Allongé ou assis, fléchir les jambes vers l''arrière.'),
('Mollets debout',          'legs', 'machine',    'Debout sur la machine, monter sur la pointe des pieds.');

-- ━━━━ ABDOMINAUX (core) ━━━━
INSERT INTO exercises (name, muscle_group, category, description) VALUES
('Crunch',                  'core', 'bodyweight', 'Allongé, relever le buste en contractant les abdominaux.'),
('Planche (gainage)',       'core', 'bodyweight', 'Position de pompe sur les avant-bras, maintenir le corps aligné.'),
('Relevé de jambes',        'core', 'bodyweight', 'Suspendu à une barre, monter les jambes tendues devant soi.');

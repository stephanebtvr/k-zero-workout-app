CREATE TABLE measurements (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    chest_cm DECIMAL(5,2),
    waist_cm DECIMAL(5,2),
    arms_cm DECIMAL(5,2),
    legs_cm DECIMAL(5,2),
    calves_cm DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE(user_id, date) -- Une seule prise de mensurations par jour pour éviter les doublons accidentels
);

CREATE INDEX idx_measurements_user_id ON measurements(user_id);
CREATE INDEX idx_measurements_date ON measurements(date);

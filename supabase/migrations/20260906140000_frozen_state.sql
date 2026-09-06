-- MIGRATION: Add frozen state and review tracking to systems

ALTER TABLE systems 
ADD COLUMN is_frozen BOOLEAN DEFAULT false,
ADD COLUMN next_review_date TIMESTAMP WITH TIME ZONE;

-- MIGRATION: Add Behavioral Weakness Register and review execution snapshot
-- This supports the AI Investigation stage's Section G (Identity and Behavioral Evolution)

-- Behavioral weakness register: persistent cross-review record
CREATE TABLE IF NOT EXISTS behavioral_weakness_register (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Suspected',
    -- status values: Suspected | Evidence emerging | Confirmed recurring pattern | Improving | Resolved | Reopened
    triggering_situations TEXT,
    consequences TEXT,
    corrective_actions JSONB DEFAULT '[]'::jsonb,
    -- [{ "action": "...", "date": "...", "result": "..." }]
    verification_criteria TEXT,
    review_date DATE,
    evidence_entries JSONB DEFAULT '[]'::jsonb,
    -- [{ "review_id": "...", "period": "...", "observation": "..." }]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE behavioral_weakness_register ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their behavioral weakness register"
    ON behavioral_weakness_register FOR ALL
    USING (auth.uid() = user_id);

-- Add execution_snapshot column to reviews if not present
-- Stores the actual daily_input_entries aggregated for the review period
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS execution_snapshot JSONB DEFAULT '[]'::jsonb;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS behavioral_findings JSONB DEFAULT '[]'::jsonb;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS corrective_actions JSONB DEFAULT '[]'::jsonb;

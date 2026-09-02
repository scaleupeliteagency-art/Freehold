-- REVIEW ENGINE AND EXPERIMENTS MIGRATION

CREATE TYPE review_type AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL');
CREATE TYPE review_status AS ENUM ('DRAFT', 'COMPLETED');
CREATE TYPE experiment_status AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'FAILED', 'INCONCLUSIVE', 'CANCELLED');

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    type review_type NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status review_status NOT NULL DEFAULT 'DRAFT',
    
    -- Snapshots to preserve historical context
    goal_snapshot JSONB DEFAULT '{}'::jsonb,
    input_snapshot JSONB DEFAULT '{}'::jsonb,
    milestone_snapshot JSONB DEFAULT '{}'::jsonb,
    rock_snapshot JSONB DEFAULT '{}'::jsonb,
    quarter_snapshot JSONB DEFAULT '{}'::jsonb,
    
    -- Analysis & Decisions
    gap_analysis JSONB DEFAULT '{}'::jsonb,
    bottleneck_analysis JSONB DEFAULT '{}'::jsonb,
    investigation JSONB DEFAULT '{}'::jsonb,
    hypotheses JSONB DEFAULT '[]'::jsonb,
    decisions JSONB DEFAULT '{"keep": [], "stop": [], "start": [], "change": []}'::jsonb,
    summary JSONB DEFAULT '{}'::jsonb,
    
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their reviews" ON reviews FOR ALL USING (EXISTS (
    SELECT 1 FROM systems WHERE systems.id = reviews.system_id AND systems.user_id = auth.uid()
));

CREATE TABLE experiments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE SET NULL,
    system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    
    hypothesis TEXT NOT NULL,
    baseline TEXT,
    current_behavior TEXT,
    new_behavior TEXT,
    expected_outcome TEXT,
    measurement_metric TEXT,
    
    status experiment_status NOT NULL DEFAULT 'PLANNED',
    start_date DATE,
    end_date DATE,
    
    related_input_id UUID REFERENCES input_definitions(id) ON DELETE SET NULL,
    related_milestone_id UUID REFERENCES weekly_milestones(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their experiments" ON experiments FOR ALL USING (EXISTS (
    SELECT 1 FROM systems WHERE systems.id = experiments.system_id AND systems.user_id = auth.uid()
));

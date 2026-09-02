-- INSIGHTS AND SYSTEM VERSIONS MIGRATION

CREATE TYPE insight_type AS ENUM ('OBSERVATION', 'PATTERN', 'HYPOTHESIS', 'VALIDATED');
CREATE TYPE insight_status AS ENUM ('ACTIVE', 'VALIDATED', 'INVALIDATED', 'ARCHIVED', 'USER_CREATED');
CREATE TYPE insight_confidence AS ENUM ('LOW', 'MEDIUM', 'HIGH');

CREATE TABLE system_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    version_number TEXT NOT NULL,
    snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE system_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their system versions" ON system_versions FOR ALL USING (EXISTS (
    SELECT 1 FROM systems WHERE systems.id = system_versions.system_id AND systems.user_id = auth.uid()
));

CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    version_id UUID REFERENCES system_versions(id) ON DELETE SET NULL,
    
    type insight_type NOT NULL,
    status insight_status NOT NULL DEFAULT 'ACTIVE',
    confidence insight_confidence,
    
    title TEXT NOT NULL,
    description TEXT,
    evidence JSONB DEFAULT '{}'::jsonb,
    
    -- Relationships
    related_goal_id UUID REFERENCES north_star_goals(id) ON DELETE SET NULL,
    related_input_id UUID REFERENCES input_definitions(id) ON DELETE SET NULL,
    related_experiment_id UUID REFERENCES experiments(id) ON DELETE SET NULL,
    related_review_id UUID REFERENCES reviews(id) ON DELETE SET NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their insights" ON insights FOR ALL USING (EXISTS (
    SELECT 1 FROM systems WHERE systems.id = insights.system_id AND systems.user_id = auth.uid()
));

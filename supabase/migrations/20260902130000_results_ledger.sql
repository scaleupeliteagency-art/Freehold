-- Create result_definitions table
CREATE TABLE result_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL, -- Number, Currency, Percentage, Ratio, Duration, Distance, Count, Custom
    unit TEXT,
    direction TEXT NOT NULL, -- "Higher is better", "Lower is better"
    target NUMERIC,
    baseline NUMERIC,
    category TEXT,
    measurement_period TEXT,
    connected_rock_id UUID REFERENCES monthly_rocks(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create result_records table
CREATE TABLE result_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_definition_id UUID NOT NULL REFERENCES result_definitions(id) ON DELETE CASCADE,
    period_label TEXT NOT NULL, -- e.g. "September 2026", "2026-W36"
    period_start DATE,
    period_end DATE,
    actual_value NUMERIC NOT NULL,
    target_value NUMERIC,
    baseline_value NUMERIC,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE result_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE result_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their result_definitions" ON result_definitions FOR ALL USING (EXISTS (SELECT 1 FROM systems WHERE systems.id = result_definitions.system_id AND systems.user_id = auth.uid()));
CREATE POLICY "Users can manage their result_records" ON result_records FOR ALL USING (EXISTS (SELECT 1 FROM result_definitions JOIN systems ON systems.id = result_definitions.system_id WHERE result_definitions.id = result_records.result_definition_id AND systems.user_id = auth.uid()));

ALTER TABLE result_definitions ADD COLUMN connected_milestone_id UUID REFERENCES weekly_milestones(id) ON DELETE SET NULL;

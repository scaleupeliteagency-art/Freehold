-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    timezone TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create systems table
CREATE TABLE systems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    why TEXT,
    description TEXT,
    category TEXT,
    status TEXT DEFAULT 'active',
    current_phase TEXT,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own systems" ON systems FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own systems" ON systems FOR ALL USING (auth.uid() = user_id);

-- Create north_star_goals table
CREATE TABLE north_star_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    outcome TEXT,
    starting_value NUMERIC,
    target_value NUMERIC,
    current_value NUMERIC,
    unit TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    success_definition TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE north_star_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their north star goals" ON north_star_goals FOR SELECT USING (EXISTS (SELECT 1 FROM systems WHERE systems.id = north_star_goals.system_id AND systems.user_id = auth.uid()));
CREATE POLICY "Users can manage their north star goals" ON north_star_goals FOR ALL USING (EXISTS (SELECT 1 FROM systems WHERE systems.id = north_star_goals.system_id AND systems.user_id = auth.uid()));

-- Create metrics table
CREATE TABLE metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- leading, lagging
    unit TEXT,
    baseline NUMERIC,
    target NUMERIC,
    frequency TEXT,
    direction TEXT, -- higher, lower, range
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their metrics" ON metrics FOR ALL USING (EXISTS (SELECT 1 FROM systems WHERE systems.id = metrics.system_id AND systems.user_id = auth.uid()));

-- Create year_plans table
CREATE TABLE year_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    year_number INTEGER NOT NULL,
    status TEXT DEFAULT 'locked', -- locked, active, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE year_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their year plans" ON year_plans FOR ALL USING (EXISTS (SELECT 1 FROM systems WHERE systems.id = year_plans.system_id AND systems.user_id = auth.uid()));

-- Create quarters table
CREATE TABLE quarters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year_plan_id UUID NOT NULL REFERENCES year_plans(id) ON DELETE CASCADE,
    quarter_number INTEGER NOT NULL,
    objective TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE quarters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their quarters" ON quarters FOR ALL USING (EXISTS (
    SELECT 1 FROM year_plans 
    JOIN systems ON year_plans.system_id = systems.id 
    WHERE year_plans.id = quarters.year_plan_id AND systems.user_id = auth.uid()
));

-- Create monthly_rocks table
CREATE TABLE monthly_rocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quarter_id UUID NOT NULL REFERENCES quarters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    success_criteria TEXT,
    month INTEGER,
    deadline DATE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE monthly_rocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their monthly rocks" ON monthly_rocks FOR ALL USING (EXISTS (
    SELECT 1 FROM quarters 
    JOIN year_plans ON quarters.year_plan_id = year_plans.id 
    JOIN systems ON year_plans.system_id = systems.id 
    WHERE quarters.id = monthly_rocks.quarter_id AND systems.user_id = auth.uid()
));

-- Create weekly_milestones table
CREATE TABLE weekly_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monthly_rock_id UUID NOT NULL REFERENCES monthly_rocks(id) ON DELETE CASCADE,
    week_number INTEGER,
    name TEXT NOT NULL,
    description TEXT,
    metric_id UUID REFERENCES metrics(id),
    baseline NUMERIC,
    current_value NUMERIC,
    target NUMERIC,
    deadline DATE,
    success_criteria TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE weekly_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their weekly milestones" ON weekly_milestones FOR ALL USING (EXISTS (
    SELECT 1 FROM monthly_rocks 
    JOIN quarters ON monthly_rocks.quarter_id = quarters.id 
    JOIN year_plans ON quarters.year_plan_id = year_plans.id 
    JOIN systems ON year_plans.system_id = systems.id 
    WHERE monthly_rocks.id = weekly_milestones.monthly_rock_id AND systems.user_id = auth.uid()
));

-- Create input_definitions table
CREATE TABLE input_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    weekly_milestone_id UUID REFERENCES weekly_milestones(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    target NUMERIC,
    frequency TEXT, -- daily, weekly
    unit TEXT,
    active_status BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE input_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their input definitions" ON input_definitions FOR ALL USING (EXISTS (SELECT 1 FROM systems WHERE systems.id = input_definitions.system_id AND systems.user_id = auth.uid()));

-- Create daily_input_entries table
CREATE TABLE daily_input_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    input_definition_id UUID NOT NULL REFERENCES input_definitions(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    actual_value NUMERIC,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(input_definition_id, date)
);
ALTER TABLE daily_input_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their daily input entries" ON daily_input_entries FOR ALL USING (EXISTS (
    SELECT 1 FROM input_definitions 
    JOIN systems ON input_definitions.system_id = systems.id 
    WHERE input_definitions.id = daily_input_entries.input_definition_id AND systems.user_id = auth.uid()
));

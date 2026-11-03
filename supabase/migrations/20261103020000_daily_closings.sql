-- Migration: Support daily_closings table for ledger closing records and streak preservation
CREATE TABLE IF NOT EXISTS public.daily_closings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    classification TEXT NOT NULL, -- 'NORMAL_SUCCESS', 'BAD_DAY_SUCCESS', 'FAILED_DAY', 'STRETCH_SUCCESS'
    score NUMERIC DEFAULT 0,
    note TEXT,
    outcomes TEXT,
    xp_earned NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(system_id, date)
);

ALTER TABLE public.daily_closings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their daily closings" ON public.daily_closings
FOR ALL USING (auth.uid() = user_id);

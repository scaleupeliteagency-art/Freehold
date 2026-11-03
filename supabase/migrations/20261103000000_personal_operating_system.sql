-- Add operating system configuration fields to systems table
ALTER TABLE systems
ADD COLUMN IF NOT EXISTS expiration_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS domain TEXT,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS weekly_review_day TEXT DEFAULT 'Sunday',
ADD COLUMN IF NOT EXISTS daily_closing_time TEXT DEFAULT '21:00',
ADD COLUMN IF NOT EXISTS success_outcome TEXT,
ADD COLUMN IF NOT EXISTS identity_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS no_todo_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS focus_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS perfect_week_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS accountability_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS gamification_config JSONB DEFAULT '{}'::jsonb;

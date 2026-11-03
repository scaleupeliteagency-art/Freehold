-- Migration to support semantically clear core targets on input_definitions
ALTER TABLE public.input_definitions 
ADD COLUMN IF NOT EXISTS bad_day_minimum NUMERIC,
ADD COLUMN IF NOT EXISTS normal_target NUMERIC,
ADD COLUMN IF NOT EXISTS stretch_target NUMERIC,
ADD COLUMN IF NOT EXISTS measurement_type TEXT DEFAULT 'numeric',
ADD COLUMN IF NOT EXISTS is_core BOOLEAN DEFAULT false;

-- Backfill normal_target from target if null
UPDATE public.input_definitions 
SET normal_target = target 
WHERE normal_target IS NULL AND target IS NOT NULL;

-- Backfill bad_day_minimum to normal_target if null
UPDATE public.input_definitions 
SET bad_day_minimum = COALESCE(normal_target, target, 0)
WHERE bad_day_minimum IS NULL AND is_core = true;

-- Backfill stretch_target to normal_target if null
UPDATE public.input_definitions 
SET stretch_target = COALESCE(normal_target, target, 0)
WHERE stretch_target IS NULL AND is_core = true;

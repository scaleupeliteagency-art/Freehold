DO $$
DECLARE
    sys_type text := 'UUID';
    wm_type text := 'UUID';
    create_stmt text;
    sys_exists boolean;
    wm_exists boolean;
BEGIN
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'systems') INTO sys_exists;
    SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'weekly_milestones') INTO wm_exists;

    IF sys_exists THEN
        SELECT data_type INTO sys_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'systems' AND column_name = 'id';
    END IF;
    IF wm_exists THEN
        SELECT data_type INTO wm_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'weekly_milestones' AND column_name = 'id';
    END IF;
    
    IF sys_type IS NULL THEN sys_type := 'UUID'; END IF;
    IF wm_type IS NULL THEN wm_type := 'UUID'; END IF;

    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'input_definitions') THEN
        create_stmt := format('
            CREATE TABLE public.input_definitions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                system_id %s NOT NULL %s,
                weekly_milestone_id %s %s,
                name TEXT NOT NULL DEFAULT ''Unnamed'',
                target NUMERIC,
                frequency TEXT,
                unit TEXT,
                active_status BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )', 
            sys_type, 
            CASE WHEN sys_exists THEN 'REFERENCES public.systems(id) ON DELETE CASCADE' ELSE '' END,
            wm_type,
            CASE WHEN wm_exists THEN 'REFERENCES public.weekly_milestones(id) ON DELETE SET NULL' ELSE '' END
        );
        EXECUTE create_stmt;
    END IF;
END $$;

ALTER TABLE public.input_definitions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.input_definitions ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'numeric';
ALTER TABLE public.input_definitions ADD COLUMN IF NOT EXISTS weight NUMERIC DEFAULT 10;
ALTER TABLE public.input_definitions ADD COLUMN IF NOT EXISTS start_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.input_definitions ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.input_definitions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.input_definitions ADD COLUMN IF NOT EXISTS version_group_id UUID DEFAULT uuid_generate_v4();
ALTER TABLE public.input_definitions ADD COLUMN IF NOT EXISTS previous_version_id UUID REFERENCES public.input_definitions(id) ON DELETE SET NULL;
ALTER TABLE public.input_definitions ADD COLUMN IF NOT EXISTS change_reason TEXT;
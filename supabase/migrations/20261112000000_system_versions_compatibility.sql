CREATE TABLE IF NOT EXISTS public.system_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    system_id UUID NOT NULL REFERENCES public.systems(id) ON DELETE CASCADE,
    version_number TEXT NOT NULL,
    snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.system_versions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'system_versions'
          AND policyname = 'Users can manage their system versions'
    ) THEN
        CREATE POLICY "Users can manage their system versions"
        ON public.system_versions
        FOR ALL
        USING (
            EXISTS (
                SELECT 1
                FROM public.systems
                WHERE systems.id = system_versions.system_id
                  AND systems.user_id = auth.uid()
            )
        );
    END IF;
END
$$;

NOTIFY pgrst, 'reload schema';

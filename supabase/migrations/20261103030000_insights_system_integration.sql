-- UPGRADE INSIGHTS TABLE SCHEMA FOR FULL SYSTEM OWNERSHIP & AI ARCHIVE
-- Ensure columns for rich AI insights exist and are properly typed

ALTER TABLE public.insights
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Execution Pattern',
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS observed_fact TEXT,
ADD COLUMN IF NOT EXISTS ai_hypothesis TEXT,
ADD COLUMN IF NOT EXISTS recommended_action TEXT,
ADD COLUMN IF NOT EXISTS success_metric TEXT,
ADD COLUMN IF NOT EXISTS review_after_days INTEGER DEFAULT 7,
ADD COLUMN IF NOT EXISTS follow_up_date DATE,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Ensure RLS on insights allows users to manage insights for their own systems
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their insights" ON public.insights;

CREATE POLICY "Users can manage their insights" ON public.insights
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM systems 
        WHERE systems.id = insights.system_id 
        AND systems.user_id = auth.uid()
    )
);

-- Ensure RLS on reviews allows users to manage reviews for their own systems
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their reviews" ON public.reviews;

CREATE POLICY "Users can manage their reviews" ON public.reviews
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM systems 
        WHERE systems.id = reviews.system_id 
        AND systems.user_id = auth.uid()
    )
);

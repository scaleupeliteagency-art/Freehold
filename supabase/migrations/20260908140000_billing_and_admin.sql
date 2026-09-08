-- MIGRATION: Add subscriptions and admin fields to profiles

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive', -- 'inactive', 'active', 'past_due'
ADD COLUMN IF NOT EXISTS subscription_plan TEXT, -- 'monthly', 'yearly'
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles AS p 
    WHERE p.user_id = auth.uid() AND p.is_admin = true
  )
);

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles AS p 
    WHERE p.user_id = auth.uid() AND p.is_admin = true
  )
);

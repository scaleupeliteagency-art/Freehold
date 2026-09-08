-- Fix infinite recursion by creating a security definer function

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  status BOOLEAN;
BEGIN
  -- Security definer runs as the schema owner, bypassing RLS to prevent infinite loops
  SELECT is_admin INTO status FROM public.profiles WHERE user_id = auth.uid();
  RETURN COALESCE(status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 1. Fix Profiles Policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT USING ( public.is_admin() );

CREATE POLICY "Admins can update all profiles" ON profiles
FOR UPDATE USING ( public.is_admin() );

-- 2. Fix Promo Codes Policies
DROP POLICY IF EXISTS "Admins manage promo codes" ON promo_codes;

CREATE POLICY "Admins manage promo codes" ON promo_codes
FOR ALL USING ( public.is_admin() );

-- 3. Fix Payments Policies
DROP POLICY IF EXISTS "Admins manage payments" ON payments;

CREATE POLICY "Admins manage payments" ON payments
FOR ALL USING ( public.is_admin() );

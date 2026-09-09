DROP POLICY IF EXISTS "Users can view active promo codes" ON promo_codes;

CREATE POLICY "Users can view active promo codes" ON promo_codes
FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
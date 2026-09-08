-- MIGRATION: Payments and Promo Codes

-- 1. Promo Codes Table
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins manage promo codes" ON promo_codes
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Users can read active promo codes (to validate them)
CREATE POLICY "Users can view active promo codes" ON promo_codes
FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- 2. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL, -- 'monthly', 'yearly'
    amount DECIMAL NOT NULL,
    currency TEXT DEFAULT 'MAD',
    payment_method TEXT NOT NULL, -- 'bank_transfer', 'paypal', 'binance'
    proof_url TEXT, -- URL or path to uploaded receipt
    transaction_reference TEXT, -- Optional TX ID
    promo_code_used TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users view own payments" ON payments
FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own payments
CREATE POLICY "Users insert own payments" ON payments
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can do everything
CREATE POLICY "Admins manage payments" ON payments
FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Note: You will need to manually create a Storage Bucket named 'payment_proofs' in your Supabase dashboard
-- and set its policies so authenticated users can upload and admins can view.

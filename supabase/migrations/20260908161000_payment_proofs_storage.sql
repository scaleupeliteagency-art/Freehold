-- Private storage for payment receipts. Files are stored under <user_id>/<file_name>.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment_proofs',
  'payment_proofs',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

DROP POLICY IF EXISTS "Users upload own payment proofs" ON storage.objects;
CREATE POLICY "Users upload own payment proofs" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'payment_proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users view own payment proofs" ON storage.objects;
CREATE POLICY "Users view own payment proofs" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'payment_proofs'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_admin()
  )
);

DROP POLICY IF EXISTS "Users update own payment proofs" ON storage.objects;
CREATE POLICY "Users update own payment proofs" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'payment_proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'payment_proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users delete own payment proofs" ON storage.objects;
CREATE POLICY "Users delete own payment proofs" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'payment_proofs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
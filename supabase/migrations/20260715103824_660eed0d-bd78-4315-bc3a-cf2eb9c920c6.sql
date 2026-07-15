CREATE POLICY "Admins can read all attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'attachments'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);
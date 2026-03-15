
-- Create storage bucket for file attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true);

-- Allow authenticated users to upload files
CREATE POLICY "Users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read own attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access for shared files
CREATE POLICY "Public can read attachments"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'attachments');

-- Allow users to delete their own files
CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'attachments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Add attachments column to messages table
ALTER TABLE public.messages ADD COLUMN attachments jsonb DEFAULT NULL;

-- Add attachments column to email_drafts table
ALTER TABLE public.email_drafts ADD COLUMN attachments jsonb DEFAULT NULL;

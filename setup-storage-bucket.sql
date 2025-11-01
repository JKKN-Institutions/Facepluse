-- Create the mood-captures storage bucket
-- This script sets up the storage bucket for facial analysis images

-- Create the bucket (if it doesn't already exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mood-captures',
  'mood-captures',
  true, -- Make it public
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Create storage policies for public access
-- Policy 1: Allow anyone to upload images (INSERT)
CREATE POLICY IF NOT EXISTS "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'mood-captures');

-- Policy 2: Allow anyone to view images (SELECT)
CREATE POLICY IF NOT EXISTS "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mood-captures');

-- Policy 3: Allow anyone to update images (UPDATE)
CREATE POLICY IF NOT EXISTS "Allow public updates"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'mood-captures');

-- Policy 4: Allow anyone to delete images (DELETE)
CREATE POLICY IF NOT EXISTS "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'mood-captures');

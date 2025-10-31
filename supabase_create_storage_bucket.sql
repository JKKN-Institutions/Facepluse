-- ============================================================================
-- Supabase Storage Bucket Creation for Facial Analysis App
-- ============================================================================
-- This migration creates the 'mood-captures' storage bucket with public access
-- Run this in Supabase SQL Editor or via Supabase CLI
-- ============================================================================

-- Step 1: Create the storage bucket
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mood-captures',           -- Bucket ID
  'mood-captures',           -- Bucket name
  true,                      -- Public bucket (images accessible via public URL)
  5242880,                   -- 5MB file size limit per image
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'] -- Allowed image types
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Step 2: Create RLS policies for the bucket
-- ============================================================================

-- Policy 1: Allow anyone to upload images (INSERT)
CREATE POLICY IF NOT EXISTS "Allow public uploads to mood-captures"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'mood-captures');

-- Policy 2: Allow anyone to view images (SELECT)
CREATE POLICY IF NOT EXISTS "Allow public reads from mood-captures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mood-captures');

-- Policy 3: Allow anyone to update images (UPDATE)
CREATE POLICY IF NOT EXISTS "Allow public updates to mood-captures"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'mood-captures');

-- Policy 4: Allow anyone to delete images (DELETE)
CREATE POLICY IF NOT EXISTS "Allow public deletes from mood-captures"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'mood-captures');

-- ============================================================================
-- Verification Query (Optional - Run this to verify bucket was created)
-- ============================================================================
-- SELECT * FROM storage.buckets WHERE id = 'mood-captures';

-- ============================================================================
-- Success Message
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Storage bucket "mood-captures" created successfully!';
  RAISE NOTICE '✅ Public access enabled';
  RAISE NOTICE '✅ RLS policies configured';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Next Steps:';
  RAISE NOTICE '1. Restart your Next.js dev server (Ctrl+C, then npm run dev)';
  RAISE NOTICE '2. Clear browser cache (Ctrl+Shift+R)';
  RAISE NOTICE '3. Refresh the app - image uploads should now work!';
END $$;

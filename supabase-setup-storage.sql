-- ============================================================================
-- SUPABASE STORAGE SETUP FOR MOOD-CAPTURES BUCKET
-- ============================================================================
-- This SQL script sets up Row Level Security (RLS) policies for the
-- mood-captures storage bucket created by setup-bucket.mjs
--
-- ⚠️ IMPORTANT: Run setup-bucket.mjs FIRST to create the bucket!
-- Then run this SQL in your Supabase SQL Editor to enable storage policies.
-- ============================================================================
-- Run in: https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw/sql/new
-- ============================================================================

-- Step 1: Ensure RLS is enabled on storage.objects table
-- ============================================================================
-- This is usually enabled by default, but we'll make sure
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies (if any) to avoid conflicts
-- ============================================================================
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
DROP POLICY IF EXISTS "mood-captures: public upload" ON storage.objects;
DROP POLICY IF EXISTS "mood-captures: public select" ON storage.objects;
DROP POLICY IF EXISTS "mood-captures: public update" ON storage.objects;
DROP POLICY IF EXISTS "mood-captures: public delete" ON storage.objects;

-- Step 3: Create storage policies for PUBLIC ACCESS
-- ============================================================================
-- These policies allow ANYONE (authenticated or not) to manage files in the
-- mood-captures bucket. This is appropriate for a demo app.
--
-- For production, consider restricting to authenticated users only.

-- Policy 1: Allow anyone to upload images to mood-captures bucket
CREATE POLICY "mood-captures: public upload"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'mood-captures');

-- Policy 2: Allow anyone to view/download images from mood-captures bucket
CREATE POLICY "mood-captures: public select"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'mood-captures');

-- Policy 3: Allow anyone to update images in mood-captures bucket
CREATE POLICY "mood-captures: public update"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'mood-captures')
WITH CHECK (bucket_id = 'mood-captures');

-- Policy 4: Allow anyone to delete images from mood-captures bucket
CREATE POLICY "mood-captures: public delete"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'mood-captures');

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify setup)
-- ============================================================================

-- 1. Check if bucket exists and is configured correctly
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'mood-captures';

-- Expected result:
-- id: mood-captures
-- name: mood-captures
-- public: true
-- file_size_limit: 5242880 (5MB)
-- allowed_mime_types: {image/jpeg, image/jpg, image/png, image/webp}

-- 2. Check storage policies are active
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE 'mood-captures:%'
ORDER BY policyname;

-- Expected: 4 policies (upload, select, update, delete)

-- 3. Test bucket accessibility (should return empty array if no files yet)
-- Note: This query tests if you can query the bucket
SELECT name, metadata
FROM storage.objects
WHERE bucket_id = 'mood-captures'
LIMIT 5;

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- If uploads still fail, check:

-- 1. Verify RLS is enabled:
-- SELECT tablename, rowsecurity
-- FROM pg_tables
-- WHERE tablename = 'objects' AND schemaname = 'storage';
-- (rowsecurity should be TRUE)

-- 2. Check for policy conflicts:
-- SELECT * FROM pg_policies WHERE tablename = 'objects';

-- 3. Test policy match (replace 'test.jpg' with actual filename):
-- SELECT * FROM storage.objects WHERE bucket_id = 'mood-captures' AND name = 'test.jpg';

-- ============================================================================
-- OPTIONAL: More Restrictive Policies (Production)
-- ============================================================================
-- If you want to restrict uploads to authenticated users only, use these instead:

-- DROP POLICY IF EXISTS "mood-captures: public upload" ON storage.objects;
-- CREATE POLICY "mood-captures: authenticated upload"
-- ON storage.objects
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (bucket_id = 'mood-captures');

-- DROP POLICY IF EXISTS "mood-captures: public delete" ON storage.objects;
-- CREATE POLICY "mood-captures: authenticated delete"
-- ON storage.objects
-- FOR DELETE
-- TO authenticated
-- USING (bucket_id = 'mood-captures');

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- ✅ Your mood-captures bucket is now fully configured with storage policies
-- ✅ The app can now upload, view, update, and delete images
-- ✅ Restart your Next.js app to clear the error
--
-- Next steps:
-- 1. Restart your dev server: npm run dev
-- 2. Test image upload by smiling at the camera
-- 3. Check Supabase Dashboard → Storage → mood-captures to see uploaded images
-- ============================================================================

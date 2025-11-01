-- ============================================================================
-- SUPABASE SETUP FOR EMOJI REACTION CHALLENGE
-- ============================================================================
-- This SQL script sets up:
-- 1. Storage bucket for emoji reaction frames
-- 2. Database table for reaction metadata
-- 3. Row Level Security policies
-- ============================================================================
-- Run in: Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- PART 1: CREATE STORAGE BUCKET
-- ============================================================================

-- Create public-frames storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public-frames',
  'public-frames',
  true,  -- Public bucket
  10485760,  -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "public-frames: public upload" ON storage.objects;
DROP POLICY IF EXISTS "public-frames: public select" ON storage.objects;
DROP POLICY IF EXISTS "public-frames: public update" ON storage.objects;
DROP POLICY IF EXISTS "public-frames: public delete" ON storage.objects;

-- Allow anyone to upload images to public-frames bucket
CREATE POLICY "public-frames: public upload"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'public-frames');

-- Allow anyone to view/download images from public-frames bucket
CREATE POLICY "public-frames: public select"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'public-frames');

-- Allow anyone to update images in public-frames bucket
CREATE POLICY "public-frames: public update"
ON storage.objects
FOR UPDATE
TO public
USING (bucket_id = 'public-frames')
WITH CHECK (bucket_id = 'public-frames');

-- Allow anyone to delete images from public-frames bucket
CREATE POLICY "public-frames: public delete"
ON storage.objects
FOR DELETE
TO public
USING (bucket_id = 'public-frames');

-- ============================================================================
-- PART 2: CREATE DATABASE TABLE
-- ============================================================================

-- Create emoji_reactions table
CREATE TABLE IF NOT EXISTS public.emoji_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  frame_url TEXT NOT NULL,
  reactions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_emoji_reactions_created_at
ON public.emoji_reactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_emoji_reactions_id
ON public.emoji_reactions(id);

-- Enable RLS on emoji_reactions table
ALTER TABLE public.emoji_reactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "emoji_reactions: public read" ON public.emoji_reactions;
DROP POLICY IF EXISTS "emoji_reactions: public insert" ON public.emoji_reactions;
DROP POLICY IF EXISTS "emoji_reactions: public update" ON public.emoji_reactions;

-- Allow anyone to read emoji reactions
CREATE POLICY "emoji_reactions: public read"
ON public.emoji_reactions
FOR SELECT
TO public
USING (true);

-- Allow anyone to insert new emoji reactions
CREATE POLICY "emoji_reactions: public insert"
ON public.emoji_reactions
FOR INSERT
TO public
WITH CHECK (true);

-- Allow anyone to update emoji reactions (for view/download counters)
CREATE POLICY "emoji_reactions: public update"
ON public.emoji_reactions
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- ============================================================================
-- PART 3: HELPER FUNCTIONS
-- ============================================================================

-- Function to increment view counter
CREATE OR REPLACE FUNCTION increment_reaction_views(reaction_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.emoji_reactions
  SET views = views + 1
  WHERE id = reaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment download counter
CREATE OR REPLACE FUNCTION increment_reaction_downloads(reaction_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.emoji_reactions
  SET downloads = downloads + 1
  WHERE id = reaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- 1. Check if bucket exists
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id = 'public-frames';

-- 2. Check storage policies
SELECT
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE 'public-frames:%'
ORDER BY policyname;

-- 3. Check if table exists
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'emoji_reactions'
ORDER BY ordinal_position;

-- 4. Check table policies
SELECT
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'emoji_reactions'
ORDER BY policyname;

-- 5. Test query (should return empty result if no data yet)
SELECT id, created_at, views, downloads
FROM public.emoji_reactions
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
-- ✅ Storage bucket 'public-frames' created
-- ✅ Database table 'emoji_reactions' created
-- ✅ RLS policies configured for public access
-- ✅ Helper functions created for counters
--
-- Next steps:
-- 1. Restart your Next.js app
-- 2. Test the emoji reaction challenge
-- 3. Check Supabase Dashboard → Storage → public-frames for uploaded frames
-- 4. Check Supabase Dashboard → Table Editor → emoji_reactions for metadata
-- ============================================================================

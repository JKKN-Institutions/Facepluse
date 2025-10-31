-- ============================================
-- TIME CAPSULE DATABASE MIGRATIONS
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add image_url column to metrics table
ALTER TABLE metrics
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_metrics_created_at
ON metrics(created_at);

CREATE INDEX IF NOT EXISTS idx_metrics_image_url
ON metrics(image_url) WHERE image_url IS NOT NULL;

-- 2. Create time_capsule_events table
CREATE TABLE IF NOT EXISTS time_capsule_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  include_challenges BOOLEAN DEFAULT false,
  collage_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_capsule_events_created_at
ON time_capsule_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_time_capsule_events_user_id
ON time_capsule_events(user_id) WHERE user_id IS NOT NULL;

-- 3. Enable Row Level Security (optional, for multi-user)
ALTER TABLE time_capsule_events ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (adjust based on your auth setup)
CREATE POLICY "Enable all operations for all users"
ON time_capsule_events
FOR ALL
USING (true);

-- ============================================
-- Verification Queries
-- ============================================

-- Verify migrations completed
SELECT 'Migrations completed successfully!' as status;

-- Check metrics table has image_url column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'metrics' AND column_name = 'image_url';

-- Check time_capsule_events table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'time_capsule_events';

-- Check all columns in time_capsule_events
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'time_capsule_events'
ORDER BY ordinal_position;

import { NextResponse } from 'next/server';

/**
 * One-time setup endpoint to create the mood-captures storage bucket
 *
 * USAGE:
 * 1. Start your dev server: npm run dev
 * 2. Visit: http://localhost:3000/api/setup-storage
 * 3. Follow the instructions in the response
 *
 * NOTE: This endpoint provides SQL that must be run manually via Supabase Dashboard
 * API keys don't have permission to create storage buckets programmatically.
 */
export async function GET() {
  const setupSQL = `
-- ============================================================================
-- SUPABASE STORAGE SETUP FOR MOOD-CAPTURES BUCKET
-- ============================================================================
-- Copy this entire SQL block and run it in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw/sql/new
-- ============================================================================

-- Step 1: Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mood-captures',
  'mood-captures',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- Step 2: Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Create storage policies
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'mood-captures');

DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mood-captures');

DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'mood-captures');

DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'mood-captures');
`;

  const instructions = {
    error: 'Storage bucket "mood-captures" not found',
    status: 'setup_required',
    message: 'The Supabase storage bucket needs to be created manually',

    quickSetup: {
      step1: 'Open Supabase SQL Editor',
      url: 'https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw/sql/new',
      step2: 'Copy the SQL from the "sql" field below',
      step3: 'Paste it into the SQL Editor',
      step4: 'Click "Run"',
      step5: 'Refresh your app - bucket will be ready!',
    },

    sql: setupSQL,

    alternativeMethod: {
      description: 'Create bucket via Dashboard UI',
      url: 'https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw/storage/buckets',
      steps: [
        'Click "New Bucket"',
        'Name: mood-captures',
        'Public: ✅ ENABLED',
        'File size limit: 5MB',
        'Allowed types: image/jpeg, image/jpg, image/png, image/webp',
        'Then run the policy SQL above',
      ],
    },

    verification: {
      description: 'Check if bucket exists',
      query: "SELECT * FROM storage.buckets WHERE id = 'mood-captures';",
      expectedResult: {
        id: 'mood-captures',
        name: 'mood-captures',
        public: true,
        file_size_limit: 5242880,
      },
    },

    documentation: 'See SETUP_STORAGE.md for detailed guide',
  };

  return NextResponse.json(instructions, {
    status: 503,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST() {
  return NextResponse.json({
    error: 'Method not supported',
    message: 'Storage bucket creation must be done via Supabase Dashboard',
    reason: 'API keys do not have permission to create storage buckets programmatically',
    guide: 'Visit /api/setup-storage (GET) for setup instructions',
  }, { status: 405 });
}

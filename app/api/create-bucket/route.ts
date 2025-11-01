import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * API endpoint to create the mood-captures storage bucket
 *
 * Visit: http://localhost:3000/api/create-bucket
 *
 * This uses the Supabase client with your anon key, which should work
 * for creating buckets if the proper permissions are set.
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({
      success: false,
      error: 'Missing Supabase credentials',
      message: 'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not found in environment'
    }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Try to create the bucket
    console.log('Attempting to create mood-captures bucket...');

    const { data, error } = await supabase.storage.createBucket('mood-captures', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    });

    if (error) {
      // Check if bucket already exists
      if (error.message?.includes('already exists')) {
        // Bucket exists, try to verify it
        const { data: buckets } = await supabase.storage.listBuckets();
        const existingBucket = buckets?.find(b => b.name === 'mood-captures');

        if (existingBucket) {
          return NextResponse.json({
            success: true,
            message: 'Bucket already exists!',
            bucket: existingBucket,
            nextSteps: {
              step1: 'The bucket exists but you need to set up storage policies',
              step2: 'Open Supabase SQL Editor',
              step3: 'Copy the SQL from supabase-setup-storage.sql',
              step4: 'Run it in the SQL Editor',
              step5: 'Restart your Next.js app',
              sqlEditorUrl: `${supabaseUrl.replace(/\/v1$/, '')}/project/sql/new`
            }
          });
        }
      }

      // Other error occurred
      console.error('Error creating bucket:', error);

      return NextResponse.json({
        success: false,
        error: error.message,
        details: error,
        manualInstructions: {
          message: 'Programmatic bucket creation failed. Please create manually.',
          steps: [
            `1. Go to: ${supabaseUrl.replace(/\/v1$/, '')}/project/storage/buckets`,
            '2. Click "New Bucket"',
            '3. Name: mood-captures',
            '4. Public bucket: ✅ ENABLED',
            '5. File size limit: 5MB (5242880 bytes)',
            '6. Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp',
            '7. After creating, run the SQL from supabase-setup-storage.sql'
          ],
          reason: error.message === 'new row violates row-level security policy'
            ? 'The anon key doesn\'t have permission to create buckets. This is normal - buckets must be created via Dashboard or with a service role key.'
            : 'An unexpected error occurred during bucket creation.'
        }
      }, { status: 400 });
    }

    // Success!
    return NextResponse.json({
      success: true,
      message: '✅ Bucket created successfully!',
      bucket: data,
      nextSteps: {
        step1: 'Bucket created! Now set up storage policies',
        step2: 'Open Supabase SQL Editor',
        step3: 'Copy the SQL from supabase-setup-storage.sql',
        step4: 'Run it in the SQL Editor',
        step5: 'Restart your Next.js app - error will be gone!',
        sqlEditorUrl: `${supabaseUrl.replace(/\/v1$/, '')}/project/sql/new`,
        sqlFile: 'supabase-setup-storage.sql'
      }
    });

  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      message: errorMessage,
      details: error instanceof Error ? error.stack : String(error),
      manualInstructions: {
        message: 'Please create the bucket manually via Supabase Dashboard',
        dashboardUrl: `${supabaseUrl.replace(/\/v1$/, '')}/project/storage/buckets`,
        sqlEditorUrl: `${supabaseUrl.replace(/\/v1$/, '')}/project/sql/new`
      }
    }, { status: 500 });
  }
}

export async function POST() {
  // Same logic as GET, but triggered via POST
  return GET();
}

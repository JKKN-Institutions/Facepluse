#!/usr/bin/env node
/**
 * Supabase Storage Bucket Setup Script
 *
 * This script creates the 'mood-captures' storage bucket using the official
 * Supabase Storage API (recommended approach).
 *
 * Usage: node setup-bucket.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read and parse .env.local file manually
function loadEnv() {
  try {
    const envContent = readFileSync('.env.local', 'utf8');
    const env = {};

    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    return env;
  } catch (error) {
    console.error('Error reading .env.local:', error.message);
    return {};
  }
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('');
  console.error('Please ensure .env.local contains:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.error('');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('');
console.log('🚀 Supabase Storage Bucket Setup');
console.log('═'.repeat(60));
console.log('');
console.log('📦 Creating bucket: mood-captures');
console.log('🔗 Project:', supabaseUrl);
console.log('');

async function createBucket() {
  try {
    // Attempt to create the bucket using the official Storage API
    const { data, error } = await supabase.storage.createBucket('mood-captures', {
      public: true, // Make bucket public so images can be viewed via URL
      fileSizeLimit: 5242880, // 5MB limit
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    });

    if (error) {
      // Check if bucket already exists
      if (error.message?.includes('already exists') || error.statusCode === '409') {
        console.log('ℹ️  Bucket already exists');
        console.log('');
        console.log('✅ Setup complete! The mood-captures bucket is ready.');
        console.log('');
        await verifyBucket();
        return;
      }

      // Other error occurred
      console.error('❌ Error creating bucket:', error.message);
      console.error('');
      console.error('Details:', error);
      console.error('');

      // Provide helpful troubleshooting
      console.log('🔧 Troubleshooting:');
      console.log('');
      console.log('1. Check your Supabase project is active:');
      console.log(`   ${supabaseUrl.replace('/v1', '')}/project/settings`);
      console.log('');
      console.log('2. Verify your API key has storage permissions');
      console.log('');
      console.log('3. Try creating the bucket manually:');
      console.log('   Dashboard → Storage → New Bucket → "mood-captures"');
      console.log('');

      process.exit(1);
    }

    // Success!
    console.log('✅ Bucket created successfully!');
    console.log('');
    console.log('Bucket details:');
    console.log('  - Name: mood-captures');
    console.log('  - Public: Yes');
    console.log('  - Size limit: 5MB');
    console.log('  - Allowed types: JPEG, PNG, WebP');
    console.log('');

    await verifyBucket();

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('');
    console.error('Full error:', error);
    console.error('');
    process.exit(1);
  }
}

async function verifyBucket() {
  console.log('🔍 Verifying bucket...');
  console.log('');

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('⚠️  Could not verify bucket:', error.message);
      return;
    }

    const moodCapturesBucket = buckets.find(b => b.name === 'mood-captures');

    if (moodCapturesBucket) {
      console.log('✅ Bucket verification successful!');
      console.log('');
      console.log('Bucket info:');
      console.log(`  - ID: ${moodCapturesBucket.id}`);
      console.log(`  - Name: ${moodCapturesBucket.name}`);
      console.log(`  - Public: ${moodCapturesBucket.public ? 'Yes' : 'No'}`);
      console.log(`  - Created: ${new Date(moodCapturesBucket.created_at).toLocaleString()}`);
      console.log('');
    } else {
      console.log('⚠️  Bucket not found in list. This might be a permissions issue.');
      console.log('');
    }

  } catch (error) {
    console.error('⚠️  Verification error:', error.message);
  }

  console.log('');
  console.log('═'.repeat(60));
  console.log('');
  console.log('📋 NEXT STEPS:');
  console.log('');
  console.log('1. Set up storage policies (IMPORTANT):');
  console.log('   → Open Supabase SQL Editor');
  console.log('   → Run the SQL from: supabase-setup-storage.sql');
  console.log('   → This allows your app to upload/download images');
  console.log('');
  console.log('2. Restart your Next.js app:');
  console.log('   → Stop the dev server (Ctrl+C)');
  console.log('   → Run: npm run dev');
  console.log('');
  console.log('3. Test it:');
  console.log('   → Open your app in the browser');
  console.log('   → Smile at the camera');
  console.log('   → Check console - no more errors!');
  console.log('');
  console.log('🔗 SQL Editor:');
  console.log(`   ${supabaseUrl.replace('/v1', '')}/project/sql/new`);
  console.log('');
  console.log('═'.repeat(60));
  console.log('');
  console.log('🎉 Bucket setup complete!');
  console.log('');
}

// Run the setup
createBucket();

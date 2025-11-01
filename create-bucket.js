// Script to create Supabase storage bucket
// Run with: node create-bucket.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createBucket() {
  console.log('🚀 Creating mood-captures storage bucket...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup-storage-bucket.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 SQL Script:');
    console.log('━'.repeat(60));
    console.log(sql);
    console.log('━'.repeat(60));
    console.log('');

    // Note: The anon key doesn't have permission to execute raw SQL
    // We need to use the service role key or execute via Supabase CLI
    console.log('⚠️  Note: Cannot execute SQL with anon key.');
    console.log('');
    console.log('📋 To create the bucket, you have two options:');
    console.log('');
    console.log('Option 1: Use Supabase Dashboard (Recommended)');
    console.log('━'.repeat(60));
    console.log('1. Go to: https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw');
    console.log('2. Navigate to: SQL Editor');
    console.log('3. Copy and paste the SQL from: setup-storage-bucket.sql');
    console.log('4. Click "Run" to execute');
    console.log('');
    console.log('Option 2: Use Supabase CLI');
    console.log('━'.repeat(60));
    console.log('Run this command:');
    console.log('npx supabase db execute --project-ref gjgmjkapgtefuovmrydw --file setup-storage-bucket.sql');
    console.log('');
    console.log('After creating the bucket, restart your Next.js app.');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createBucket();

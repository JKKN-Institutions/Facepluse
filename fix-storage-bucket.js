#!/usr/bin/env node
/**
 * Script to create the mood-captures storage bucket in Supabase
 * This uses the Supabase Management API
 */

const https = require('https');

const PROJECT_REF = 'gjgmjkapgtefuovmrydw';
const ACCESS_TOKEN = 'sbp_3fd9c6303ecf9593a8f26991d18d9b7eb504d68e';

console.log('🚀 Creating Supabase storage bucket: mood-captures\n');

// Step 1: Create the bucket
const createBucketData = JSON.stringify({
  id: 'mood-captures',
  name: 'mood-captures',
  public: true,
  file_size_limit: 5242880, // 5MB
  allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
});

const bucketOptions = {
  hostname: `${PROJECT_REF}.supabase.co`,
  port: 443,
  path: '/storage/v1/bucket',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'apikey': ACCESS_TOKEN,
    'Content-Length': createBucketData.length
  }
};

console.log('📦 Step 1: Creating bucket...');

const bucketRequest = https.request(bucketOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('✅ Bucket created successfully!');
      console.log('Response:', data);
      createPolicies();
    } else if (res.statusCode === 409) {
      console.log('ℹ️  Bucket already exists');
      console.log('Response:', data);
      createPolicies();
    } else {
      console.error('❌ Failed to create bucket');
      console.error('Status:', res.statusCode);
      console.error('Response:', data);
      console.log('\n📋 Manual Setup Required:');
      console.log('1. Go to: https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw/storage/buckets');
      console.log('2. Click "New Bucket"');
      console.log('3. Name: mood-captures');
      console.log('4. Public bucket: ✅ Enabled');
      console.log('5. File size limit: 5MB');
      console.log('6. Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp');
    }
  });
});

bucketRequest.on('error', (error) => {
  console.error('❌ Error creating bucket:', error.message);
  console.log('\n📋 Please create the bucket manually via Supabase Dashboard');
});

bucketRequest.write(createBucketData);
bucketRequest.end();

function createPolicies() {
  console.log('\n📝 Step 2: Setting up storage policies...');
  console.log('Note: Policies need to be created via SQL in the Supabase Dashboard\n');

  console.log('Run this SQL in your Supabase SQL Editor:');
  console.log('━'.repeat(70));
  console.log(`
-- Allow public uploads
CREATE POLICY IF NOT EXISTS "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'mood-captures');

-- Allow public downloads
CREATE POLICY IF NOT EXISTS "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'mood-captures');

-- Allow public updates
CREATE POLICY IF NOT EXISTS "Allow public updates"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'mood-captures');

-- Allow public deletes
CREATE POLICY IF NOT EXISTS "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'mood-captures');
  `);
  console.log('━'.repeat(70));
  console.log('\n🔗 SQL Editor: https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw/sql/new');
  console.log('\n✨ After running the SQL, your app will be ready to upload images!');
}

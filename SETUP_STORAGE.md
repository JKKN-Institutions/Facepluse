# Supabase Storage Setup Guide

## ⚠️ Storage Bucket Missing

Your application requires a Supabase storage bucket named `mood-captures` to store facial analysis images.

## Quick Setup (2 minutes)

### Option 1: Via Supabase SQL Editor (Recommended)

1. **Open Supabase SQL Editor**
   ```
   https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw/sql/new
   ```

2. **Copy and paste the entire SQL script** from `supabase-setup-storage.sql`

3. **Click "Run"** to execute the SQL

4. **Verify** - You should see:
   - ✅ "Success. No rows returned"
   - OR ✅ Confirmation that bucket was created

5. **Refresh your app** - Image uploads will now work!

---

### Option 2: Via Supabase Dashboard (Manual)

1. **Go to Storage**
   ```
   https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw/storage/buckets
   ```

2. **Click "New Bucket"**

3. **Configure the bucket:**
   - **Name:** `mood-captures`
   - **Public bucket:** ✅ **MUST BE CHECKED**
   - **File size limit:** `5 MB` (5242880 bytes)
   - **Allowed MIME types:**
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `image/webp`

4. **Create bucket**

5. **Set up policies** (IMPORTANT):
   - Go to: `Storage → mood-captures → Policies`
   - Click "New Policy" → "For full customization"
   - Create these 4 policies:

   **Policy 1 - Allow Uploads:**
   ```sql
   CREATE POLICY "Allow public uploads"
   ON storage.objects FOR INSERT
   TO public
   WITH CHECK (bucket_id = 'mood-captures');
   ```

   **Policy 2 - Allow Downloads:**
   ```sql
   CREATE POLICY "Allow public downloads"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'mood-captures');
   ```

   **Policy 3 - Allow Updates:**
   ```sql
   CREATE POLICY "Allow public updates"
   ON storage.objects FOR UPDATE
   TO public
   USING (bucket_id = 'mood-captures');
   ```

   **Policy 4 - Allow Deletes:**
   ```sql
   CREATE POLICY "Allow public deletes"
   ON storage.objects FOR DELETE
   TO public
   USING (bucket_id = 'mood-captures');
   ```

---

## Verification

After setup, you can verify the bucket exists:

```sql
SELECT * FROM storage.buckets WHERE id = 'mood-captures';
```

Expected result:
```
id: mood-captures
name: mood-captures
public: true
file_size_limit: 5242880
```

## What This Fixes

- ✅ Removes the "STORAGE BUCKET NOT FOUND" console error
- ✅ Enables image uploads from facial analysis captures
- ✅ Stores images in Supabase Storage with public URLs
- ✅ Allows the app to save screenshots in the leaderboard

## Files Created

- `supabase-setup-storage.sql` - Complete SQL setup script
- `SETUP_STORAGE.md` - This guide (you're reading it!)

## Need Help?

If you encounter issues:

1. **Check your Supabase project is active:**
   ```
   https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw
   ```

2. **Verify you have project permissions** (Owner or Admin role)

3. **Check the bucket exists:**
   - Go to: Storage → Buckets
   - Look for "mood-captures" in the list

4. **Verify RLS policies:**
   - Go to: Storage → mood-captures → Policies
   - Should see 4 policies (Insert, Select, Update, Delete)

## After Setup

Once complete:
1. Restart your Next.js development server
2. The console error will disappear
3. Images will start uploading automatically
4. You can view uploaded images in: Storage → mood-captures

---

**Setup Time:** ~2 minutes
**Difficulty:** Easy
**Required Role:** Supabase Project Owner/Admin

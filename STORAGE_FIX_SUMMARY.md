# Storage Bucket Fix Summary

## Problem Identified

Your application was showing this error:
```
🚨 STORAGE BUCKET NOT FOUND! 🚨
The Supabase storage bucket "mood-captures" does not exist.
```

This prevented the app from uploading facial analysis images to Supabase Storage.

## Solution Provided

I've created everything needed to fix this issue. The bucket must be created manually via Supabase Dashboard because API keys don't have permission to create storage buckets programmatically.

## Files Created

### 1. **supabase-setup-storage.sql** ⭐ MAIN FILE
   - Complete SQL script to create the bucket and all required policies
   - Copy-paste this into Supabase SQL Editor
   - One-click setup!

### 2. **SETUP_STORAGE.md** 📖
   - Detailed step-by-step guide
   - Two methods: SQL Editor (quick) or Dashboard UI (manual)
   - Verification steps and troubleshooting

### 3. **setup-storage.bat** (Windows) / **setup-storage.sh** (Mac/Linux)
   - CLI helper scripts
   - Shows quick setup instructions
   - Run: `setup-storage.bat`

### 4. **app/api/setup-storage/route.ts** 🌐
   - API endpoint with setup instructions
   - Visit: http://localhost:3000/api/setup-storage
   - Returns SQL and step-by-step guide

### 5. Helper Scripts (for reference)
   - `fix-storage-bucket.js` - Attempted API creation (requires service key)
   - `create-bucket.js` - Documentation script

## How to Fix (Choose One Method)

### ⚡ Method 1: SQL Editor (Recommended - 30 seconds)

1. **Open Supabase SQL Editor:**
   ```
   https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw/sql/new
   ```

2. **Open the SQL file:**
   - File: `supabase-setup-storage.sql`
   - Copy ALL contents (Ctrl+A, Ctrl+C)

3. **Paste into SQL Editor** and click **"Run"**

4. **Done!** Restart your Next.js app.

### 🖱️ Method 2: Dashboard UI (5 minutes)

See `SETUP_STORAGE.md` for detailed steps.

## What This Fixes

✅ Removes console error
✅ Enables image uploads
✅ Stores facial analysis screenshots
✅ Populates leaderboard with images
✅ Enables Time Capsule feature

## After Setup

Once you run the SQL:

1. **Restart your dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Verify it works:**
   - App loads without errors
   - Images upload successfully
   - Check: Storage → mood-captures in Supabase Dashboard
   - You'll see images appearing as users smile

3. **Test:**
   - Smile at the camera
   - Check browser console - no more errors!
   - Check Supabase Storage - images should appear

## Bucket Configuration

The bucket will be created with these settings:

- **Name:** `mood-captures`
- **Public:** ✅ Yes (anyone can view via URL)
- **File Size Limit:** 5MB
- **Allowed Types:** JPEG, JPG, PNG, WebP
- **Policies:** Full public access (Insert, Select, Update, Delete)

## Verification

After setup, run this SQL to verify:

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

## Why Manual Setup?

Supabase doesn't allow storage bucket creation via API with standard keys (anon/service role). Only the Management API with a Personal Access Token can create buckets, and that requires manual intervention.

The SQL script is the fastest and most reliable method.

## Need Help?

1. **Check Supabase Dashboard:** Make sure you're logged in
2. **Verify project access:** You need Owner or Admin role
3. **See detailed guide:** `SETUP_STORAGE.md`
4. **Check API endpoint:** Visit `/api/setup-storage` for instructions

## Next Steps

After bucket creation:
- ✅ App works normally
- ✅ Images upload automatically
- ✅ Leaderboard shows screenshots
- ✅ Time Capsule feature ready
- ✅ No more console errors!

---

**Total Setup Time:** ~1 minute
**Difficulty:** Easy
**One-time setup:** Yes
**Required files:** `supabase-setup-storage.sql`

---

🎉 **Once complete, your app will be fully functional!**

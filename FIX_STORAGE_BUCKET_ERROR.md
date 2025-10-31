# Fix Storage Bucket Error - Complete Guide

## 🎯 Problem
The app shows continuous errors because the Supabase storage bucket `mood-captures` doesn't exist.

## ✅ Solution
Create the storage bucket using the SQL migration provided.

---

## 📋 Method 1: Using Supabase Dashboard (EASIEST)

### Step 1: Open Supabase SQL Editor
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar

### Step 2: Run the Migration
1. Click **New Query**
2. Copy the entire contents of `supabase_create_storage_bucket.sql`
3. Paste into the SQL editor
4. Click **Run** or press `Ctrl+Enter`

### Step 3: Verify Success
You should see messages:
```
✅ Storage bucket "mood-captures" created successfully!
✅ Public access enabled
✅ RLS policies configured
```

### Step 4: Verify in Dashboard
1. Go to **Storage** in left sidebar
2. You should see `mood-captures` bucket listed
3. It should show as **Public**

---

## 📋 Method 2: Using Supabase CLI (ADVANCED)

### Prerequisites
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF
```

### Run Migration
```bash
# Apply the migration
supabase db push --file supabase_create_storage_bucket.sql
```

---

## 📋 Method 3: Manual Creation (IF SQL FAILS)

### Step 1: Create Bucket Manually
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Storage** → **New Bucket**
4. Enter name: `mood-captures`
5. ✅ **CHECK** "Public bucket" (IMPORTANT!)
6. Click **Create bucket**

### Step 2: Set Policies Manually
1. Click on the `mood-captures` bucket
2. Go to **Policies** tab
3. Click **New Policy**
4. Create 4 policies:
   - **INSERT**: Allow public uploads
   - **SELECT**: Allow public reads
   - **UPDATE**: Allow public updates
   - **DELETE**: Allow public deletes

For each policy:
- Target roles: `public`
- Policy command: [INSERT/SELECT/UPDATE/DELETE]
- USING expression: `bucket_id = 'mood-captures'`
- WITH CHECK expression: `bucket_id = 'mood-captures'`

---

## 🔄 After Creating the Bucket

### Step 1: Restart Your Dev Server
```bash
# Press Ctrl+C to stop the server
# Then restart:
npm run dev
```

### Step 2: Clear Next.js Cache (Optional but Recommended)
```bash
# Stop the server first, then:
rm -rf .next
npm run dev
```

### Step 3: Clear Browser Cache
- **Chrome/Edge**: Press `Ctrl+Shift+R` (hard refresh)
- **Firefox**: Press `Ctrl+F5`
- Or manually: DevTools → Application → Clear Storage

### Step 4: Refresh the App
- Open `localhost:3000`
- The errors should be GONE!
- Image uploads should now work

---

## 🎉 Expected Results

### Before Fix:
- ❌ Continuous 400 errors
- ❌ "Storage bucket not found" warnings
- ❌ Images not saved
- ❌ Leaderboard screenshots missing

### After Fix:
- ✅ Zero errors in console
- ✅ Images upload successfully
- ✅ Metrics saved with photo URLs
- ✅ Leaderboard shows screenshots
- ✅ Full app functionality enabled

---

## 🔍 Troubleshooting

### Issue: Migration fails with "relation storage.buckets does not exist"
**Solution**: Your Supabase project might not have storage enabled.
1. Go to Supabase Dashboard → Storage
2. Enable storage if prompted
3. Try running the migration again

### Issue: Still seeing errors after creating bucket
**Solution**:
1. Verify bucket exists: Dashboard → Storage → Check for `mood-captures`
2. Verify bucket is **public**: Should have a "Public" badge
3. Restart dev server: Stop (Ctrl+C) → `npm run dev`
4. Clear browser cache: `Ctrl+Shift+R`
5. Optional: Call `resetBucketState()` in browser console

### Issue: Images still not uploading
**Solution**:
1. Check browser console for new errors
2. Verify Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
3. Check Network tab in DevTools - uploads should return 200 OK

---

## 🆘 Need Help?

If you're still experiencing issues:
1. Check the browser console for specific error messages
2. Verify the bucket exists and is public in Supabase dashboard
3. Ensure you restarted the dev server
4. Try clearing all caches (Next.js + browser)

---

## 📝 Technical Details

### What This Migration Does:
1. **Creates bucket**: `mood-captures` with 5MB file size limit
2. **Sets as public**: Images accessible via public URLs
3. **Allows mime types**: JPEG, PNG, WebP, GIF
4. **Creates RLS policies**: Allows public INSERT, SELECT, UPDATE, DELETE

### Why Public Bucket?
- Images need to be viewable without authentication
- Leaderboard displays screenshots publicly
- Metrics with images are shared across sessions

### Security Note:
- Public bucket means anyone can upload/view images
- Consider adding rate limiting in production
- Consider adding authentication for uploads in production
- Current setup is fine for demo/development

---

## ✅ Quick Checklist

- [ ] SQL migration file created: `supabase_create_storage_bucket.sql`
- [ ] Opened Supabase Dashboard SQL Editor
- [ ] Ran the migration successfully
- [ ] Verified bucket appears in Storage section
- [ ] Bucket shows as "Public"
- [ ] Restarted Next.js dev server
- [ ] Cleared browser cache
- [ ] Refreshed app at localhost:3000
- [ ] Verified no errors in console
- [ ] Tested image upload functionality

---

**All done!** Your app should now work perfectly with full image storage functionality. 🎉

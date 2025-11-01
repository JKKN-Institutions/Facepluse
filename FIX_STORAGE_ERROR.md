# 🚨 FIX: Storage Bucket Error

## Error Message
```
🚨 STORAGE BUCKET NOT FOUND! 🚨
The Supabase storage bucket "mood-captures" does not exist.
```

## Quick Fix (5 minutes)

### ⚡ **Fastest Method: Interactive Setup Guide**

1. **Ensure your dev server is running:**
   ```bash
   npm run dev
   ```

2. **Open the setup guide:**
   ```bash
   open-setup-guide.bat
   ```
   OR visit: **http://localhost:3000/setup-storage**

3. **Follow the interactive instructions** - they will guide you through:
   - Creating the storage bucket
   - Setting up access policies
   - Verifying everything works

---

## Alternative: Manual Setup

### Step 1: Create the Bucket

1. **Open Supabase Storage Dashboard:**
   ```
   https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw/storage/buckets
   ```

2. **Click "New Bucket"**

3. **Configure:**
   - **Name:** `mood-captures`
   - **Public:** ✅ **MUST BE CHECKED**
   - **Size limit:** 5 MB (5242880 bytes)
   - **MIME types:** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

4. **Click "Create bucket"**

### Step 2: Set Up Policies

1. **Open SQL Editor:**
   ```
   https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw/sql/new
   ```

2. **Copy the entire contents** of `supabase-setup-storage.sql`

3. **Paste into SQL Editor**

4. **Click "Run"**

### Step 3: Restart Your App

```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## Why This Error Happens

Supabase storage buckets don't automatically create themselves. This bucket must be created manually because:

1. ❌ **Anon API keys** can't create buckets (RLS policy restriction)
2. ❌ **Service role keys** shouldn't be in client-side code
3. ✅ **Manual creation** via Dashboard is the official Supabase approach

This is **normal** and **expected** behavior for Supabase projects.

---

## Verification

After setup, verify the bucket exists:

### Via SQL:
```sql
SELECT * FROM storage.buckets WHERE id = 'mood-captures';
```

Expected result:
- ✅ `id`: mood-captures
- ✅ `name`: mood-captures
- ✅ `public`: true
- ✅ `file_size_limit`: 5242880

### Via App:
1. Restart your dev server
2. Open app in browser
3. Console should be **error-free**
4. Smile at camera - image should upload
5. Check Supabase Dashboard → Storage → mood-captures → Files should appear

---

## Files Reference

| File | Purpose |
|------|---------|
| `supabase-setup-storage.sql` | SQL script for policies |
| `setup-storage.bat` | Windows helper script |
| `SETUP_STORAGE.md` | Detailed setup guide |
| `FIX_STORAGE_ERROR.md` | This file (quick fix) |
| `/setup-storage` | Interactive web guide |
| `/api/create-bucket` | API endpoint (debugging) |

---

## Still Having Issues?

### Common Problems:

**1. "Bucket already exists" error**
- ✅ Good! The bucket is created
- Run the SQL policies from `supabase-setup-storage.sql`
- Restart your app

**2. "Permission denied" when uploading**
- Check you ran the SQL policies
- Verify bucket is marked as "public"
- Restart your app after running SQL

**3. "Failed to upload image"**
- Check your internet connection
- Verify Supabase project is active
- Check Supabase status: https://status.supabase.com

**4. Error still shows in console**
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache
- Restart dev server
- Check browser DevTools → Application → Clear site data

---

## Quick Checklist

- [ ] Created `mood-captures` bucket in Dashboard
- [ ] Set bucket as **Public** ✅
- [ ] Ran SQL from `supabase-setup-storage.sql`
- [ ] Verified 4 policies created (upload, select, update, delete)
- [ ] Restarted Next.js dev server
- [ ] Refreshed browser
- [ ] No errors in console
- [ ] Test upload works

---

## Support

If you've completed all steps and still see errors:

1. **Check Supabase project status:**
   ```
   https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw
   ```

2. **Verify bucket exists:**
   - Dashboard → Storage → Buckets
   - Look for "mood-captures" in the list

3. **Check policies:**
   - Dashboard → Storage → mood-captures → Policies
   - Should see 4 policies listed

4. **Browser console:**
   - Open DevTools (F12)
   - Check Network tab during upload
   - Look for failed requests

---

## Success!

Once setup is complete, you'll see:

✅ No console errors
✅ Images uploading automatically
✅ Files appearing in Supabase Storage
✅ Leaderboard showing screenshots
✅ Time Capsule feature working

**Estimated Setup Time:** 3-5 minutes
**Difficulty:** Easy
**One-time setup:** Yes

---

🎉 **Your app will be fully functional after completing these steps!**

# 🚨 Quick Fix: Storage Bucket Not Found Error

## Error You're Seeing:
```
❌ Upload error: StorageApiError: Bucket not found
```

## What This Means:
Your Supabase Storage bucket `mood-captures` doesn't exist yet. The app needs this bucket to save face capture images.

---

## ⚡ Quick Fix (5 minutes):

### Step 1: Create the Bucket
1. **Go to**: https://supabase.com/dashboard
2. **Select** your project
3. **Click** Storage (left sidebar)
4. **Click** "New Bucket"
5. **Enter**:
   - Name: `mood-captures`
   - Public bucket: ✅ **CHECK THIS BOX** (very important!)
6. **Click** "Create Bucket"

### Step 2: Set Permissions
1. **Click** on the `mood-captures` bucket you just created
2. **Click** "Policies" tab at the top
3. **Click** "New Policy"
4. **Select** "For full customization"
5. **Fill in**:
   - Policy Name: `Public Upload and Read`
   - Allowed Operations: ✅ Check ALL boxes (SELECT, INSERT, UPDATE, DELETE)
   - Policy Definition: Type `true`
6. **Click** "Review" → "Save Policy"

### Step 3: Verify
1. **Refresh** your browser at `localhost:3000`
2. **Allow** camera permissions
3. **Wait** for face detection
4. **Check** browser console - should now see:
   ```
   ✅ Image uploaded: https://[your-project].supabase.co/storage/...
   ```

---

## Why is this needed?

The app uploads face captures in two places:
- **Main Dashboard**: Saves emotional snapshots every 3 seconds
- **Time Capsule**: Stores moments during events for collage generation

Without the bucket, images fail to save (app continues working but without image storage).

---

## Still Having Issues?

See the full setup guide: **SETUP_TIME_CAPSULE.md**

Or check Supabase docs: https://supabase.com/docs/guides/storage

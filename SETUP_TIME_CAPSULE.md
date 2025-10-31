# Time Capsule Setup & Testing Guide

## 🚀 Step 1: Supabase Database Setup

### A. Run SQL Migrations

1. **Open Supabase Dashboard**: https://app.supabase.com
2. Navigate to your project → **SQL Editor**
3. Click **New Query**
4. Copy and paste the following SQL:

```sql
-- ============================================
-- TIME CAPSULE DATABASE MIGRATIONS
-- ============================================

-- 1. Add image_url column to metrics table
ALTER TABLE metrics
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_metrics_created_at
ON metrics(created_at);

CREATE INDEX IF NOT EXISTS idx_metrics_image_url
ON metrics(image_url) WHERE image_url IS NOT NULL;

-- 2. Create time_capsule_events table
CREATE TABLE IF NOT EXISTS time_capsule_events (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  include_challenges BOOLEAN DEFAULT false,
  collage_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_capsule_events_created_at
ON time_capsule_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_time_capsule_events_user_id
ON time_capsule_events(user_id) WHERE user_id IS NOT NULL;

-- 3. Enable Row Level Security (optional, for multi-user)
ALTER TABLE time_capsule_events ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (adjust based on your auth setup)
CREATE POLICY "Enable all operations for all users"
ON time_capsule_events
FOR ALL
USING (true);

-- ============================================
-- Verify tables created
-- ============================================
SELECT 'Migrations completed successfully!' as status;

-- Check metrics table has image_url column
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'metrics' AND column_name = 'image_url';

-- Check time_capsule_events table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'time_capsule_events';
```

5. Click **Run** or press `Ctrl+Enter`
6. ✅ Verify you see "Migrations completed successfully!"

---

### B. Create Storage Bucket

1. In Supabase Dashboard, navigate to **Storage** (left sidebar)
2. Click **New Bucket**
3. Enter the following:
   - **Name**: `mood-captures`
   - **Public bucket**: ✅ Check this (we need public access)
4. Click **Create Bucket**

---

### C. Set Storage Policies

1. Click on the **mood-captures** bucket you just created
2. Click **Policies** tab at the top
3. Click **New Policy**
4. Select **For full customization** option
5. Enter policy details:

**Policy Name**: `Public Upload and Read`

**Allowed Operations**: Check all boxes:
- ✅ SELECT
- ✅ INSERT
- ✅ UPDATE
- ✅ DELETE

**Policy Definition**: Use this SQL:
```sql
true
```

6. Click **Review** → **Save Policy**

---

## ✅ Step 2: Verify Database Setup

Run these queries in SQL Editor to verify everything is set up correctly:

```sql
-- 1. Check metrics table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'metrics'
ORDER BY ordinal_position;

-- Expected: Should see 'image_url' column of type 'text'

-- 2. Check time_capsule_events table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'time_capsule_events'
ORDER BY ordinal_position;

-- Expected: Should see all columns (id, name, description, start_time, end_time, etc.)

-- 3. Test inserting a sample event (optional)
INSERT INTO time_capsule_events (name, description, start_time)
VALUES ('Test Event', 'Testing setup', NOW())
RETURNING *;

-- Expected: Should return the created event

-- 4. Delete test event (cleanup)
DELETE FROM time_capsule_events WHERE name = 'Test Event';
```

---

## 🧪 Step 3: Testing Checklist

### Phase 1: Image Upload Testing

#### Test 1.1: Main Dashboard Image Capture
- [ ] **Start app**: `npm run dev`
- [ ] **Navigate to main dashboard** (/)
- [ ] **Allow camera permissions**
- [ ] **Wait for face detection**
- [ ] **Capture an emotion** (smile or make an expression)
- [ ] **Check browser console** for logs:
  ```
  📸 Uploading captured image...
  ✅ Image uploaded: https://[your-project].supabase.co/storage/v1/object/public/mood-captures/...
  🟢 Metric saved successfully with image
  ```

#### Test 1.2: Verify Image in Supabase
- [ ] Go to Supabase Dashboard → **Storage** → **mood-captures** bucket
- [ ] ✅ You should see uploaded image files (timestamp_random.jpg)
- [ ] Click on an image to preview it
- [ ] Go to **Table Editor** → **metrics** table
- [ ] ✅ Latest row should have `image_url` filled with Supabase URL

**❌ If image upload fails:**
- Check browser console for errors
- Verify storage bucket is public
- Check storage policies allow INSERT
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

---

### Phase 2: Time Capsule Event Testing

#### Test 2.1: Create Manual Stop Event
- [ ] Navigate to **/timecapsule**
- [ ] Click **"Create New Event"**
- [ ] Fill in form:
  - Name: "Test Manual Event"
  - Description: "Testing manual stop"
  - Duration: Select "Manual Stop"
  - Include Challenge Images: Unchecked
- [ ] Click **"Start Event"**
- [ ] ✅ Should see toast: "Event started!"
- [ ] ✅ Should see **Active Event Banner** with timer

#### Test 2.2: Active Event Timer
- [ ] ✅ Timer should count up (0:00, 0:01, 0:02...)
- [ ] ✅ "Stop Event" button should be visible and red

#### Test 2.3: Capture Moments During Event
- [ ] Go back to **main dashboard** (/)
- [ ] Make different expressions (smile, neutral, surprised)
- [ ] Wait for 3-5 captures (check console logs)
- [ ] ✅ Images should be uploading to Supabase

#### Test 2.4: Stop Event
- [ ] Go back to **/timecapsule**
- [ ] ✅ Active event banner should still be showing
- [ ] Click **"Stop Event"**
- [ ] ✅ Should see toast: "Event stopped!"
- [ ] ✅ Active banner should disappear
- [ ] ✅ Event should appear in grid with "⏳ Ready for Collage" badge

#### Test 2.5: Verify Event in Database
- [ ] Go to Supabase → **Table Editor** → **time_capsule_events**
- [ ] ✅ Should see your test event
- [ ] ✅ `start_time` should be filled
- [ ] ✅ `end_time` should be filled
- [ ] ✅ `collage_url` should be NULL (not generated yet)

---

### Phase 3: Collage Generation Testing

#### Test 3.1: Generate Collage
- [ ] In **/timecapsule**, click on your stopped event
- [ ] ✅ Should navigate to event detail view
- [ ] ✅ Should see "Create Your Collage" section (no collage yet)
- [ ] Click **"Generate Collage"**
- [ ] ✅ Should see toast: "Fetching captured moments..."
- [ ] Wait for generation (may take 10-30 seconds depending on image count)

**Expected Console Logs:**
```
🔍 Fetching images from [start_time] to [end_time]
✅ Found X captured moments with images
🎨 Generating collage with X moments...
📐 Collage layout: 6x4 grid, 180px photos, X images
🖼️  Canvas size: 1234x567px
✅ Collage generated successfully
```

#### Test 3.2: View Collage
- [ ] ✅ Should see toast: "Collage created successfully!"
- [ ] ✅ Collage image should display in event detail
- [ ] ✅ Should see "📐 Collage contains X moments • Optimized for Full HD viewing"
- [ ] ✅ Collage should show grid of captured faces
- [ ] ✅ Each photo should have:
  - Emotion emoji badge (top-left)
  - Smile percentage badge (top-right)
  - Timestamp bar (bottom)

#### Test 3.3: Download Collage
- [ ] Click **"Download Collage"** button
- [ ] ✅ Should see toast: "Collage downloaded!"
- [ ] ✅ PNG file should download: `Test_Manual_Event_collage_[timestamp].png`
- [ ] Open PNG file
- [ ] ✅ Should be high-quality Full HD image
- [ ] ✅ Header should show event name, stats, date

#### Test 3.4: Verify Collage in Database
- [ ] Go to Supabase → **Table Editor** → **time_capsule_events**
- [ ] Find your event
- [ ] ✅ `collage_url` should now be filled with base64 data
- [ ] ✅ Event should show "✅ Collage Generated" badge in UI

---

### Phase 4: Timed Event Testing

#### Test 4.1: Create 30-Minute Auto-Stop Event
- [ ] Click **"Create New Event"**
- [ ] Fill in:
  - Name: "30 Min Test"
  - Duration: Select "30 Minutes"
- [ ] Click **"Start Event"**
- [ ] ✅ Should see active banner with:
  - Elapsed time counter
  - **Remaining time** counter (30:00, 29:59, ...)

#### Test 4.2: Auto-Stop Behavior
**Note:** You don't need to wait 30 minutes. You can test by:

**Option A - Wait and test:**
- [ ] Wait for event to expire (or modify duration to 1 minute in code for testing)
- [ ] ✅ Banner should turn yellow
- [ ] ✅ Should see "⏰ Event Completed" and "Time's up!" message

**Option B - Manual test:**
- [ ] Manually stop the event
- [ ] Proceed to collage generation

---

### Phase 5: Edge Case Testing

#### Test 5.1: No Images Captured
- [ ] Create new event
- [ ] Immediately stop it (don't capture any moments)
- [ ] Try to generate collage
- [ ] ✅ Should see error: "No images found for this time period"

#### Test 5.2: Multiple Events
- [ ] Create 3 different events at different times
- [ ] Capture moments between each
- [ ] Stop all events
- [ ] ✅ Each event should only show images from its time range
- [ ] Generate collages for each
- [ ] ✅ Collages should be different

#### Test 5.3: Delete Event
- [ ] Go to event detail view
- [ ] (You may need to add delete button in EventDetailView - currently missing)
- [ ] Or delete from event grid
- [ ] ✅ Event should be removed from database

#### Test 5.4: Large Image Count
- [ ] Create event
- [ ] Capture 50+ moments (leave it running for 5+ minutes)
- [ ] Stop event
- [ ] Generate collage
- [ ] ✅ Console should log adaptive sizing: "Medium image count, 140px photos"
- [ ] ✅ Collage should scale photos appropriately

---

## 🐛 Troubleshooting Guide

### Problem: Images not uploading to Supabase

**Symptoms:**
- Console shows: "⚠️ Image upload failed"
- No images in `mood-captures` bucket

**Solutions:**
1. Check storage bucket exists and is public
2. Verify storage policies allow INSERT
3. Check `.env.local` has correct Supabase credentials
4. Check browser console for detailed error
5. Try manually uploading a file in Supabase dashboard to test bucket

### Problem: "Failed to generate collage - No images found"

**Symptoms:**
- Collage generation fails
- Console shows: "✅ Found 0 captured moments with images"

**Solutions:**
1. Verify images were actually captured during event time period
2. Check `metrics` table has entries with `image_url` between `start_time` and `end_time`
3. Run this SQL to debug:
```sql
SELECT created_at, image_url
FROM metrics
WHERE created_at BETWEEN '[start_time]' AND '[end_time]'
AND image_url IS NOT NULL;
```

### Problem: Collage generation hangs

**Symptoms:**
- Loading toast stays forever
- No errors in console

**Solutions:**
1. Check browser console for Canvas API errors
2. Verify images from Supabase Storage are accessible (try opening URL directly)
3. Check if too many images (500+) - may need to wait longer
4. Hard refresh page (Ctrl+Shift+R)

### Problem: Storage bucket not found

**Symptoms:**
- Error: "Bucket mood-captures not found"

**Solutions:**
1. Go to Supabase → Storage → Create bucket named exactly `mood-captures`
2. Make sure it's marked as public
3. Restart dev server: `npm run dev`

---

## 📊 Success Criteria

You'll know everything works correctly when:

✅ **Main Dashboard:**
- Captures save with images to Supabase
- Console logs show successful uploads

✅ **Time Capsule:**
- Can create events with different durations
- Active event timer displays correctly
- Can stop events manually

✅ **Collage Generation:**
- Fetches correct images from time range
- Generates beautiful PNG collage
- Collage includes all captured moments
- Download works correctly

✅ **Database:**
- `metrics` table has `image_url` populated
- `time_capsule_events` table tracks events
- Storage bucket contains images

---

## 🎉 Next Steps After Testing

Once everything works:

1. **Delete backup files:**
   ```bash
   rm app/timecapsule/page_old_backup.tsx
   rm hooks/useTimeCapsule.ts
   rm components/TimeCapsule/RecordingView.tsx
   ```

2. **Update documentation:**
   - Update main README with new Time Capsule workflow
   - Document Supabase setup requirements

3. **Optional enhancements:**
   - Add challenge images support (requires challenge image storage)
   - Add collage sharing to social media
   - Add event filtering by date range
   - Add statistics page showing all events

4. **Deploy:**
   - Push to production
   - Run migrations on production Supabase
   - Create production storage bucket

---

## 🆘 Need Help?

If you encounter issues:

1. Check browser console for detailed errors
2. Check Supabase logs (Dashboard → Logs)
3. Verify all SQL migrations ran successfully
4. Test storage bucket manually in Supabase UI
5. Check network tab for failed API requests

---

**Ready to test? Start with Step 1: Supabase Database Setup! 🚀**

# Supabase Storage CORS Configuration

## Why This Is Needed

The collage generator uses `canvas.toDataURL()` to export images as PNG files. When loading images from Supabase Storage into a canvas element, the browser enforces CORS (Cross-Origin Resource Sharing) restrictions. Without proper CORS headers, the canvas becomes "tainted" and the export fails with:

```
SecurityError: Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported.
```

## Solution

Configure CORS headers for your Supabase Storage bucket to allow cross-origin canvas operations.

---

## Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Access Storage Settings
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: **gjgmjkapgtefuovmrydw**
3. Navigate to **Storage** in the left sidebar
4. Click on **Configuration** or **Settings**

### Step 2: Configure CORS Policy
1. Look for **CORS Configuration** section
2. Add the following CORS policy for the `mood-captures` bucket:

```json
{
  "allowedOrigins": ["*"],
  "allowedMethods": ["GET", "HEAD"],
  "allowedHeaders": ["*"],
  "exposedHeaders": ["ETag"],
  "maxAgeSeconds": 3600
}
```

**For production**, replace `"*"` with your specific domain:
```json
{
  "allowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
  "allowedMethods": ["GET", "HEAD"],
  "allowedHeaders": ["*"],
  "exposedHeaders": ["ETag"],
  "maxAgeSeconds": 3600
}
```

### Step 3: Save and Test
1. Save the CORS configuration
2. Wait 1-2 minutes for changes to propagate
3. Clear your browser cache or use incognito mode
4. Test the collage generation feature

---

## Method 2: Using Supabase CLI

If you have the Supabase CLI installed, you can configure CORS programmatically:

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login
```bash
supabase login
```

### Step 3: Link Your Project
```bash
supabase link --project-ref gjgmjkapgtefuovmrydw
```

### Step 4: Update Storage Config
Create a file `supabase/config.toml` (if it doesn't exist) and add:

```toml
[storage]
file_size_limit = "50MB"

[[storage.buckets]]
name = "mood-captures"
public = true

[[storage.buckets.cors]]
allowed_origins = ["*"]
allowed_methods = ["GET", "HEAD"]
allowed_headers = ["*"]
exposed_headers = ["ETag"]
max_age_seconds = 3600
```

### Step 5: Deploy Configuration
```bash
supabase db push
```

---

## Method 3: Using Supabase API

You can also configure CORS via the Supabase Management API:

```bash
curl -X POST 'https://api.supabase.com/v1/projects/gjgmjkapgtefuovmrydw/storage/buckets/mood-captures/cors' \
  -H 'Authorization: Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "allowedOrigins": ["*"],
    "allowedMethods": ["GET", "HEAD"],
    "allowedHeaders": ["*"],
    "exposedHeaders": ["ETag"],
    "maxAgeSeconds": 3600
  }'
```

**Note:** Replace `YOUR_SUPABASE_SERVICE_ROLE_KEY` with your actual service role key from Supabase Dashboard → Settings → API.

---

## Verification

After configuring CORS, verify it's working:

### 1. Check CORS Headers
Open your browser's Developer Tools (F12) and run:

```javascript
fetch('https://gjgmjkapgtefuovmrydw.supabase.co/storage/v1/object/public/mood-captures/test.jpg', {
  method: 'HEAD'
})
.then(response => {
  console.log('CORS headers:', {
    'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
    'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
  });
});
```

You should see:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD
```

### 2. Test Collage Generation
1. Start a Time Capsule event
2. Capture some moments with real images
3. End the event
4. Click "Generate Collage"
5. Check browser console for errors

If successful, you'll see:
```
📐 Collage layout: 4x3 grid, 180px photos, 12 images
🖼️  Canvas size: 800x720px
✅ Collage generated successfully
```

If CORS is still not working, you'll see:
```
Failed to load image X: [error details]
Image URL: https://gjgmjkapgtefuovmrydw.supabase.co/...
This might be a CORS issue. Ensure Supabase Storage has CORS enabled.
```

---

## Troubleshooting

### Issue: "Still getting canvas taint error"

**Solutions:**
1. **Clear browser cache** - CORS headers are cached by browsers
2. **Use incognito mode** - Test in a fresh browser session
3. **Wait 2-5 minutes** - CORS changes may take time to propagate
4. **Check bucket is public** - Ensure `mood-captures` bucket has public access enabled
5. **Verify bucket name** - Ensure you're configuring the correct bucket (`mood-captures`)

### Issue: "Images not loading at all"

**Solutions:**
1. Check if images exist in Supabase Storage
2. Verify bucket permissions (should be public)
3. Test image URL directly in browser
4. Check for typos in bucket name

### Issue: "CORS working but collage still fails"

**Solutions:**
1. Check browser console for other errors
2. Verify `img.crossOrigin = 'anonymous'` is in the code (lib/collageGenerator.ts:95)
3. Ensure images are valid JPEG/PNG files
4. Try with fewer images (start with 1-2)

---

## Production Best Practices

For production deployments:

1. **Restrict origins** to your actual domain:
   ```json
   "allowedOrigins": ["https://yourdomain.com"]
   ```

2. **Enable CDN caching** - Supabase Storage supports CDN caching, which improves performance

3. **Set appropriate cache headers** - Configure `maxAgeSeconds` based on your needs

4. **Monitor storage usage** - Keep an eye on storage quotas

5. **Implement image optimization** - Compress images before upload to reduce storage costs

---

## Code Changes Made

The following changes were made to fix the canvas taint issue:

### File: `lib/collageGenerator.ts`

**Line 95:** Added `crossOrigin` attribute
```typescript
const img = new Image();
img.crossOrigin = 'anonymous'; // ✅ Prevents canvas taint
```

**Lines 120-150:** Enhanced error handling
- Detailed error logging
- Visual placeholder for failed images
- CORS troubleshooting hints in console

---

## Next Steps

1. ✅ Configure CORS using Method 1 (Dashboard)
2. ✅ Wait 2-5 minutes for changes to propagate
3. ✅ Test collage generation with real images
4. ✅ Verify no console errors
5. ✅ Download and check the generated PNG

If you encounter any issues, check the browser console for detailed error messages.

---

## Resources

- [Supabase Storage CORS Documentation](https://supabase.com/docs/guides/storage/cors)
- [MDN: CORS and Canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image)
- [Canvas Taint Prevention](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_usage)

---

**Last Updated:** 2025-10-31

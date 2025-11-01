# 🎭 Emoji Reaction Challenge - Setup Guide

This guide will help you set up the Emoji Reaction Challenge feature in your Facepluse app.

## ✨ Features

- **Auto-Capture**: Automatically captures reactions when emotions are detected
- **Random Emojis**: Selects 3 random emojis from a pool of 8 emotions
- **Frame Generation**: Creates a beautiful frame with all 3 captured reactions
- **QR Code**: Generates QR code for easy sharing
- **Download & Share**: Download frame or share via link
- **Public Gallery**: Shareable public links for viewing reactions

---

## 📋 Prerequisites

Make sure you have:
- ✅ Supabase project set up
- ✅ Environment variables configured (`.env.local`)
- ✅ QR code library installed (`npm install qrcode @types/qrcode`)

---

## 🗄️ Database & Storage Setup

### Step 1: Run SQL Setup Script

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to: **SQL Editor** → **New Query**
3. Copy the contents of `supabase-emoji-reactions-setup.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute

This will:
- ✅ Create `public-frames` storage bucket
- ✅ Set up storage RLS policies
- ✅ Create `emoji_reactions` database table
- ✅ Configure public access policies
- ✅ Add helper functions for counters

### Step 2: Verify Setup

After running the SQL, verify everything is set up correctly:

**Check Storage Bucket:**
```sql
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'public-frames';
```
Expected: Should return 1 row with `public: true`

**Check Database Table:**
```sql
SELECT * FROM public.emoji_reactions LIMIT 1;
```
Expected: Table exists (may be empty)

**Check Policies:**
```sql
SELECT policyname FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE 'public-frames:%';
```
Expected: 4 policies (upload, select, update, delete)

---

## 🔑 Environment Variables

Ensure these variables are set in your `.env.local`:

```env
# Required for emoji reactions
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# For share links (defaults to localhost if not set)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Where to find these:**
- Supabase Dashboard → Settings → API
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: service_role key (keep secret!)

---

## 🚀 Usage

### For Users:

1. **Navigate to Challenge Page**
   ```
   http://localhost:3000/challenge
   ```

2. **Start Challenge**
   - Click "Start Challenge"
   - Wait for camera to initialize
   - Face will be detected automatically

3. **Match Emojis**
   - 3 random emojis will appear one by one
   - Match each expression with your face
   - Hold the expression for 1 second
   - Auto-captures when matched!

4. **View Results**
   - See all 3 captured reactions in a frame
   - Download the frame as PNG
   - Share via QR code or link

### For Developers:

**Key Components:**
- `app/challenge/page.tsx` - Main challenge page
- `hooks/useEmojiReactionFlow.ts` - State management
- `lib/emojiReactionFrameGenerator.ts` - Frame generation
- `app/api/share-reaction/route.ts` - Upload & share API
- `app/shared/[id]/page.tsx` - Public view page

**Emotion Mapping:**
```typescript
😊 happy     → "happy"
😢 sad       → "sad"
😲 surprised → "surprised"
😠 angry     → "angry"
😐 neutral   → "neutral"
😨 fearful   → "fearful"
🤢 disgusted → "disgusted"
🤔 thinking  → "neutral"
```

---

## 🎨 Customization

### Change Emoji Pool

Edit `hooks/useEmojiReactionFlow.ts`:
```typescript
const EMOJI_POOL: EmojiOption[] = [
  { emoji: '😊', emotion: 'happy', label: 'Happy' },
  // Add more emojis here
];
```

### Adjust Match Duration

Edit `hooks/useEmojiReactionFlow.ts`:
```typescript
const MATCH_DURATION = 1000; // milliseconds
const MATCH_CONFIDENCE_THRESHOLD = 0.6; // 60%
```

### Customize Frame Layout

Edit `lib/emojiReactionFrameGenerator.ts`:
- Canvas dimensions: `frameWidth`, `frameHeight`
- Colors: gradient, borders, QR code colors
- Layout: image positions, spacing

---

## 🐛 Troubleshooting

### Storage Upload Fails

**Error:** "Failed to upload frame"

**Solution:**
1. Check if bucket exists:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'public-frames';
   ```
2. Verify RLS policies are active
3. Check `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

### QR Code Not Showing

**Error:** QR code section is blank

**Solution:**
1. Verify `NEXT_PUBLIC_APP_URL` is set correctly
2. Check browser console for QR generation errors
3. Ensure `qrcode` package is installed

### Emotion Not Detected

**Issue:** Camera shows face but doesn't match emotions

**Solution:**
1. Ensure good lighting
2. Face the camera directly
3. Hold expression for full 1 second
4. Check confidence threshold (default 60%)

### Share Link 404

**Error:** Shared link shows "Not Found"

**Solution:**
1. Check if table `emoji_reactions` exists
2. Verify API route is working: `/api/share-reaction?id=test`
3. Check Supabase RLS policies allow SELECT

---

## 📊 Monitoring

### View Analytics

Check how many reactions have been created:
```sql
SELECT
  COUNT(*) as total_reactions,
  SUM(views) as total_views,
  SUM(downloads) as total_downloads
FROM public.emoji_reactions;
```

### Recent Reactions
```sql
SELECT
  id,
  created_at,
  views,
  downloads,
  jsonb_array_length(reactions) as reaction_count
FROM public.emoji_reactions
ORDER BY created_at DESC
LIMIT 10;
```

### Popular Reactions
```sql
SELECT
  id,
  views,
  downloads,
  created_at
FROM public.emoji_reactions
ORDER BY views DESC
LIMIT 10;
```

---

## 🔒 Security Notes

**Current Setup:** Public access for demo purposes

**For Production:**
- Consider adding authentication
- Implement rate limiting
- Add CAPTCHA to prevent abuse
- Set file size limits
- Add content moderation

**Rate Limiting Example:**
```typescript
// In app/api/share-reaction/route.ts
import rateLimit from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  if (!rateLimit(ip, 10, 60000)) { // 10 requests per minute
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  // ... rest of the code
}
```

---

## 🎉 Success!

Your Emoji Reaction Challenge is now ready!

**Test it:**
1. Start dev server: `npm run dev`
2. Visit: http://localhost:3000/challenge
3. Complete a challenge
4. Share the result!

**Need Help?**
- Check the browser console for errors
- Review Supabase logs
- Verify all environment variables
- Re-run the SQL setup script

---

## 📝 TODO / Future Enhancements

- [ ] Add more emoji options
- [ ] Allow custom emoji selection
- [ ] Add difficulty levels (match time)
- [ ] Leaderboard for fastest completions
- [ ] Social media sharing integration
- [ ] Multiple frame layouts/themes
- [ ] Video compilation option
- [ ] Save to user profile (if authenticated)

---

**Made with ❤️ for Facepluse**

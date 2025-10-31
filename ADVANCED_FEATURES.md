# 🎨 Advanced Emotion Features - Setup Guide

This document explains the three new advanced features added to the FacePulse application.

## 🌟 Features Overview

### 1. **Mood-Based Dynamic Color Themes** 🎨
The entire application automatically changes colors based on your detected emotions:
- **Happy** → Warm Yellow theme
- **Sad** → Cool Blue theme
- **Surprised** → Vibrant Pink theme
- **Angry** → Bold Red theme
- **Neutral** → Fresh Green theme

**How it works:**
- Colors transition smoothly (0.8s) across the entire app
- Affects navbar, sidebar, cards, buttons, and all UI elements
- Always active - no configuration needed

---

### 2. **Emoji Match Challenge** 🎯
An interactive game where you match random emotions for points!

**Game Features:**
- 5 rounds, 10 seconds each
- Real-time emotion matching
- Scoring up to 1000 points
- Streak bonuses for perfect matches
- High score persistence
- Confetti celebrations

**How to Play:**
1. Navigate to `/challenge` via the sidebar
2. Click "Start Challenge"
3. Match the displayed emotion with your face
4. Submit before time runs out
5. Compete for high scores!

**Access:** Click the **Target (🎯)** icon in the sidebar

---

### 3. **Time Capsule Emotions** 🎬
Capture emotional moments from events and generate beautiful PNG collages.

**Features:**
- Event-based emotion recording
- Auto-capture every 5 seconds during recording
- Real-time emotion statistics
- PNG collage generation (client-side)
- **Adaptive layout** - automatically scales photos based on image count
- **Fixed Full HD canvas** - optimized for 1920px width
- Emotion distribution visualization
- Peak happiness moment detection

**Workflow:**
1. Navigate to `/timecapsule`
2. Create a new event (e.g., "Birthday Party")
3. Start recording - emotions are captured automatically
4. Stop recording when event ends
5. Generate PNG collage with all captured moments
6. Download and share your emotional journey

**Access:** Click the **Film (🎬)** icon in the sidebar

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

All required packages are already installed.

### Step 2: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 File Structure

### New Files Added

```
app/
├── challenge/
│   └── page.tsx                    # Emoji Challenge game page
└── timecapsule/
    └── page.tsx                    # Time Capsule main page

components/
├── EmojiChallenge.tsx              # Challenge game component
├── TimeCapsule/
│   ├── EventCard.tsx               # Event list card
│   ├── RecordingView.tsx           # Live recording interface
│   └── EventDetailView.tsx         # Event details & video player

contexts/
└── ThemeContext.tsx                # Global theme management

hooks/
├── useEmojiChallenge.ts            # Game logic hook
└── useTimeCapsule.ts               # Recording & event management

lib/
├── emotion-themes.ts               # Theme color definitions
└── collageGenerator.ts             # PNG collage generation

types/
├── game.ts                         # Challenge game types
└── timeCapsule.ts                  # Time capsule types
```

### Modified Files

```
app/
├── layout.tsx                      # Added ThemeProvider wrapper
└── globals.css                     # Added dynamic theme CSS

components/
└── navigation/
    ├── Sidebar.tsx                 # Added Challenge & Time Capsule routes
    └── MobileNav.tsx               # Added mobile navigation items

hooks/
└── useFaceAnalysis.ts              # Connected to theme system
```

---

## 🎮 Usage Guide

### Emoji Challenge Tips

**Maximize Your Score:**
- Practice each emotion beforehand
- Keep your face centered in the frame
- Hold the expression steady before submitting
- Aim for 95%+ accuracy for "Perfect" scores
- Build streaks for bonus multipliers

**Scoring System:**
- Base points: Accuracy × 10 (max 1000)
- Streak bonus: 10% per consecutive perfect match
- Perfect match: ≥ 95% accuracy

### Time Capsule Best Practices

**Optimal Recording:**
- Good lighting for better face detection
- Keep face visible throughout the event
- Longer events = more diverse emotions captured
- Aim for at least 20 moments for meaningful collages

**Event Ideas:**
- Birthday parties
- Team meetings
- Workshops/seminars
- Family gatherings
- Video calls
- Personal vlogs

**Storage:**
- Events are stored in browser localStorage
- Clear data: Browser DevTools → Application → Local Storage
- Each event can capture up to 500 moments

### Collage Layout System

**Adaptive Photo Sizing:**
The collage automatically adjusts photo sizes based on image count:

| Image Count | Photo Size | Grid Example | Canvas Width |
|-------------|------------|--------------|--------------|
| 1-50 images | 180px | 6x9 grid | ~1200px |
| 51-100 images | 140px | 8x13 grid | ~1300px |
| 101-200 images | 120px | 10x20 grid | ~1400px |
| 200+ images | 100px | 12x25 grid | ~1500px |

**Canvas Specifications:**
- **Max Width:** 1920px (Full HD)
- **Header Height:** 150px (with event name, stats, date)
- **Spacing:** Proportional to photo size (8-12px)
- **Background:** Emerald-50 (#f0fdf4)
- **Format:** PNG with 95% quality

**Layout Features:**
- ✅ Fixed width ensures consistent viewing experience
- ✅ Adaptive photo scaling maintains clarity
- ✅ Rounded corners with emerald borders
- ✅ Emotion emoji badges on each photo
- ✅ Smile percentage indicators
- ✅ Timestamps on every moment

---

## 🎨 Theme System Details

### Color Palettes

```typescript
happy: {
  primary: '#F59E0B',      // Warm yellow
  gradient: 'yellow → orange'
}

sad: {
  primary: '#3B82F6',      // Cool blue
  gradient: 'light blue → deep blue'
}

surprised: {
  primary: '#EC4899',      // Vibrant pink
  gradient: 'light pink → hot pink'
}

angry: {
  primary: '#EF4444',      // Red
  gradient: 'light red → dark red'
}

neutral: {
  primary: '#10B981',      // Emerald green (default)
  gradient: 'light green → dark green'
}
```

### CSS Variables

The theme system uses CSS custom properties for instant updates:

```css
--color-primary
--color-secondary
--color-accent
--gradient-primary
--glow-color
--background-tint
```

Apply dynamic styling with utility classes:
- `.theme-transition` - Smooth color transitions
- `.dynamic-bg` - Theme gradient background
- `.dynamic-glow` - Theme-colored glow effect
- `.dynamic-border` - Theme-colored border

---

## 🐛 Troubleshooting

### Camera Not Working

**Issue:** Camera feed not showing
**Solution:**
1. Check browser permissions (must allow camera access)
2. Ensure HTTPS connection (required for camera API)
3. Close other apps using the camera
4. Refresh the page

### Theme Not Changing

**Issue:** Colors stay the same
**Solution:**
1. Verify face is detected (check camera feed)
2. Try different emotions (smile, frown, surprise)
3. Check browser console for errors
4. Refresh the page

### Collage Generation Errors

**Issue:** "Failed to generate collage"
**Solution:**
1. Ensure you have captured moments (at least 1 moment required)
2. Check browser console for Canvas API errors
3. Verify images were properly captured during recording
4. Try with a smaller number of moments if memory issues occur
5. Ensure browser supports HTML5 Canvas API

### Challenge Not Starting

**Issue:** Game doesn't begin after clicking "Start"
**Solution:**
1. Ensure face is detected in camera feed
2. Check browser console for errors
3. Verify localStorage is enabled
4. Try incognito/private browsing mode

---

## 📊 Data Storage

### Local Storage Keys

```
emojiChallengeHighScore    # Highest game score
timeCapsuleEvents          # Array of recorded events
```

### Clear All Data

```javascript
// In browser console:
localStorage.clear();
location.reload();
```

---

## 🔧 Advanced Configuration

### Modify Capture Interval (Time Capsule)

Edit `hooks/useTimeCapsule.ts`:

```typescript
const DEFAULT_CAPTURE_INTERVAL = 5000; // Change to desired milliseconds
```

### Modify Challenge Duration

Edit `hooks/useEmojiChallenge.ts`:

```typescript
const CHALLENGE_DURATION = 10000; // Change to desired milliseconds
const TOTAL_ROUNDS = 5;           // Change number of rounds
```

### Customize Theme Colors

Edit `lib/emotion-themes.ts`:

```typescript
export const emotionThemes = {
  happy: {
    primary: '#YOUR_COLOR', // Customize colors
    // ... other properties
  },
  // ... other emotions
};
```

---

## 🎯 Future Enhancements

Potential features for future development:

1. **Multiplayer Challenge** - Compete with friends in real-time
2. **Social Sharing** - Share collages on social media
3. **Advanced Collage Editor** - Add filters, text overlays, custom layouts
4. **Cloud Storage** - Sync events across devices
5. **Custom Emotion Training** - Train AI on personal emotion expressions
6. **Analytics Dashboard** - Detailed emotion trends over time

---

## 📝 Library Functions

### Collage Generator

**Function:** `generateCollage(event: TimeCapsule, options?: CollageOptions): Promise<string>`

Generate a PNG collage from captured moments (client-side).

**Parameters:**
```typescript
interface CollageOptions {
  photoSize?: number;          // Manual override (auto-calculated if not set)
  spacing?: number;            // Auto-calculated based on photo size
  backgroundColor?: string;    // Default: '#f0fdf4' (emerald-50)
  headerHeight?: number;       // Default: 150px
  maxColumns?: number;         // Default: 8
  maxCanvasWidth?: number;     // Default: 1920px (Full HD)
  minPhotoSize?: number;       // Default: 100px
  adaptiveScaling?: boolean;   // Default: true
}
```

**Returns:** Promise<string> - Base64-encoded PNG data URL

**Adaptive Sizing Logic:**
- 1-50 moments: 180px photos
- 51-100 moments: 140px photos
- 101-200 moments: 120px photos
- 200+ moments: 100px photos (minimum)

**Function:** `downloadCollage(dataUrl: string, eventName: string): void`

Download collage as PNG file.

---

## 💡 Tips & Tricks

1. **Better Face Detection:**
   - Use good lighting
   - Position face centered in frame
   - Avoid rapid movements
   - Remove glasses for better accuracy

2. **Higher Challenge Scores:**
   - Practice emotions before playing
   - Use a mirror to check expressions
   - Stay consistent throughout the round

3. **Better Collages:**
   - Capture longer events (5+ minutes) for more moments
   - Show diverse emotions for varied collage
   - Ensure face is visible throughout for quality captures

4. **Performance:**
   - Close unused browser tabs
   - Use Chrome/Edge for best performance
   - Disable browser extensions if lagging

---

## 🙏 Credits

- **Face Detection:** face-api.js
- **Collage Generation:** HTML5 Canvas API
- **UI Animations:** Framer Motion
- **Icons:** Lucide React
- **Confetti:** canvas-confetti

---

## 📄 License

Same license as the main FacePulse application.

---

**🎉 Enjoy your new advanced emotion features!**

For issues or questions, please refer to the main project documentation.

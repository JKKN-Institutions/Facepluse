# Facial Analysis Application

A professional, production-grade facial analysis demo application built with Next.js 15 and OpenAI Vision API. Features real-time emotion detection, smile meter, age estimation, and interactive leaderboards with premium UI/UX.

## Features

- 🎥 **Real-time Video Analysis** - Continuous facial analysis every 2 seconds
- 😊 **Smile Meter** - Animated circular progress showing smile percentage
- 🎭 **Emotion Detection** - Recognizes happy, sad, neutral, surprised, and angry emotions
- 🎂 **Age Estimation** - Estimates age with ±3 year accuracy
- 👁️ **Activity Monitoring** - Tracks blinks and head pose
- 🏆 **Leaderboard** - Top smiles ranking with real-time updates
- 📸 **Screenshot Capture** - Download analysis snapshots
- 🎊 **Confetti Celebration** - Triggers at 90% smile
- 🔒 **Privacy First** - No video storage, secure processing

## Tech Stack

- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **AI**: OpenAI GPT-4 Vision API
- **Animations**: Framer Motion
- **UI Components**: Lucide React icons, Sonner toasts
- **Fonts**: Inter (body), Space Grotesk (headings)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd rose
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=sk-your-actual-key-here
```

### Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Important**: Use HTTPS or localhost for camera access. Some browsers block camera on HTTP.

### Production

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Project Structure

```
rose/
├── app/
│   ├── api/
│   │   ├── analyze-face/     # OpenAI Vision API integration
│   │   └── leaderboard/      # Leaderboard CRUD operations
│   ├── layout.tsx            # Root layout with fonts & toaster
│   ├── page.tsx              # Main dashboard
│   └── globals.css           # Global styles & animations
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   └── Navbar.tsx
│   ├── ui/                   # Reusable UI components
│   │   ├── GlassCard.tsx
│   │   ├── ProgressRing.tsx
│   │   ├── AnimatedNumber.tsx
│   │   ├── Button.tsx
│   │   ├── StatusBadge.tsx
│   │   └── LoadingSkeleton.tsx
│   ├── Camera.tsx            # Webcam feed & face detection
│   ├── MetricsPanel.tsx      # 4 metric cards
│   ├── Leaderboard.tsx       # Top smiles ranking
│   ├── ScreenshotButton.tsx  # Floating action button
│   ├── Confetti.tsx          # Celebration effects
│   └── PrivacyNotice.tsx     # Privacy banner
├── hooks/
│   ├── useCamera.ts          # Webcam management
│   ├── useFaceAnalysis.ts    # API calls & state
│   └── useLeaderboard.ts     # Leaderboard logic
├── lib/
│   ├── theme.ts              # Design system colors
│   ├── utils.ts              # Helper functions
│   ├── openai.ts             # OpenAI client
│   └── imageProcessing.ts    # Image utilities
└── types/
    ├── face.ts               # Face analysis types
    └── api.ts                # API response types
```

## Key Features Explained

### Design System

- **Glass-morphism Cards**: `backdrop-blur` with semi-transparent backgrounds
- **Color Palette**: Purple/pink gradients with accent colors
- **Custom Animations**: Shimmer, gradient-shift, float effects
- **Responsive**: Mobile-first with breakpoints at 768px, 1024px, 1536px

### API Routes

**`/api/analyze-face`** (POST)
- Accepts base64 image
- Calls OpenAI GPT-4 Vision
- Returns JSON with smile %, emotion, age, etc.

**`/api/leaderboard`** (GET/POST/DELETE)
- In-memory storage (replace with DB for production)
- Keeps top 100 scores
- Auto-sorts by score

### Performance Optimizations

- ✅ JPEG compression (0.8 quality)
- ✅ 2-second debounce on API calls
- ✅ Lazy loading for heavy components
- ✅ Memoized calculations
- ✅ Proper React keys for lists

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `NEXT_PUBLIC_APP_URL` | No | App URL (default: localhost:3000) |
| `NEXT_PUBLIC_ENABLE_SOUND` | No | Enable confetti sound (default: true) |
| `NEXT_PUBLIC_ENABLE_LEADERBOARD` | No | Show leaderboard (default: true) |

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Note**: Requires getUserMedia API support for camera access.

## Troubleshooting

### Camera not working
- Check browser permissions
- Use HTTPS or localhost
- Verify camera is not in use by another app

### API errors
- Verify `OPENAI_API_KEY` is set correctly
- Check API quota/limits on OpenAI dashboard
- Review browser console for detailed errors

### Slow analysis
- Check internet connection
- OpenAI API can take 1-3 seconds per request
- Consider increasing debounce interval (default: 2s)

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import to Vercel
3. Add `OPENAI_API_KEY` environment variable
4. Deploy

### Other Platforms

Ensure platform supports:
- Node.js 18+
- Server-side API routes
- Environment variables

## License

MIT

## Credits

Built with [Next.js](https://nextjs.org), [OpenAI](https://openai.com), and [Tailwind CSS](https://tailwindcss.com).

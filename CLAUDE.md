Here's a complete **`.md` file** you can save and use with Claude Code:

---

# **FACIAL-ANALYSIS-APP.md**

Save this as `PROJECT_PROMPT.md` in your project root:

```markdown
# Real-Time Facial Analysis Application - Development Specification

## Project Overview
Build a professional, production-grade facial analysis demo application using Next.js 14+ and OpenAI Vision API. The application should look like a premium startup product with world-class UI/UX.

---

## Tech Stack

### Core Framework
- **Next.js 14+** with App Router
- **TypeScript** (strict mode)
- **Tailwind CSS** for styling
- **React 18+**

### Key Libraries
```bash
npm install openai canvas-confetti framer-motion lucide-react sonner recharts react-use clsx tailwind-merge
npm install -D @types/canvas-confetti
```

### API Integration
- **OpenAI GPT-4 Vision API** for facial analysis
- **REST API** routes for backend logic

---

## Design System

### Color Palette

```typescript
// lib/theme.ts
export const theme = {
  colors: {
    primary: {
      purple: '#8B5CF6',
      blue: '#3B82F6',
      pink: '#EC4899',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    accent: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      neutral: '#6B7280',
    },
    background: {
      dark: '#0F172A',
      darker: '#1E293B',
      card: 'rgba(255, 255, 255, 0.05)',
      cardHover: 'rgba(255, 255, 255, 0.08)',
    },
  },
}
```

### Typography
- **Headings**: Space Grotesk (700, 600)
- **Body**: Inter (400, 500, 600)
- **Sizes**: Use responsive clamp() values

### Spacing
- Follow 4px/8px grid system
- Standard padding: 16px, 24px, 32px, 48px
- Consistent gaps: 16px, 24px, 32px

### Glass-Morphism Style
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

/* Hover State */
background: rgba(255, 255, 255, 0.08);
transform: translateY(-4px);
box-shadow: 0 12px 48px rgba(139, 92, 246, 0.3);
```

---

## Application Structure

### File Organization
```
app/
├── api/
│   ├── analyze-face/
│   │   └── route.ts          # OpenAI Vision API integration
│   └── leaderboard/
│       └── route.ts          # Leaderboard data management
├── page.tsx                  # Main dashboard
├── layout.tsx                # Root layout with fonts
└── globals.css               # Global styles + animations

components/
├── layout/
│   ├── DashboardLayout.tsx   # Main layout wrapper
│   └── Navbar.tsx            # Top navigation bar
├── Camera.tsx                # Webcam feed + face detection
├── MetricsPanel.tsx          # All metric cards
├── Leaderboard.tsx           # Top smiles ranking
├── ScreenshotButton.tsx      # FAB for screenshots
├── Confetti.tsx              # Celebration effect
├── PrivacyNotice.tsx         # Privacy banner
└── ui/
    ├── ProgressRing.tsx      # Circular progress component
    ├── GlassCard.tsx         # Reusable glass card
    ├── LoadingSkeleton.tsx   # Loading states
    ├── StatusBadge.tsx       # Status indicators
    ├── AnimatedNumber.tsx    # Number count-up animation
    └── Button.tsx            # Button component

lib/
├── openai.ts                 # OpenAI client configuration
├── imageProcessing.ts        # Image conversion utilities
├── theme.ts                  # Design system constants
└── utils.ts                  # Helper functions

hooks/
├── useCamera.ts              # Webcam management
├── useFaceAnalysis.ts        # API calls + state
└── useLeaderboard.ts         # Leaderboard logic

types/
├── face.ts                   # Face analysis types
└── api.ts                    # API response types

public/
└── sounds/
    └── whoosh.mp3            # Confetti sound effect
```

---

## Component Specifications

### 1. DashboardLayout Component

**File**: `components/layout/DashboardLayout.tsx`

**Features**:
- Full-screen dark gradient background (#0F172A → #1E293B)
- Animated gradient mesh (subtle CSS animation)
- Top navbar with app branding
- Responsive padding and safe areas
- Bottom gradient fade overlay

**Styling**:
```tsx
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
  {/* Animated background mesh */}
  <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 animate-pulse" />
  
  {/* Content */}
  <div className="relative z-10">
    <Navbar />
    {children}
  </div>
</div>
```

---

### 2. Camera Component

**File**: `components/Camera.tsx`

**Features**:
- Access webcam via `navigator.mediaDevices.getUserMedia()`
- Capture frame every 2 seconds, convert to base64
- Send to `/api/analyze-face`
- Display video with face detection overlay
- Animated green rectangle around detected face
- Corner brackets for modern look

**Visual Requirements**:
```tsx
// Container
<div className="relative max-w-4xl mx-auto aspect-video rounded-3xl overflow-hidden border-2 border-purple-500/30 shadow-2xl">
  
  {/* Video */}
  <video className="w-full h-full object-cover" />
  
  {/* Face Detection Overlay */}
  <canvas className="absolute inset-0 pointer-events-none" />
  
  {/* Detection Box Style */}
  {faceDetected && (
    <div className="absolute border-2 border-green-500 animate-pulse">
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400" />
      {/* Repeat for 4 corners */}
    </div>
  )}
</div>
```

**States**:
- **Loading**: Shimmer skeleton with spinning gradient border
- **Active**: Smooth video feed
- **Error**: Friendly icon + retry button
- **No Face**: Prompt message "Center your face"

**Animations**:
- Frame fade-in: `transition-opacity duration-500`
- Face box: `animate-pulse`
- Analyzing indicator: Glowing border effect

---

### 3. MetricsPanel Component

**File**: `components/MetricsPanel.tsx`

**Layout**: Grid wrapping the video feed
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
  <SmileMeterCard />
  <EmotionCard />
  <AgeEstimatorCard />
  <ActivityCard />
</div>
```

#### Card 1: Smile Meter
```tsx
<GlassCard>
  <ProgressRing 
    value={smilePercentage} 
    size={120}
    strokeWidth={12}
    gradient="purple-pink"
  >
    <AnimatedNumber 
      value={smilePercentage}
      className="text-5xl font-bold"
      suffix="%"
    />
  </ProgressRing>
  
  <div className="text-center mt-4">
    <span className="text-6xl">
      {smilePercentage > 70 ? '😊' : smilePercentage > 30 ? '😐' : '😔'}
    </span>
    <p className="text-sm text-gray-400 mt-2">Smile Index</p>
  </div>
</GlassCard>
```

**Animations**:
- Ring: Animate arc drawing (0 → smilePercentage)
- Number: Count-up effect with easing
- Emoji: Bounce on change

#### Card 2: Emotion Detector
```tsx
<GlassCard className="text-center">
  <motion.div
    animate={{ scale: [1, 1.2, 1] }}
    transition={{ duration: 0.5 }}
  >
    <span className="text-8xl">{emotionEmoji}</span>
  </motion.div>
  
  <h3 className="text-2xl font-semibold mt-4">{emotion}</h3>
  <StatusBadge 
    label={`${confidence}% confident`}
    color="success"
  />
</GlassCard>
```

**Emotion Mapping**:
- Happy: 😊 (green glow)
- Sad: 😢 (blue glow)
- Surprised: 😲 (yellow glow)
- Neutral: 😐 (gray glow)
- Angry: 😠 (red glow)

#### Card 3: Age Estimator
```tsx
<GlassCard className="text-center">
  <div className="text-6xl mb-2">🎂</div>
  <AnimatedNumber 
    value={age}
    className="text-5xl font-bold"
  />
  <p className="text-gray-400 text-sm">± 3 years</p>
  <p className="text-xs text-gray-500 mt-1">Estimated Age</p>
</GlassCard>
```

#### Card 4: Activity Monitor
```tsx
<GlassCard>
  <div className="space-y-4">
    {/* Blink Counter */}
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">Blinks</span>
      <span className="text-2xl font-bold">{blinkCount}</span>
    </div>
    
    {/* Head Pose */}
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">Head Pose</span>
      <div className="flex gap-1">
        <div className={headPose === 'left' ? 'w-2 h-2 bg-green-500 rounded-full' : 'w-2 h-2 bg-gray-600 rounded-full'} />
        <div className={headPose === 'center' ? 'w-2 h-2 bg-green-500 rounded-full' : 'w-2 h-2 bg-gray-600 rounded-full'} />
        <div className={headPose === 'right' ? 'w-2 h-2 bg-green-500 rounded-full' : 'w-2 h-2 bg-gray-600 rounded-full'} />
      </div>
    </div>
    
    {/* Last Updated */}
    <p className="text-xs text-gray-500">
      Updated {timeSinceUpdate}s ago
    </p>
  </div>
</GlassCard>
```

---

### 4. Leaderboard Component

**File**: `components/Leaderboard.tsx`

**Design**:
```tsx
<GlassCard className="w-80 fixed right-8 top-24 max-h-[600px] overflow-hidden">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-bold flex items-center gap-2">
      🏆 Top Smiles
    </h3>
    <StatusBadge label="LIVE" color="success" pulse />
  </div>
  
  {/* List */}
  <div className="space-y-3 overflow-y-auto max-h-[500px]">
    {leaderboard.map((entry, index) => (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        key={entry.id}
        className={cn(
          "p-3 rounded-lg border border-white/10",
          entry.isCurrentUser && "bg-purple-500/20 border-purple-500/50"
        )}
      >
        {/* Rank Badge */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
          index === 0 && "bg-yellow-500 text-yellow-900",
          index === 1 && "bg-gray-400 text-gray-900",
          index === 2 && "bg-orange-600 text-orange-100",
          index > 2 && "bg-gray-700 text-gray-300"
        )}>
          {index + 1}
        </div>
        
        {/* Score Bar */}
        <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${entry.score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        
        {/* Details */}
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{entry.score}%</span>
          <span>{formatTimestamp(entry.timestamp)}</span>
        </div>
      </motion.div>
    ))}
  </div>
</GlassCard>
```

**Features**:
- Auto-refresh every 5 seconds
- Highlight current user entry
- Smooth entry animations
- Rank badges (gold/silver/bronze)
- Responsive: bottom sheet on mobile

---

### 5. Screenshot Button

**File**: `components/ScreenshotButton.tsx`

**Design**:
```tsx
<motion.button
  whileHover={{ scale: 1.1 }}
  whileTap={{ scale: 0.95 }}
  className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg flex items-center justify-center"
  onClick={handleScreenshot}
>
  {/* Pulsing Ring */}
  <span className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-75" />
  
  {/* Icon */}
  <Camera className="w-6 h-6 text-white relative z-10" />
</motion.button>
```

**Functionality**:
1. Capture current video frame
2. Overlay metrics as text/graphics
3. Convert canvas to PNG
4. Download file: `smile-analysis-{timestamp}.png`
5. Show success toast

**States**:
- Idle: Gentle pulse
- Hover: Scale + brighter glow
- Capturing: Spin animation
- Success: Checkmark + green color (1s)

---

### 6. Confetti Component

**File**: `components/Confetti.tsx`

**Implementation**:
```tsx
import confetti from 'canvas-confetti';

export function triggerConfetti() {
  confetti({
    particleCount: 200,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#8B5CF6', '#EC4899', '#3B82F6', '#F59E0B'],
    disableForReducedMotion: true,
  });
  
  // Optional: Play sound
  const audio = new Audio('/sounds/whoosh.mp3');
  audio.play();
}
```

**Trigger**: When smile >= 90% (once per session)

---

### 7. Reusable UI Components

#### ProgressRing
**File**: `components/ui/ProgressRing.tsx`
```tsx
interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  gradient?: 'purple-pink' | 'blue-green';
  children?: React.ReactNode;
}

// Circular SVG with animated arc
```

#### GlassCard
**File**: `components/ui/GlassCard.tsx`
```tsx
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

// Reusable glass-morphism container with hover effects
```

#### AnimatedNumber
**File**: `components/ui/AnimatedNumber.tsx`
```tsx
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

// Count-up animation using framer-motion
```

---

## Backend API Routes

### 1. Face Analysis API

**File**: `app/api/analyze-face/route.ts`

```typescript
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { image } = await request.json(); // base64 image
    
    // Rate limiting check
    // ... implement rate limiting logic
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this face and return ONLY a JSON object with these exact fields:
              {
                "smile_percentage": number (0-100),
                "emotion": string ("happy"|"sad"|"neutral"|"surprised"|"angry"),
                "emotion_confidence": number (0-100),
                "age_estimate": number,
                "blink_detected": boolean,
                "head_pose": string ("left"|"center"|"right"),
                "face_detected": boolean
              }`
            },
            {
              type: "image_url",
              image_url: { url: image }
            }
          ]
        }
      ],
      max_tokens: 300,
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze face' },
      { status: 500 }
    );
  }
}
```

**Features**:
- Rate limiting: Max 30 requests/min per IP
- Response caching (1 second)
- Error handling with proper status codes
- Logging for debugging

---

### 2. Leaderboard API

**File**: `app/api/leaderboard/route.ts`

```typescript
import { NextResponse } from 'next/server';

// In-memory store (replace with DB in production)
let leaderboard: Array<{
  id: string;
  score: number;
  timestamp: string;
}> = [];

export async function GET() {
  const top10 = leaderboard
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
    
  return NextResponse.json(top10);
}

export async function POST(request: Request) {
  try {
    const { score } = await request.json();
    
    const entry = {
      id: crypto.randomUUID(),
      score,
      timestamp: new Date().toISOString(),
    };
    
    leaderboard.push(entry);
    
    // Keep only top 100
    if (leaderboard.length > 100) {
      leaderboard = leaderboard
        .sort((a, b) => b.score - a.score)
        .slice(0, 100);
    }
    
    return NextResponse.json(entry);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  leaderboard = [];
  return NextResponse.json({ success: true });
}
```

---

## Hooks Implementation

### useCamera Hook

**File**: `hooks/useCamera.ts`

```typescript
export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    async function initCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: 1280, 
            height: 720,
            facingMode: 'user'
          }
        });
        
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        setLoading(false);
      } catch (err) {
        setError('Camera access denied');
        setLoading(false);
      }
    }
    
    initCamera();
    
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);
  
  return { stream, error, loading, videoRef };
}
```

---

### useFaceAnalysis Hook

**File**: `hooks/useFaceAnalysis.ts`

```typescript
export function useFaceAnalysis(videoRef: RefObject<HTMLVideoElement>) {
  const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!videoRef.current || analyzing) return;
      
      setAnalyzing(true);
      
      try {
        // Capture frame
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(videoRef.current, 0, 0);
        
        const base64Image = canvas.toDataURL('image/jpeg', 0.8);
        
        // Call API
        const response = await fetch('/api/analyze-face', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image }),
        });
        
        const data = await response.json();
        setAnalysis(data);
        
      } catch (error) {
        console.error('Analysis failed:', error);
      } finally {
        setAnalyzing(false);
      }
    }, 2000); // Analyze every 2 seconds
    
    return () => clearInterval(interval);
  }, [videoRef, analyzing]);
  
  return { analysis, analyzing };
}
```

---

## Animations & Transitions

### Framer Motion Variants

```typescript
// Card entrance animation
export const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: [0.4, 0, 0.2, 1] // Custom easing
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.3 }
  }
};

// Number count-up animation
export const numberVariants = {
  initial: { scale: 1.2, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 20 }
  }
};

// Pulse animation for status indicators
export const pulseVariants = {
  initial: { scale: 1, opacity: 1 },
  animate: { 
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    transition: { 
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
```

### Custom CSS Animations

**File**: `app/globals.css`

```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 1000px 100%;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.animate-gradient {
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

---

## Responsive Design Breakpoints

```typescript
// tailwind.config.ts
export default {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
}
```

**Layout Adjustments**:
- **Mobile** (< 768px): Stack all metrics vertically, bottom nav
- **Tablet** (768-1024px): 2-column metric grid
- **Desktop** (> 1024px): Metrics around video, sidebar leaderboard
- **Ultra-wide** (> 1536px): Max-width container (1400px)

---

## Performance Optimizations

### 1. Image Processing
- Use JPEG compression (quality: 0.8)
- Resize frames before sending to API (max 1280x720)
- Debounce API calls (2-second interval)

### 2. Component Optimization
```typescript
// Lazy load heavy components
const Confetti = dynamic(() => import('@/components/Confetti'), {
  ssr: false,
});

// Memoize expensive calculations
const memoizedMetrics = useMemo(() => 
  calculateMetrics(analysis),
  [analysis]
);
```

### 3. API Optimization
- Implement request caching (SWR or React Query)
- Rate limiting on backend
- Response compression

---

## Error Handling

### User-Facing Errors

```typescript
// Toast notifications (using sonner)
import { toast } from 'sonner';

// Success
toast.success('Screenshot saved!');

// Error
toast.error('Failed to analyze face', {
  description: 'Please try again in a moment',
  action: {
    label: 'Retry',
    onClick: () => retryAnalysis(),
  },
});

// Loading
toast.loading('Analyzing face...');
```

### Error Boundaries

```typescript
// components/ErrorBoundary.tsx
'use client';

export class ErrorBoundary extends Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard className="text-center p-8">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <Button onClick={() => window.location.reload()}>
              Reload App
            </Button>
          </GlassCard>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

---

## Environment Variables

**File**: `.env.local`

```bash
# OpenAI API Key (Required)
OPENAI_API_KEY=sk-your-key-here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Facial Analysis Demo"

# Rate Limiting (Optional)
RATE_LIMIT_MAX_REQUESTS=30
RATE_LIMIT_WINDOW_MS=60000

# Feature Flags (Optional)
NEXT_PUBLIC_ENABLE_SOUND=true
NEXT_PUBLIC_ENABLE_LEADERBOARD=true
```

---

## Testing Checklist

### Functionality
- [ ] Camera access works on first load
- [ ] Face detection overlay appears
- [ ] Metrics update every 2 seconds
- [ ] Screenshot captures and downloads
- [ ] Confetti triggers at 90% smile
- [ ] Leaderboard updates in real-time
- [ ] Privacy notice dismisses and remembers

### UI/UX
- [ ] All animations are smooth (60fps)
- [ ] Glass-morphism cards render correctly
- [ ] Hover effects work on all interactive elements
- [ ] Loading skeletons appear during data fetch
- [ ] Error states display friendly messages
- [ ] Mobile responsive on all screen sizes

### Performance
- [ ] Initial load < 3 seconds
- [ ] API responses < 2 seconds
- [ ] No memory leaks (test for 5+ minutes)
- [ ] Smooth camera feed (30fps minimum)

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces state changes
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA

---

## Implementation Timeline

### Phase 1: Foundation (Day 1)
1. ✅ Set up design system (theme, tailwind config)
2. ✅ Create DashboardLayout with animated background
3. ✅ Build all UI components (GlassCard, ProgressRing, etc.)
4. ✅ Set up fonts and global styles

### Phase 2: Core Features (Day 2)
1. ✅ Implement Camera component with permissions
2. ✅ Create OpenAI API route
3. ✅ Build useFaceAnalysis hook
4. ✅ Connect metrics display

### Phase 3: Advanced Features (Day 3)
1. ✅ Build Leaderboard component
2. ✅ Implement Screenshot functionality
3. ✅ Add Confetti effect
4. ✅ Create Privacy Notice

### Phase 4: Polish (Day 4)
1. ✅ Add all animations and transitions
2. ✅ Implement error handling
3. ✅ Optimize performance
4. ✅ Test responsive design
5. ✅ Final QA and bug fixes

---

## Success Criteria

This application should:
- ✨ **Look like a $100K product** - Premium UI with smooth animations
- 🚀 **Perform flawlessly** - 60fps animations, fast API responses
- 📱 **Work everywhere** - Responsive from mobile to 4K displays
- 🎯 **Engage users** - Fun interactions, gamification, celebrations
- 🔒 **Handle errors gracefully** - No crashes, friendly error messages

---

## Final Notes

- Every component should have hover effects
- All state changes should be animated
- Loading states must be beautiful, not boring
- Error messages should be helpful, not technical
- The app should feel premium from the first second

**MAKE EVERY PIXEL COUNT. THIS IS A SHOWCASE PRODUCT.**

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your OPENAI_API_KEY

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

*End of Specification*
```

---

## **How to Use This File:**

1. **Save it** as `PROJECT_PROMPT.md` in your project root

2. **Use with Claude Code**:
```bash
claude-code "Read PROJECT_PROMPT.md and implement the entire application following all specifications exactly"
```

3. **Or use in chunks**:
```bash
claude-code "Read PROJECT_PROMPT.md and start with Phase 1: Foundation"
```

This comprehensive spec ensures Claude Code builds exactly what you need! 🎯

Updated UI Specification - Green & White Theme

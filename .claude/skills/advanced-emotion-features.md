# Advanced Emotion Features Skill

## Overview
This skill guides the implementation of three advanced features for the Facial Analysis Application:
1. **Mood-Based Dynamic Color Themes** - UI colors shift based on detected emotions
2. **Emoji Match Challenge** - Gamified emotion mimicry with scoring
3. **Time Capsule Emotions** - Event emotion capture with AI-generated video montages

---

## Feature 1: Mood-Based Dynamic Color Themes

### Implementation Strategy

#### Color Theme Mapping
```typescript
// lib/emotion-themes.ts
export const emotionThemes = {
  happy: {
    primary: '#F59E0B', // Warm yellow
    secondary: '#FCD34D',
    accent: '#FBBF24',
    gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
    glow: 'rgba(245, 158, 11, 0.3)',
    background: 'rgba(252, 211, 77, 0.05)',
  },
  sad: {
    primary: '#3B82F6', // Cool blue
    secondary: '#60A5FA',
    accent: '#2563EB',
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #1E40AF 100%)',
    glow: 'rgba(59, 130, 246, 0.3)',
    background: 'rgba(96, 165, 250, 0.05)',
  },
  surprised: {
    primary: '#EC4899', // Vibrant pink
    secondary: '#F472B6',
    accent: '#DB2777',
    gradient: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
    glow: 'rgba(236, 72, 153, 0.3)',
    background: 'rgba(244, 114, 182, 0.05)',
  },
  angry: {
    primary: '#EF4444', // Red
    secondary: '#F87171',
    accent: '#DC2626',
    gradient: 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)',
    glow: 'rgba(239, 68, 68, 0.3)',
    background: 'rgba(248, 113, 113, 0.05)',
  },
  neutral: {
    primary: '#8B5CF6', // Purple (default)
    secondary: '#A78BFA',
    accent: '#7C3AED',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%)',
    glow: 'rgba(139, 92, 246, 0.3)',
    background: 'rgba(167, 139, 250, 0.05)',
  },
};

export type Emotion = keyof typeof emotionThemes;
```

#### Theme Context Provider
```typescript
// contexts/ThemeContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { Emotion, emotionThemes } from '@/lib/emotion-themes';

interface ThemeContextType {
  currentTheme: typeof emotionThemes.neutral;
  emotion: Emotion;
  setEmotion: (emotion: Emotion) => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [currentTheme, setCurrentTheme] = useState(emotionThemes.neutral);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);

    // Smooth transition delay
    const timer = setTimeout(() => {
      setCurrentTheme(emotionThemes[emotion]);
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [emotion]);

  // Apply CSS variables for theme
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', currentTheme.primary);
    root.style.setProperty('--color-secondary', currentTheme.secondary);
    root.style.setProperty('--color-accent', currentTheme.accent);
    root.style.setProperty('--gradient-primary', currentTheme.gradient);
    root.style.setProperty('--glow-color', currentTheme.glow);
    root.style.setProperty('--background-tint', currentTheme.background);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, emotion, setEmotion, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

#### Integration with Face Analysis
```typescript
// hooks/useFaceAnalysis.ts (update)
import { useTheme } from '@/contexts/ThemeContext';

export function useFaceAnalysis(videoRef: RefObject<HTMLVideoElement>) {
  const { setEmotion } = useTheme();
  const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);

  useEffect(() => {
    // ... existing code ...

    // Update theme when emotion changes
    if (data.emotion) {
      setEmotion(data.emotion as Emotion);
    }

  }, [/* dependencies */]);

  return { analysis, analyzing };
}
```

#### Global CSS Updates
```css
/* app/globals.css */
:root {
  --color-primary: #8B5CF6;
  --color-secondary: #A78BFA;
  --color-accent: #7C3AED;
  --gradient-primary: linear-gradient(135deg, #A78BFA 0%, #7C3AED 100%);
  --glow-color: rgba(139, 92, 246, 0.3);
  --background-tint: rgba(167, 139, 250, 0.05);

  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-transition {
  transition: background-color 0.8s ease,
              border-color 0.8s ease,
              box-shadow 0.8s ease,
              color 0.8s ease;
}

.dynamic-bg {
  background: var(--gradient-primary);
}

.dynamic-glow {
  box-shadow: 0 0 40px var(--glow-color);
}

.dynamic-border {
  border-color: var(--color-primary);
}
```

---

## Feature 2: Emoji Match Challenge

### Game Flow
1. Display random target emotion (emoji + label)
2. User has 10 seconds to mimic the emotion
3. AI analyzes face and scores accuracy (0-100%)
4. Award points and show feedback
5. Track high scores and streaks

### Implementation

#### Game State Management
```typescript
// types/game.ts
export interface Challenge {
  id: string;
  targetEmotion: Emotion;
  startTime: number;
  duration: number;
  completed: boolean;
}

export interface GameState {
  isPlaying: boolean;
  currentChallenge: Challenge | null;
  score: number;
  streak: number;
  highScore: number;
  challenges: Challenge[];
  round: number;
}

export interface ChallengeResult {
  accuracy: number;
  pointsEarned: number;
  feedback: string;
  perfectMatch: boolean;
}
```

#### Game Hook
```typescript
// hooks/useEmojiChallenge.ts
import { useState, useEffect, useCallback } from 'react';
import { GameState, Challenge, ChallengeResult, Emotion } from '@/types/game';
import confetti from 'canvas-confetti';

const EMOTIONS: Emotion[] = ['happy', 'sad', 'surprised', 'angry', 'neutral'];
const CHALLENGE_DURATION = 10000; // 10 seconds
const POINTS_PER_ACCURACY = 10; // Max 1000 points

export function useEmojiChallenge() {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    currentChallenge: null,
    score: 0,
    streak: 0,
    highScore: 0,
    challenges: [],
    round: 0,
  });

  const [timeRemaining, setTimeRemaining] = useState(0);

  // Generate new challenge
  const startChallenge = useCallback(() => {
    const randomEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];

    const challenge: Challenge = {
      id: crypto.randomUUID(),
      targetEmotion: randomEmotion,
      startTime: Date.now(),
      duration: CHALLENGE_DURATION,
      completed: false,
    };

    setGameState(prev => ({
      ...prev,
      currentChallenge: challenge,
      round: prev.round + 1,
    }));

    setTimeRemaining(CHALLENGE_DURATION);
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setGameState({
      isPlaying: true,
      currentChallenge: null,
      score: 0,
      streak: 0,
      highScore: gameState.highScore,
      challenges: [],
      round: 0,
    });

    setTimeout(() => startChallenge(), 1000);
  }, [startChallenge, gameState.highScore]);

  // Evaluate challenge
  const evaluateChallenge = useCallback((detectedEmotion: Emotion, confidence: number): ChallengeResult => {
    const { currentChallenge } = gameState;

    if (!currentChallenge) {
      return {
        accuracy: 0,
        pointsEarned: 0,
        feedback: 'No active challenge',
        perfectMatch: false,
      };
    }

    const isMatch = detectedEmotion === currentChallenge.targetEmotion;
    const accuracy = isMatch ? confidence : Math.max(0, confidence - 50);
    const pointsEarned = Math.round(accuracy * POINTS_PER_ACCURACY);
    const perfectMatch = accuracy >= 95;

    let feedback = '';
    if (perfectMatch) {
      feedback = '🎯 PERFECT! Absolutely nailed it!';
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });
    } else if (accuracy >= 80) {
      feedback = '🌟 Excellent! Great match!';
    } else if (accuracy >= 60) {
      feedback = '👍 Good job! Close enough!';
    } else if (accuracy >= 40) {
      feedback = '😐 Not quite there... Try again!';
    } else {
      feedback = '😅 Keep practicing!';
    }

    // Update game state
    setGameState(prev => ({
      ...prev,
      score: prev.score + pointsEarned,
      streak: perfectMatch ? prev.streak + 1 : 0,
      highScore: Math.max(prev.highScore, prev.score + pointsEarned),
      currentChallenge: { ...currentChallenge, completed: true },
      challenges: [...prev.challenges, { ...currentChallenge, completed: true }],
    }));

    return { accuracy, pointsEarned, feedback, perfectMatch };
  }, [gameState]);

  // Timer countdown
  useEffect(() => {
    if (!gameState.currentChallenge || gameState.currentChallenge.completed) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - gameState.currentChallenge.startTime;
      const remaining = Math.max(0, CHALLENGE_DURATION - elapsed);

      setTimeRemaining(remaining);

      if (remaining === 0) {
        // Time's up - auto fail
        evaluateChallenge('neutral', 0);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.currentChallenge, evaluateChallenge]);

  const endGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      currentChallenge: null,
    }));
  }, []);

  return {
    gameState,
    timeRemaining,
    startGame,
    startChallenge,
    evaluateChallenge,
    endGame,
  };
}
```

#### Challenge UI Component
```typescript
// components/EmojiChallenge.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEmojiChallenge } from '@/hooks/useEmojiChallenge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Timer, Trophy, Target } from 'lucide-react';

const EMOTION_EMOJIS = {
  happy: '😊',
  sad: '😢',
  surprised: '😲',
  angry: '😠',
  neutral: '😐',
};

export function EmojiChallenge({ currentEmotion, emotionConfidence }: {
  currentEmotion: string;
  emotionConfidence: number;
}) {
  const {
    gameState,
    timeRemaining,
    startGame,
    startChallenge,
    evaluateChallenge,
    endGame,
  } = useEmojiChallenge();

  const handleEvaluate = () => {
    const result = evaluateChallenge(currentEmotion as any, emotionConfidence);

    // Show result toast
    setTimeout(() => {
      if (gameState.round < 5) {
        startChallenge();
      } else {
        endGame();
      }
    }, 3000);
  };

  if (!gameState.isPlaying) {
    return (
      <GlassCard className="text-center p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring' }}
        >
          <span className="text-8xl block mb-4">🎮</span>
          <h2 className="text-3xl font-bold mb-2">Emoji Match Challenge</h2>
          <p className="text-gray-400 mb-6">
            Match random emotions and rack up points!
          </p>

          {gameState.highScore > 0 && (
            <div className="mb-4 flex items-center justify-center gap-2 text-yellow-400">
              <Trophy className="w-5 h-5" />
              <span>High Score: {gameState.highScore}</span>
            </div>
          )}

          <Button
            onClick={startGame}
            className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-3 rounded-full text-lg font-semibold"
          >
            Start Challenge
          </Button>
        </motion.div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-lg font-semibold">Round {gameState.round}/5</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-lg font-semibold">{gameState.score} pts</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-red-400" />
          <span className="text-2xl font-bold">
            {(timeRemaining / 1000).toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Target Emotion */}
      <AnimatePresence mode="wait">
        {gameState.currentChallenge && !gameState.currentChallenge.completed && (
          <motion.div
            key={gameState.currentChallenge.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="text-center mb-8"
          >
            <p className="text-gray-400 mb-4">Match this emotion:</p>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-9xl block"
            >
              {EMOTION_EMOJIS[gameState.currentChallenge.targetEmotion]}
            </motion.span>
            <p className="text-3xl font-bold mt-4 capitalize">
              {gameState.currentChallenge.targetEmotion}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-6">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          initial={{ width: '100%' }}
          animate={{ width: `${(timeRemaining / CHALLENGE_DURATION) * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Evaluate Button */}
      {gameState.currentChallenge && !gameState.currentChallenge.completed && (
        <Button
          onClick={handleEvaluate}
          className="w-full bg-green-600 hover:bg-green-700 py-4 text-lg font-semibold"
        >
          Submit My Expression
        </Button>
      )}

      {/* Streak Indicator */}
      {gameState.streak > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-4 text-center"
        >
          <span className="text-yellow-400 font-bold text-xl">
            🔥 {gameState.streak} Streak!
          </span>
        </motion.div>
      )}
    </GlassCard>
  );
}
```

---

## Feature 3: Time Capsule Emotions

### Overview
Captures emotional moments throughout an event and generates an AI-narrated video montage using Google Gemini.

### Architecture

#### Data Models
```typescript
// types/timeCapsule.ts
export interface EmotionalMoment {
  id: string;
  timestamp: number;
  emotion: Emotion;
  confidence: number;
  imageData: string; // base64
  smilePercentage: number;
  metadata: {
    eventId: string;
    userId?: string;
    location?: string;
  };
}

export interface TimeCapsule {
  id: string;
  eventId: string;
  eventName: string;
  startTime: number;
  endTime: number;
  moments: EmotionalMoment[];
  statistics: {
    totalMoments: number;
    emotionDistribution: Record<Emotion, number>;
    averageSmile: number;
    peakHappiness: EmotionalMoment;
    mostCommonEmotion: Emotion;
  };
  videoUrl?: string;
  narrationScript?: string;
}
```

#### Capture System
```typescript
// hooks/useTimeCapsule.ts
import { useState, useCallback, useRef } from 'react';
import { EmotionalMoment, TimeCapsule } from '@/types/timeCapsule';

export function useTimeCapsule(eventId: string) {
  const [capsule, setCapsule] = useState<TimeCapsule | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const momentsRef = useRef<EmotionalMoment[]>([]);

  // Start recording event
  const startRecording = useCallback((eventName: string) => {
    const newCapsule: TimeCapsule = {
      id: crypto.randomUUID(),
      eventId,
      eventName,
      startTime: Date.now(),
      endTime: 0,
      moments: [],
      statistics: {
        totalMoments: 0,
        emotionDistribution: {
          happy: 0,
          sad: 0,
          surprised: 0,
          angry: 0,
          neutral: 0,
        },
        averageSmile: 0,
        peakHappiness: {} as EmotionalMoment,
        mostCommonEmotion: 'neutral',
      },
    };

    setCapsule(newCapsule);
    setIsRecording(true);
    momentsRef.current = [];
  }, [eventId]);

  // Capture moment
  const captureMoment = useCallback((
    emotion: Emotion,
    confidence: number,
    smilePercentage: number,
    imageData: string
  ) => {
    if (!isRecording || !capsule) return;

    const moment: EmotionalMoment = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      emotion,
      confidence,
      imageData,
      smilePercentage,
      metadata: {
        eventId: capsule.eventId,
      },
    };

    momentsRef.current.push(moment);
  }, [isRecording, capsule]);

  // Stop recording and calculate statistics
  const stopRecording = useCallback(() => {
    if (!capsule) return;

    const moments = momentsRef.current;
    const emotionCounts = moments.reduce((acc, m) => {
      acc[m.emotion] = (acc[m.emotion] || 0) + 1;
      return acc;
    }, {} as Record<Emotion, number>);

    const totalSmile = moments.reduce((sum, m) => sum + m.smilePercentage, 0);
    const peakHappiness = moments.reduce((max, m) =>
      m.smilePercentage > max.smilePercentage ? m : max
    , moments[0] || {} as EmotionalMoment);

    const mostCommonEmotion = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as Emotion || 'neutral';

    const finalCapsule: TimeCapsule = {
      ...capsule,
      endTime: Date.now(),
      moments,
      statistics: {
        totalMoments: moments.length,
        emotionDistribution: emotionCounts,
        averageSmile: moments.length > 0 ? totalSmile / moments.length : 0,
        peakHappiness,
        mostCommonEmotion,
      },
    };

    setCapsule(finalCapsule);
    setIsRecording(false);

    return finalCapsule;
  }, [capsule]);

  // Generate video montage
  const generateMontage = useCallback(async () => {
    if (!capsule || capsule.moments.length === 0) {
      throw new Error('No moments to generate montage');
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/timecapsule/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capsuleId: capsule.id, capsule }),
      });

      const data = await response.json();

      setCapsule(prev => prev ? {
        ...prev,
        videoUrl: data.videoUrl,
        narrationScript: data.narrationScript,
      } : null);

      return data;
    } catch (error) {
      console.error('Failed to generate montage:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [capsule]);

  return {
    capsule,
    isRecording,
    isGenerating,
    startRecording,
    captureMoment,
    stopRecording,
    generateMontage,
  };
}
```

#### API Route for Video Generation
```typescript
// app/api/timecapsule/generate/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TimeCapsule } from '@/types/timeCapsule';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { capsule } = await request.json() as { capsule: TimeCapsule };

    // Generate narration script using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Create a warm, inspiring narration script for an emotional time capsule video.

Event: ${capsule.eventName}
Duration: ${((capsule.endTime - capsule.startTime) / 60000).toFixed(1)} minutes
Total Moments: ${capsule.statistics.totalMoments}
Average Happiness: ${capsule.statistics.averageSmile.toFixed(1)}%
Most Common Emotion: ${capsule.statistics.mostCommonEmotion}

Emotion Distribution:
${Object.entries(capsule.statistics.emotionDistribution)
  .map(([emotion, count]) => `- ${emotion}: ${count} moments`)
  .join('\n')}

Create a 30-second narration script that:
1. Welcomes viewers to this emotional journey
2. Highlights key emotional moments
3. Celebrates the joy and connection shared
4. Ends with an inspiring message

Keep it heartfelt, personal, and uplifting. Use natural, conversational language.
`;

    const result = await model.generateContent(prompt);
    const narrationScript = result.response.text();

    // Generate video using Gemini (video generation - conceptual)
    // Note: Actual video generation would require additional services
    const videoModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    // Select key moments (every 10th frame or top emotional moments)
    const keyMoments = selectKeyMoments(capsule.moments, 10);

    // In production, you would:
    // 1. Upload images to cloud storage
    // 2. Use video editing service (e.g., FFmpeg, cloud service)
    // 3. Generate narration audio (Text-to-Speech)
    // 4. Combine images + audio into video

    // For now, return mock data
    const videoUrl = `/api/timecapsule/${capsule.id}/video`; // Placeholder

    // Save to database (implementation depends on your DB setup)
    // await saveTimeCapsule(capsule, narrationScript, videoUrl);

    return NextResponse.json({
      success: true,
      videoUrl,
      narrationScript,
      keyMoments: keyMoments.length,
    });

  } catch (error) {
    console.error('Montage generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate montage' },
      { status: 500 }
    );
  }
}

function selectKeyMoments(moments: any[], count: number) {
  // Sort by emotion diversity and smile percentage
  const sorted = [...moments].sort((a, b) =>
    b.smilePercentage - a.smilePercentage
  );

  // Take evenly distributed moments
  const step = Math.floor(sorted.length / count);
  return sorted.filter((_, i) => i % step === 0).slice(0, count);
}
```

#### Time Capsule UI Component
```typescript
// components/TimeCapsule.tsx
'use client';

import { motion } from 'framer-motion';
import { useTimeCapsule } from '@/hooks/useTimeCapsule';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Play, Square, Film, Download } from 'lucide-react';
import { toast } from 'sonner';

export function TimeCapsule({ eventId, eventName }: {
  eventId: string;
  eventName: string;
}) {
  const {
    capsule,
    isRecording,
    isGenerating,
    startRecording,
    stopRecording,
    generateMontage,
  } = useTimeCapsule(eventId);

  const handleStart = () => {
    startRecording(eventName);
    toast.success('Time Capsule recording started!');
  };

  const handleStop = () => {
    const finalCapsule = stopRecording();
    toast.success(`Captured ${finalCapsule?.moments.length} emotional moments!`);
  };

  const handleGenerate = async () => {
    try {
      toast.loading('Generating your emotional montage...');
      await generateMontage();
      toast.success('Montage created! Ready to view.');
    } catch (error) {
      toast.error('Failed to generate montage');
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Film className="w-6 h-6 text-purple-400" />
            Time Capsule
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Capture emotional moments throughout your event
          </p>
        </div>

        {!isRecording && !capsule && (
          <Button
            onClick={handleStart}
            className="bg-gradient-to-r from-purple-500 to-pink-500 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Recording
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={handleStop}
            className="bg-red-600 hover:bg-red-700 flex items-center gap-2 animate-pulse"
          >
            <Square className="w-4 h-4" />
            Stop Recording
          </Button>
        )}
      </div>

      {isRecording && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🎥
          </motion.div>
          <p className="text-xl font-semibold text-red-400">
            Recording in Progress...
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Capturing your emotional journey
          </p>
        </motion.div>
      )}

      {capsule && !isRecording && !capsule.videoUrl && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-3xl font-bold">{capsule.statistics.totalMoments}</p>
              <p className="text-sm text-gray-400">Moments</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-lg">
              <p className="text-3xl font-bold">
                {capsule.statistics.averageSmile.toFixed(0)}%
              </p>
              <p className="text-sm text-gray-400">Avg Happiness</p>
            </div>
          </div>

          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">Emotion Breakdown</p>
            <div className="space-y-2">
              {Object.entries(capsule.statistics.emotionDistribution).map(([emotion, count]) => (
                <div key={emotion} className="flex items-center justify-between">
                  <span className="capitalize">{emotion}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {isGenerating ? 'Generating...' : 'Create Montage Video'}
          </Button>
        </div>
      )}

      {capsule?.videoUrl && (
        <div className="space-y-4">
          <video
            src={capsule.videoUrl}
            controls
            className="w-full rounded-lg"
          />

          <div className="p-4 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-400 mb-2">AI Narration</p>
            <p className="text-sm">{capsule.narrationScript}</p>
          </div>

          <Button
            onClick={() => window.open(capsule.videoUrl, '_blank')}
            className="w-full flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Montage
          </Button>
        </div>
      )}
    </GlassCard>
  );
}
```

---

## Environment Variables Required

```bash
# .env.local
OPENAI_API_KEY=sk-your-openai-key
GOOGLE_AI_API_KEY=your-google-ai-key
```

---

## Integration Checklist

### Phase 1: Mood Themes
- [ ] Create emotion theme definitions
- [ ] Implement ThemeContext provider
- [ ] Add CSS variable system
- [ ] Connect to face analysis
- [ ] Add smooth transitions
- [ ] Test all emotion states

### Phase 2: Emoji Challenge
- [ ] Build game state management
- [ ] Create challenge UI
- [ ] Implement scoring system
- [ ] Add countdown timer
- [ ] Create feedback animations
- [ ] Store high scores

### Phase 3: Time Capsule
- [ ] Build moment capture system
- [ ] Create statistics calculator
- [ ] Implement Gemini API integration
- [ ] Build video generation pipeline
- [ ] Create montage UI
- [ ] Add download functionality

---

## Testing Strategy

### Mood Themes
- Test all 5 emotion transitions
- Verify smooth color changes
- Check CSS variable updates
- Test rapid emotion changes

### Emoji Challenge
- Test complete game flow (5 rounds)
- Verify scoring accuracy
- Test timer functionality
- Check streak calculations
- Test edge cases (no face, timeout)

### Time Capsule
- Test recording start/stop
- Verify moment capture (auto + manual)
- Test statistics calculation
- Verify API calls to Gemini
- Test video generation (may need mocks)
- Check error handling

---

## Performance Considerations

1. **Mood Themes**: Use CSS variables for instant theme switching
2. **Emoji Challenge**: Debounce evaluation calls during gameplay
3. **Time Capsule**:
   - Limit moment capture frequency (e.g., every 5 seconds)
   - Compress images before storing
   - Process video generation in background job

---

## Future Enhancements

- **Multiplayer Emoji Challenge**: Compete with friends in real-time
- **Social Sharing**: Share montage videos on social media
- **Custom Themes**: Let users create their own emotion color palettes
- **Advanced Analytics**: Detailed emotion journey graphs
- **AR Filters**: Add fun filters based on detected emotions

---

*End of Advanced Emotion Features Skill*

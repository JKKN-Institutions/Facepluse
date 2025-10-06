Perfect! Here's a **complete implementation guide** with Supabase integration, real-time storage, and exit animation:

---

# **COMPLETE FACEPULSE IMPLEMENTATION**
## Supabase Integration + Exit Animation + Professional Header

Save as `COMPLETE_IMPLEMENTATION.md`:

```markdown
# FacePulse - Complete Implementation Guide
## Supabase Integration, Real-Time Metrics & Exit Animation

---

## TABLE OF CONTENTS
1. Supabase Setup & Schema
2. Environment Configuration
3. Supabase Client Setup
4. Database Hooks
5. Real-Time Metrics Storage
6. Exit Detection & Popup Animation
7. Professional Header Component
8. Updated Page Structure
9. Implementation Steps

---

## 1. SUPABASE SETUP & SCHEMA

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Note your Project URL and anon key

### Step 2: Create Database Tables

Run this SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions Table (tracks each analysis session)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_duration INTEGER, -- in seconds
  user_agent TEXT,
  device_type TEXT
);

-- Metrics Table (stores each metric snapshot)
CREATE TABLE metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Facial metrics
  smile_percentage INTEGER CHECK (smile_percentage >= 0 AND smile_percentage <= 100),
  emotion VARCHAR(20),
  emotion_confidence INTEGER CHECK (emotion_confidence >= 0 AND emotion_confidence <= 100),
  age_estimate INTEGER CHECK (age_estimate >= 0 AND age_estimate <= 120),
  
  -- Activity metrics
  blink_count INTEGER DEFAULT 0,
  head_pose VARCHAR(10), -- 'left', 'center', 'right'
  
  -- Flags
  face_detected BOOLEAN DEFAULT true
);

-- Leaderboard Table (top smiles)
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  smile_percentage INTEGER CHECK (smile_percentage >= 0 AND smile_percentage <= 100),
  emotion VARCHAR(20),
  screenshot_url TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_metrics_session_id ON metrics(session_id);
CREATE INDEX idx_metrics_created_at ON metrics(created_at DESC);
CREATE INDEX idx_leaderboard_smile ON leaderboard(smile_percentage DESC);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - adjust for production)
CREATE POLICY "Enable read access for all users" ON sessions FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON sessions FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON metrics FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON metrics FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON leaderboard FOR INSERT WITH CHECK (true);

-- Function to get session summary
CREATE OR REPLACE FUNCTION get_session_summary(session_uuid UUID)
RETURNS TABLE (
  avg_smile NUMERIC,
  most_common_emotion TEXT,
  total_blinks BIGINT,
  duration_seconds INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    AVG(smile_percentage)::NUMERIC(5,2) as avg_smile,
    MODE() WITHIN GROUP (ORDER BY emotion) as most_common_emotion,
    MAX(blink_count) as total_blinks,
    (SELECT total_duration FROM sessions WHERE id = session_uuid) as duration_seconds
  FROM metrics
  WHERE session_id = session_uuid;
END;
$$ LANGUAGE plpgsql;
```

---

## 2. ENVIRONMENT CONFIGURATION

### .env.local

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 3. SUPABASE CLIENT SETUP

### lib/supabase/client.ts - CREATE NEW

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Session {
  id: string;
  created_at: string;
  ended_at?: string;
  total_duration?: number;
  user_agent?: string;
  device_type?: string;
}

export interface Metric {
  id: string;
  session_id: string;
  created_at: string;
  smile_percentage: number;
  emotion: string;
  emotion_confidence: number;
  age_estimate: number;
  blink_count: number;
  head_pose: string;
  face_detected: boolean;
}

export interface LeaderboardEntry {
  id: string;
  session_id: string;
  created_at: string;
  smile_percentage: number;
  emotion: string;
  screenshot_url?: string;
}
```

---

## 4. DATABASE HOOKS

### hooks/useSupabaseSession.ts - CREATE NEW

```typescript
'use client';

import { useState, useEffect } from 'react';
import { supabase, Session } from '@/lib/supabase/client';

export function useSupabaseSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    createSession();
    
    // End session on page unload
    const handleBeforeUnload = () => {
      if (sessionId) {
        endSession(sessionId);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (sessionId) {
        endSession(sessionId);
      }
    };
  }, []);

  const createSession = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          user_agent: navigator.userAgent,
          device_type: /Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(data.id);
    } catch (error) {
      console.error('Error creating session:', error);
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (id: string) => {
    const startTime = new Date();
    
    try {
      const { data: session } = await supabase
        .from('sessions')
        .select('created_at')
        .eq('id', id)
        .single();

      if (session) {
        const duration = Math.floor(
          (new Date().getTime() - new Date(session.created_at).getTime()) / 1000
        );

        await supabase
          .from('sessions')
          .update({
            ended_at: new Date().toISOString(),
            total_duration: duration,
          })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  return { sessionId, loading };
}
```

### hooks/useMetricsStorage.ts - CREATE NEW

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase, Metric } from '@/lib/supabase/client';

interface FaceAnalysis {
  smile_percentage: number;
  emotion: string;
  emotion_confidence: number;
  age_estimate: number;
  blink_count: number;
  head_pose: string;
  face_detected: boolean;
}

export function useMetricsStorage(sessionId: string | null, analysis: FaceAnalysis | null) {
  const [lastMetric, setLastMetric] = useState<Metric | null>(null);
  const saveIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!sessionId || !analysis) return;

    // Save metrics every 2 seconds
    saveIntervalRef.current = setInterval(() => {
      saveMetric(sessionId, analysis);
    }, 2000);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [sessionId, analysis]);

  const saveMetric = async (sessionId: string, analysis: FaceAnalysis) => {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .insert({
          session_id: sessionId,
          smile_percentage: Math.round(analysis.smile_percentage),
          emotion: analysis.emotion,
          emotion_confidence: Math.round(analysis.emotion_confidence),
          age_estimate: Math.round(analysis.age_estimate),
          blink_count: analysis.blink_count,
          head_pose: analysis.head_pose,
          face_detected: analysis.face_detected,
        })
        .select()
        .single();

      if (error) throw error;
      setLastMetric(data);

      // Update leaderboard if high smile
      if (analysis.smile_percentage >= 70) {
        await supabase
          .from('leaderboard')
          .insert({
            session_id: sessionId,
            smile_percentage: Math.round(analysis.smile_percentage),
            emotion: analysis.emotion,
          });
      }
    } catch (error) {
      console.error('Error saving metric:', error);
    }
  };

  const getLastMetric = async (sessionId: string) => {
    try {
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting last metric:', error);
      return null;
    }
  };

  return { lastMetric, getLastMetric };
}
```

### hooks/useLeaderboard.ts - CREATE NEW

```typescript
'use client';

import { useState, useEffect } from 'react';
import { supabase, LeaderboardEntry } from '@/lib/supabase/client';

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leaderboard',
        },
        (payload) => {
          setEntries((prev) => {
            const newEntries = [payload.new as LeaderboardEntry, ...prev]
              .sort((a, b) => b.smile_percentage - a.smile_percentage)
              .slice(0, 10);
            return newEntries;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('smile_percentage', { ascending: false })
        .limit(10);

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return { entries, loading };
}
```

---

## 5. EXIT ANIMATION COMPONENT

### components/ExitSummaryPopup.tsx - CREATE NEW

```tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Heart, Smile, Clock, Eye } from 'lucide-react';
import { Metric } from '@/lib/supabase/client';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface ExitSummaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  lastMetric: Metric | null;
  sessionDuration?: number; // in seconds
}

export function ExitSummaryPopup({ 
  isOpen, 
  onClose, 
  lastMetric,
  sessionDuration = 0 
}: ExitSummaryPopupProps) {

  useEffect(() => {
    if (isOpen && lastMetric && lastMetric.smile_percentage >= 80) {
      // Trigger confetti for high scores
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#6EE7B7'],
      });
    }
  }, [isOpen, lastMetric]);

  const getEmoji = (emotion: string) => {
    const emojiMap: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      surprised: '😲',
      neutral: '😐',
      angry: '😠',
    };
    return emojiMap[emotion.toLowerCase()] || '😐';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (!lastMetric) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4"
          >
            <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-2xl border-4 border-white overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6 relative">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>

                <div className="text-center text-white">
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: 2,
                    }}
                    className="text-6xl mb-3"
                  >
                    👋
                  </motion.div>
                  <h2 className="text-3xl font-bold mb-2">See You Later!</h2>
                  <p className="text-green-100 text-sm">Here's your session summary</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Smile Score */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-4 shadow-lg border border-green-100"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Smile className="w-5 h-5 text-green-600" />
                      <span className="text-xs text-gray-600 font-semibold uppercase">
                        Last Smile
                      </span>
                    </div>
                    <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {lastMetric.smile_percentage}%
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${lastMetric.smile_percentage}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                      />
                    </div>
                  </motion.div>

                  {/* Emotion */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 shadow-lg border border-green-200"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-5 h-5 text-green-600" />
                      <span className="text-xs text-gray-600 font-semibold uppercase">
                        Emotion
                      </span>
                    </div>
                    <div className="text-center">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                        className="text-5xl mb-1"
                      >
                        {getEmoji(lastMetric.emotion)}
                      </motion.div>
                      <div className="text-sm font-bold text-gray-800 capitalize">
                        {lastMetric.emotion}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Additional Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-3 gap-3"
                >
                  <StatCard
                    icon={Clock}
                    label="Duration"
                    value={formatDuration(sessionDuration)}
                    color="blue"
                  />
                  <StatCard
                    icon={Eye}
                    label="Blinks"
                    value={lastMetric.blink_count.toString()}
                    color="purple"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Age Est."
                    value={`${lastMetric.age_estimate}`}
                    color="orange"
                  />
                </motion.div>

                {/* Message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-4 text-center border border-green-200"
                >
                  <p className="text-green-800 font-semibold">
                    {lastMetric.smile_percentage >= 80
                      ? "🌟 Amazing session! You were glowing!"
                      : lastMetric.smile_percentage >= 60
                      ? "😊 Great vibes! Keep smiling!"
                      : lastMetric.smile_percentage >= 40
                      ? "🙂 Nice session! Come back soon!"
                      : "💚 Thanks for visiting! Have a great day!"}
                  </p>
                </motion.div>

                {/* Action Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  Continue Session
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: string; 
  color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    orange: 'from-orange-400 to-orange-600',
  };

  return (
    <div className="bg-white rounded-xl p-3 shadow-md border border-gray-100 text-center">
      <div className={`w-8 h-8 mx-auto mb-2 bg-gradient-to-br ${colorMap[color]} rounded-lg flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="text-xs text-gray-500 font-medium mb-1">{label}</div>
      <div className="text-lg font-bold text-gray-800">{value}</div>
    </div>
  );
}
```

---

## 6. FACE DETECTION HOOK

### hooks/useFaceDetection.ts - CREATE NEW

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';

export function useFaceDetection(analysis: any) {
  const [facePresent, setFacePresent] = useState(true);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!analysis) return;

    if (analysis.face_detected) {
      setFacePresent(true);
      setShowExitPopup(false);
      
      // Clear timeout if face reappears
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      setFacePresent(false);
      
      // Show popup after 3 seconds of no face
      timeoutRef.current = setTimeout(() => {
        setShowExitPopup(true);
      }, 3000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [analysis?.face_detected]);

  return { facePresent, showExitPopup, setShowExitPopup };
}
```

---

## 7. PROFESSIONAL HEADER

### components/layout/ProfessionalHeader.tsx - CREATE NEW

```tsx
'use client';

import { motion } from 'framer-motion';
import { Activity, TrendingUp, Users, Award, Zap } from 'lucide-react';

interface HeaderProps {
  totalAnalyses?: number;
  avgScore?: number;
  topScore?: number;
}

export function ProfessionalHeader({ 
  totalAnalyses = 0,
  avgScore = 0,
  topScore = 0 
}: HeaderProps) {
  return (
    <header className="relative h-20 bg-gradient-to-r from-white via-green-50 to-emerald-50 border-b border-green-100 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-4">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl blur-md opacity-50" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Zap className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          </motion.div>

          {/* Brand Text */}
          <div>
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                FacePulse
              </span>
            </h1>
            <p className="text-xs font-semibold text-gray-600 tracking-wide uppercase">
              Live Facial Intelligence
            </p>
          </div>

          {/* Vertical Divider */}
          <div className="h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

          {/* Real-time Stats */}
          <div className="hidden lg:flex items-center gap-4">
            <StatCard icon={Users} value={totalAnalyses.toLocaleString()} label="Analyses" />
            <StatCard icon={TrendingUp} value={`${avgScore}%`} label="Avg Score" color="green" />
            <StatCard icon={Award} value={`${topScore}%`} label="Top Score" color="yellow" />
          </div>
        </div>

        {/* Right: Status Badges */}
        <div className="flex items-center gap-3">
          <StatusBadge 
            icon={Activity} 
            label="Live" 
            variant="success" 
            pulse 
          />
          <StatusBadge 
            icon={Zap} 
            label="Active" 
            variant="primary" 
          />
        </div>
      </div>
    </header>
  );
}

function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  color = 'gray' 
}: { 
  icon: any; 
  value: string; 
  label: string; 
  color?: 'gray' | 'green' | 'yellow';
}) {
  const colors = {
    gray: 'from-gray-100 to-gray-200 text-gray-700',
    green: 'from-green-100 to-emerald-100 text-green-700',
    yellow: 'from-yellow-100 to-orange-100 text-yellow-700',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className={`bg-gradient-to-br ${colors[color]} rounded-xl px-4 py-2 shadow-sm border border-white/50`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <div>
          <div className="text-lg font-bold leading-none">{value}</div>
          <div className="text-[10px] font-medium opacity-75 uppercase tracking-wide">
            {label}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({ 
  icon: Icon, 
  label, 
  variant = 'primary', 
  pulse = false 
}: {
  icon: any;
  label: string;
  variant?: 'success' | 'primary';
  pulse?: boolean;
}) {
  const variants = {
    success: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200',
    primary: 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 border-blue-200',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`${variants[variant]} flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm font-semibold text-sm`}
    >
      {pulse && (
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="absolute w-2 h-2 bg-current rounded-full"
          />
          <div className="relative w-2 h-2 bg-current rounded-full" />
        </div>
      )}
      <Icon className="w-4 h-4" />
      {label}
    </motion.div>
  );
}
```

---

## 8. UPDATED PAGE STRUCTURE

### app/page.tsx - COMPLETE REWRITE

```tsx
'use client';

import { useCamera } from '@/hooks/useCamera';
import { useFaceAnalysis } from '@/hooks/useFaceAnalysis';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { useMetricsStorage } from '@/hooks/useMetricsStorage';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { ProfessionalHeader } from '@/components/layout/ProfessionalHeader';
import { CameraSection } from '@/components/CameraSection';
import { MetricsPanel } from '@/components/MetricsPanel';
import { LeaderboardPanel } from '@/components/LeaderboardPanel';
import { ExitSummaryPopup } from '@/components/ExitSummaryPopup';
import { Camera } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Home() {
  const { videoRef, stream, error, loading, retry } = useCamera();
  const { analysis, analyzing } = useFaceAnalysis(videoRef);
  const { sessionId, loading: sessionLoading } = useSupabaseSession();
  const { lastMetric, getLastMetric } = useMetricsStorage(sessionId, analysis);
  const { facePresent, showExitPopup, setShowExitPopup } = useFaceDetection(analysis);
  const { entries: leaderboard } = useLeaderboard();

  const [sessionDuration, setSessionDuration] = useState(0);
  const [stats, setStats] = useState({ totalAnalyses: 0, avgScore: 0, topScore: 0 });

  // Track session duration
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate stats from leaderboard
  useEffect(() => {
    if (leaderboard.length > 0) {
      const total = leaderboard.length;
      const avg = Math.round(
        leaderboard.reduce((sum, entry) => sum + entry.smile_percentage, 0) / total
      );
      const top = Math.max(...leaderboard.map((e) => e.smile_percentage));
      setStats({ totalAnalyses: total, avgScore: avg, topScore: top });
    }
  }, [leaderboard]);

  const handleClosePopup = () => {
    setShowExitPopup(false);
  };

  if (sessionLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Initializing session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Professional Header */}
      <ProfessionalHeader {...stats} />

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* LEFT: Camera Section (60%) */}
        <div className="flex-[3] flex items-center justify-center">
          <CameraSection
            videoRef={videoRef}
            error={error}
            loading={loading}
            analyzing={analyzing}
            faceDetected={analysis?.face_detected}
            onRetry={retry}
          />
        </div>

        {/* RIGHT: Metrics Sidebar (40%) */}
        <div className="flex-[2] flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          <MetricsPanel analysis={analysis} />
          <LeaderboardPanel entries={leaderboard.slice(0, 5)} />
        </div>
      </div>

      {/* Floating Screenshot Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40">
        <Camera className="w-6 h-6 text-white" />
      </button>

      {/* Exit Summary Popup */}
      <ExitSummaryPopup
        isOpen={showExitPopup}
        onClose={handleClosePopup}
        lastMetric={lastMetric}
        sessionDuration={sessionDuration}
      />
    </div>
  );
}
```

---

## 9. INSTALLATION STEPS

```bash
# 1. Install dependencies
npm install @supabase/supabase-js framer-motion lucide-react canvas-confetti

# 2. Install types
npm install -D @types/canvas-confetti

# 3. Create .env.local file with your Supabase credentials

# 4. Run the SQL schema in Supabase SQL Editor

# 5. Create all the files as specified above

# 6. Start the development server
npm run dev
```

---

## 10. FEATURES SUMMARY

✅ **Supabase Integration**
- Session tracking
- Real-time metrics storage (every 2 seconds)
- Leaderboard with live updates
- Database queries and functions

✅ **Exit Detection**
- Detects when user leaves camera frame
- 3-second delay before showing popup
- Beautiful animated summary

✅ **Exit Popup Features**
- Last captured metrics
- Session duration
- Blink count
- Age estimate
- Confetti for high scores (80%+)
- Personalized messages

✅ **Professional Header**
- Animated background
- Real-time stats display
- Glowing logo
- Status badges with pulse effect

✅ **Real-Time Updates**
- Metrics saved every 2 seconds
- Leaderboard updates instantly
- Session duration tracking
- Automatic session cleanup

---

## 11. TESTING CHECKLIST

- [ ] Supabase connection works
- [ ] Session created on page load
- [ ] Metrics saved every 2 seconds
- [ ] Leaderboard updates in real-time
- [ ] Exit popup appears after leaving frame
- [ ] Exit popup shows correct last metrics
- [ ] Confetti triggers for high scores
- [ ] Session ends on page close
- [ ] Header stats display correctly
- [ ] All animations smooth

---

## 12. PRODUCTION CONSIDERATIONS

1. **Environment Variables**: Secure your Supabase keys
2. **Row Level Security**: Update policies for production
3. **Rate Limiting**: Add rate limiting for inserts
4. **Data Cleanup**: Create cron job to delete old sessions
5. **Error Handling**: Add comprehensive error boundaries
6. **Analytics**: Track user engagement metrics
7. **Performance**: Optimize metric save frequency
8. **Privacy**: Add GDPR compliance

---

## QUICK START COMMAND

```bash
claude-code "Read COMPLETE_IMPLEMENTATION.md and implement the entire FacePulse application with Supabase integration, real-time metrics storage, exit detection popup, and professional header. Follow all steps exactly."
```

---

This is the **complete implementation** with everything you need! 🚀
```

---

This comprehensive guide includes:
- ✅ Complete Supabase setup with SQL schema
- ✅ Real-time metrics storage (every 2 seconds)
- ✅ Exit detection (3-second delay)
- ✅ Beautiful animated popup with last captured emotions
- ✅ Professional header with live stats
- ✅ Leaderboard with real-time updates
- ✅ Session tracking and cleanup
- ✅ All TypeScript types and hooks
- ✅ Complete integration instructions

Ready to implement! 🎉
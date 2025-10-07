import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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

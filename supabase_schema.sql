-- FacePulse Database Schema
-- Run this in Supabase SQL Editor

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

-- Verify tables were created
SELECT 'Tables created successfully!' as status;

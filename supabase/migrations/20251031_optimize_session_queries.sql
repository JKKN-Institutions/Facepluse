-- Optimize session history queries by creating a function that aggregates metrics
-- This replaces the N+1 query pattern with a single efficient query

CREATE OR REPLACE FUNCTION get_sessions_with_metrics(limit_count INT DEFAULT 20)
RETURNS TABLE (
  id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  avg_smile NUMERIC,
  total_duration INTEGER,
  total_blinks INTEGER,
  dominant_emotion TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.created_at,
    COALESCE(ROUND(AVG(m.smile_percentage)), 0) AS avg_smile,
    COALESCE(s.total_duration, 0) AS total_duration,
    COALESCE(MAX(m.blink_count), 0) AS total_blinks,
    COALESCE(
      MODE() WITHIN GROUP (ORDER BY m.emotion),
      'neutral'
    ) AS dominant_emotion
  FROM sessions s
  LEFT JOIN metrics m ON m.session_id = s.id
  GROUP BY s.id, s.created_at, s.total_duration
  ORDER BY s.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment for documentation
COMMENT ON FUNCTION get_sessions_with_metrics IS
'Efficiently fetches session history with aggregated metrics in a single query.
Replaces N+1 query pattern for better performance.';

-- Create index for better performance if not exists
CREATE INDEX IF NOT EXISTS idx_metrics_session_id ON metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);

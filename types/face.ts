export interface FaceAnalysis {
  smile_percentage: number
  emotion: 'happy' | 'sad' | 'neutral' | 'surprised' | 'angry'
  emotion_confidence: number
  age_estimate: number
  blink_detected: boolean
  head_pose: 'left' | 'center' | 'right'
  face_detected: boolean
}

export interface LeaderboardEntry {
  id: string
  score: number
  timestamp: string
  isCurrentUser?: boolean
}

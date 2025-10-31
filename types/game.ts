import { Emotion } from '@/lib/emotion-themes';

export interface Challenge {
  id: string;
  targetEmotion: Emotion;
  startTime: number;
  duration: number;
  completed: boolean;
  score?: number;
  accuracy?: number;
}

export interface GameState {
  isPlaying: boolean;
  currentChallenge: Challenge | null;
  score: number;
  streak: number;
  highScore: number;
  challenges: Challenge[];
  round: number;
  totalRounds: number;
}

export interface ChallengeResult {
  accuracy: number;
  pointsEarned: number;
  feedback: string;
  perfectMatch: boolean;
  bonus: number;
}

export interface LeaderboardEntry {
  id: string;
  userName: string;
  score: number;
  perfectMatches: number;
  roundsPlayed: number;
  averageAccuracy: number;
  createdAt: string;
}

import { Emotion } from '@/lib/emotion-themes';

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
  eventDescription?: string;
  startTime: number;
  endTime: number;
  moments: EmotionalMoment[];
  statistics: TimeCapsuleStatistics;
  collageUrl?: string; // PNG collage of all captured moments
}

export interface TimeCapsuleStatistics {
  totalMoments: number;
  emotionDistribution: Record<Emotion, number>;
  averageSmile: number;
  peakHappiness: EmotionalMoment | null;
  mostCommonEmotion: Emotion;
  duration: number; // in seconds
}

export interface EventConfig {
  id: string;
  name: string;
  description: string;
  captureInterval: number; // seconds between captures
  maxMoments: number; // max moments to capture
  createdAt: string;
}

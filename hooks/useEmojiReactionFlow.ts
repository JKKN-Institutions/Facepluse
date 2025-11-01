import { useState, useEffect, useCallback, useRef } from 'react';
import type { CapturedReaction } from '@/lib/emojiReactionFrameGenerator';

export interface EmojiOption {
  emoji: string;
  emotion: string;
  label: string;
}

// Pool of available emojis with their corresponding emotions
const EMOJI_POOL: EmojiOption[] = [
  { emoji: '😊', emotion: 'happy', label: 'Happy' },
  { emoji: '😢', emotion: 'sad', label: 'Sad' },
  { emoji: '😲', emotion: 'surprised', label: 'Surprised' },
  { emoji: '😠', emotion: 'angry', label: 'Angry' },
  { emoji: '😐', emotion: 'neutral', label: 'Neutral' },
  { emoji: '😨', emotion: 'fearful', label: 'Fearful' },
  { emoji: '🤢', emotion: 'disgusted', label: 'Disgusted' },
  { emoji: '🤔', emotion: 'neutral', label: 'Thinking' },
];

export type FlowState =
  | 'idle'
  | 'showing'
  | 'matching'
  | 'capturing'
  | 'captured'
  | 'transitioning'
  | 'completed';

export interface UseEmojiReactionFlowReturn {
  // State
  currentStep: number;
  totalSteps: number;
  currentEmoji: EmojiOption | null;
  selectedEmojis: EmojiOption[];
  flowState: FlowState;
  capturedReactions: CapturedReaction[];
  matchProgress: number; // 0-100 percentage

  // Actions
  start: () => void;
  reset: () => void;
  handleEmotionDetected: (emotion: string, confidence: number) => void;
  manualCapture: (imageData: string) => void;
}

export function useEmojiReactionFlow(): UseEmojiReactionFlowReturn {
  const [selectedEmojis, setSelectedEmojis] = useState<EmojiOption[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [capturedReactions, setCapturedReactions] = useState<CapturedReaction[]>([]);
  const [matchProgress, setMatchProgress] = useState(0);

  const matchStartTimeRef = useRef<number | null>(null);
  const captureTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalSteps = 3;
  const MATCH_DURATION = 1000; // 1 second to hold emotion
  const CAPTURE_DISPLAY_TIME = 2000; // 2 seconds after capture
  const MATCH_CONFIDENCE_THRESHOLD = 0.6; // 60% confidence required

  // Select 3 random unique emojis
  const selectRandomEmojis = useCallback(() => {
    const shuffled = [...EMOJI_POOL].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, totalSteps);
  }, []);

  // Start the challenge
  const start = useCallback(() => {
    const emojis = selectRandomEmojis();
    setSelectedEmojis(emojis);
    setCurrentStep(0);
    setFlowState('showing');
    setCapturedReactions([]);
    setMatchProgress(0);
    matchStartTimeRef.current = null;
  }, [selectRandomEmojis]);

  // Reset to initial state
  const reset = useCallback(() => {
    setSelectedEmojis([]);
    setCurrentStep(0);
    setFlowState('idle');
    setCapturedReactions([]);
    setMatchProgress(0);
    matchStartTimeRef.current = null;

    if (captureTimeoutRef.current) {
      clearTimeout(captureTimeoutRef.current);
    }
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
  }, []);

  // Get current emoji
  const currentEmoji = selectedEmojis[currentStep] || null;

  // Handle emotion detection from face analysis
  const handleEmotionDetected = useCallback(
    (emotion: string, confidence: number) => {
      // Only process if we're in showing or matching state
      if (flowState !== 'showing' && flowState !== 'matching') {
        return;
      }

      // Check if emotion matches current emoji
      const isMatch =
        currentEmoji &&
        emotion.toLowerCase() === currentEmoji.emotion.toLowerCase() &&
        confidence >= MATCH_CONFIDENCE_THRESHOLD;

      if (isMatch) {
        // Start tracking match duration
        if (!matchStartTimeRef.current) {
          matchStartTimeRef.current = Date.now();
          setFlowState('matching');
        }

        // Calculate progress
        const elapsed = Date.now() - matchStartTimeRef.current;
        const progress = Math.min((elapsed / MATCH_DURATION) * 100, 100);
        setMatchProgress(progress);

        // Trigger capture after holding emotion for duration
        if (elapsed >= MATCH_DURATION && flowState === 'matching') {
          setFlowState('capturing');
          matchStartTimeRef.current = null;
          setMatchProgress(100);
        }
      } else {
        // Reset if emotion doesn't match
        if (matchStartTimeRef.current) {
          matchStartTimeRef.current = null;
          setMatchProgress(0);
          setFlowState('showing');
        }
      }
    },
    [flowState, currentEmoji, MATCH_DURATION, MATCH_CONFIDENCE_THRESHOLD]
  );

  // Manual capture (for testing or fallback)
  const manualCapture = useCallback(
    (imageData: string) => {
      if (!currentEmoji) return;

      const reaction: CapturedReaction = {
        image: imageData,
        emoji: currentEmoji.emoji,
        emotion: currentEmoji.emotion,
        timestamp: Date.now(),
      };

      setCapturedReactions((prev) => [...prev, reaction]);
      setFlowState('captured');
      setMatchProgress(0);

      // Transition to next emoji or complete
      transitionTimeoutRef.current = setTimeout(() => {
        if (currentStep < totalSteps - 1) {
          setCurrentStep((prev) => prev + 1);
          setFlowState('showing');
        } else {
          setFlowState('completed');
        }
      }, CAPTURE_DISPLAY_TIME);
    },
    [currentEmoji, currentStep, totalSteps, CAPTURE_DISPLAY_TIME]
  );

  // Auto-capture when flowState changes to 'capturing'
  useEffect(() => {
    if (flowState === 'capturing') {
      // This will be triggered by the page component to actually capture the frame
      // We set a timeout to prevent getting stuck
      captureTimeoutRef.current = setTimeout(() => {
        setFlowState('showing');
      }, 5000); // 5 second timeout
    }

    return () => {
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
      }
    };
  }, [flowState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (captureTimeoutRef.current) {
        clearTimeout(captureTimeoutRef.current);
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentStep,
    totalSteps,
    currentEmoji,
    selectedEmojis,
    flowState,
    capturedReactions,
    matchProgress,
    start,
    reset,
    handleEmotionDetected,
    manualCapture,
  };
}

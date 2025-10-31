'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Challenge, ChallengeResult } from '@/types/game';
import { Emotion } from '@/lib/emotion-themes';
import confetti from 'canvas-confetti';

const EMOTIONS: Emotion[] = ['happy', 'sad', 'surprised', 'angry', 'neutral'];
const CHALLENGE_DURATION = 10000; // 10 seconds
const POINTS_PER_ACCURACY = 10; // Max 1000 points for perfect score
const TOTAL_ROUNDS = 5;
const STREAK_BONUS_MULTIPLIER = 1.5;

export function useEmojiChallenge() {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    currentChallenge: null,
    score: 0,
    streak: 0,
    highScore: 0,
    challenges: [],
    round: 0,
    totalRounds: TOTAL_ROUNDS,
  });

  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('emojiChallengeHighScore');
    if (savedHighScore) {
      setGameState(prev => ({
        ...prev,
        highScore: parseInt(savedHighScore, 10),
      }));
    }
  }, []);

  // Generate new challenge with a random emotion
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

    console.log('🎯 New challenge started:', randomEmotion);
  }, []);

  // Start game
  const startGame = useCallback(() => {
    console.log('🎮 Game started!');

    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      currentChallenge: null,
      score: 0,
      streak: 0,
      challenges: [],
      round: 0,
    }));

    // Start first challenge after 1 second delay
    setTimeout(() => startChallenge(), 1000);
  }, [startChallenge]);

  // Evaluate challenge based on detected emotion and confidence
  const evaluateChallenge = useCallback((
    detectedEmotion: Emotion,
    confidence: number
  ): ChallengeResult => {
    const { currentChallenge, streak } = gameState;

    if (!currentChallenge) {
      return {
        accuracy: 0,
        pointsEarned: 0,
        feedback: 'No active challenge',
        perfectMatch: false,
        bonus: 0,
      };
    }

    const isMatch = detectedEmotion === currentChallenge.targetEmotion;

    // Calculate accuracy
    // If match: use confidence directly
    // If not match: penalize heavily (max 40%)
    const baseAccuracy = isMatch ? confidence : Math.max(0, 40 - confidence / 2);
    const accuracy = Math.min(100, Math.round(baseAccuracy));

    // Calculate points
    let pointsEarned = Math.round(accuracy * POINTS_PER_ACCURACY);

    // Streak bonus
    let bonus = 0;
    if (accuracy >= 80 && streak > 0) {
      bonus = Math.round(pointsEarned * (streak * 0.1));
      pointsEarned += bonus;
    }

    const perfectMatch = accuracy >= 95;

    // Generate feedback
    let feedback = '';
    if (perfectMatch) {
      feedback = '🎯 PERFECT! Absolutely nailed it!';
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
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
    setGameState(prev => {
      const updatedChallenge: Challenge = {
        ...currentChallenge,
        completed: true,
        score: pointsEarned,
        accuracy,
      };

      const newScore = prev.score + pointsEarned;
      const newStreak = accuracy >= 90 ? prev.streak + 1 : 0;
      const newHighScore = Math.max(prev.highScore, newScore);

      // Save high score
      if (newScore > prev.highScore) {
        localStorage.setItem('emojiChallengeHighScore', newScore.toString());
      }

      return {
        ...prev,
        score: newScore,
        streak: newStreak,
        highScore: newHighScore,
        currentChallenge: updatedChallenge,
        challenges: [...prev.challenges, updatedChallenge],
      };
    });

    console.log('📊 Challenge evaluated:', {
      isMatch,
      accuracy,
      pointsEarned,
      bonus,
      feedback,
    });

    return { accuracy, pointsEarned, feedback, perfectMatch, bonus };
  }, [gameState]);

  // Timer countdown
  useEffect(() => {
    if (!gameState.currentChallenge || gameState.currentChallenge.completed) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - gameState.currentChallenge!.startTime;
      const remaining = Math.max(0, CHALLENGE_DURATION - elapsed);

      setTimeRemaining(remaining);

      // Time's up - auto evaluate with 0 accuracy
      if (remaining === 0) {
        console.log('⏰ Time\'s up!');
        evaluateChallenge('neutral', 0);
      }
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState.currentChallenge, evaluateChallenge]);

  // Move to next challenge or end game
  const nextChallenge = useCallback(() => {
    if (gameState.round >= TOTAL_ROUNDS) {
      console.log('🏁 Game finished!');
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        currentChallenge: null,
      }));
    } else {
      startChallenge();
    }
  }, [gameState.round, startChallenge]);

  // End game early
  const endGame = useCallback(() => {
    console.log('🛑 Game ended early');
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      currentChallenge: null,
    }));
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      currentChallenge: null,
      score: 0,
      streak: 0,
      challenges: [],
      round: 0,
    }));
    setTimeRemaining(0);
  }, []);

  return {
    gameState,
    timeRemaining,
    startGame,
    startChallenge,
    evaluateChallenge,
    nextChallenge,
    endGame,
    resetGame,
  };
}

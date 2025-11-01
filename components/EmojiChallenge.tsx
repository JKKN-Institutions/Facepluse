'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEmojiChallenge } from '@/hooks/useEmojiChallenge';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Timer, Trophy, Target, Zap, Award, TrendingUp } from 'lucide-react';
import { emotionEmojis, Emotion } from '@/lib/emotion-themes';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

interface EmojiChallengeProps {
  currentEmotion: Emotion;
  emotionConfidence: number;
}

export function EmojiChallenge({ currentEmotion, emotionConfidence }: EmojiChallengeProps) {
  const {
    gameState,
    timeRemaining,
    startGame,
    evaluateChallenge,
    nextChallenge,
    endGame,
  } = useEmojiChallenge();

  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleEvaluate = () => {
    const result = evaluateChallenge(currentEmotion, emotionConfidence);
    setLastResult(result);
    setShowResult(true);

    // Show result toast
    toast.success(result.feedback, {
      description: `${result.pointsEarned} points earned!`,
    });

    // Auto-progress to next challenge after 3 seconds
    setTimeout(() => {
      setShowResult(false);
      if (gameState.round < gameState.totalRounds) {
        nextChallenge();
      }
    }, 3000);
  };

  // Show game over screen when finished
  const isGameOver = !gameState.isPlaying && gameState.challenges.length > 0;

  if (!gameState.isPlaying && !isGameOver) {
    return <StartScreen highScore={gameState.highScore} onStart={startGame} />;
  }

  if (isGameOver) {
    return <GameOverScreen gameState={gameState} onRestart={startGame} />;
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <GameHeader gameState={gameState} timeRemaining={timeRemaining} />

      {/* Challenge Display */}
      <AnimatePresence mode="wait">
        {gameState.currentChallenge && !gameState.currentChallenge.completed && !showResult && (
          <ChallengeCard
            key={gameState.currentChallenge.id}
            challenge={gameState.currentChallenge}
            onEvaluate={handleEvaluate}
            timeRemaining={timeRemaining}
          />
        )}

        {showResult && lastResult && (
          <ResultCard key="result" result={lastResult} />
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <ProgressBar current={gameState.round} total={gameState.totalRounds} />

      {/* End Game Button */}
      {gameState.isPlaying && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={endGame}
          className="w-full py-3 text-sm text-red-600 hover:text-red-700 font-semibold transition-colors"
        >
          End Game Early
        </motion.button>
      )}
    </div>
  );
}

/* ==== SUB-COMPONENTS ==== */

function StartScreen({ highScore, onStart }: { highScore: number; onStart: () => void }) {
  return (
    <GlassCard className="text-center p-8 md:p-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
      >
        <span className="text-8xl md:text-9xl block mb-6">🎮</span>
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Emoji Match Challenge
        </h2>
        <p className="text-gray-600 mb-8 text-lg">
          Match random emotions and rack up points!
        </p>

        {highScore > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg"
          >
            <Trophy className="w-5 h-5" />
            <span className="font-bold">High Score: {highScore}</span>
          </motion.div>
        )}

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onStart}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-10 py-4 rounded-full text-lg font-semibold shadow-xl"
          >
            Start Challenge
          </Button>
        </motion.div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-sm text-gray-500">
          <div className="flex flex-col items-center">
            <Target className="w-6 h-6 mb-2 text-purple-500" />
            <span>5 Rounds</span>
          </div>
          <div className="flex flex-col items-center">
            <Timer className="w-6 h-6 mb-2 text-blue-500" />
            <span>10s Each</span>
          </div>
          <div className="flex flex-col items-center">
            <Award className="w-6 h-6 mb-2 text-yellow-500" />
            <span>Max 1000pts</span>
          </div>
        </div>
      </motion.div>
    </GlassCard>
  );
}

function GameHeader({ gameState, timeRemaining }: { gameState: any; timeRemaining: number }) {
  const timeInSeconds = (timeRemaining / 1000).toFixed(1);

  return (
    <GlassCard className="p-4">
      <div className="flex justify-between items-center">
        {/* Round Counter */}
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          <span className="font-bold text-lg">
            Round {gameState.round}/{gameState.totalRounds}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-4">
          {/* Streak */}
          {gameState.streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-orange-500 font-bold"
            >
              <Zap className="w-4 h-4" />
              <span>{gameState.streak}x</span>
            </motion.div>
          )}

          {/* Points */}
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <motion.span
              key={gameState.score}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className="font-bold text-xl"
            >
              {gameState.score}
            </motion.span>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2">
            <Timer className={`w-5 h-5 ${timeRemaining < 3000 ? 'text-red-500' : 'text-blue-500'}`} />
            <motion.span
              animate={{ scale: timeRemaining < 3000 ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.5, repeat: timeRemaining < 3000 ? Infinity : 0 }}
              className={`font-bold text-2xl ${timeRemaining < 3000 ? 'text-red-500' : ''}`}
            >
              {timeInSeconds}s
            </motion.span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function ChallengeCard({ challenge, onEvaluate, timeRemaining }: any) {
  return (
    <motion.div
      key={challenge.id}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{ type: 'spring', duration: 0.6 }}
    >
      <GlassCard className="p-8 md:p-12 text-center">
        <p className="text-gray-600 mb-6 text-lg">Match this emotion:</p>

        {/* Target Emoji */}
        <motion.span
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-9xl md:text-[12rem] block mb-6"
        >
          {emotionEmojis[challenge.targetEmotion as Emotion]}
        </motion.span>

        <p className="text-4xl md:text-5xl font-bold mb-8 capitalize bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {challenge.targetEmotion}
        </p>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-8">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeRemaining / challenge.duration) * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Submit Button */}
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onEvaluate}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 py-4 text-lg font-bold shadow-xl"
          >
            Submit My Expression
          </Button>
        </motion.div>
      </GlassCard>
    </motion.div>
  );
}

function ResultCard({ result }: any) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      <GlassCard className="p-8 text-center bg-gradient-to-br from-white to-green-50">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: result.perfectMatch ? [0, 10, -10, 10, 0] : 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-8xl block mb-4">
            {result.perfectMatch ? '🎯' : result.accuracy >= 70 ? '🌟' : '😅'}
          </span>
        </motion.div>

        <h3 className="text-2xl font-bold mb-2">{result.feedback}</h3>

        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{result.accuracy}%</p>
            <p className="text-sm text-gray-600">Accuracy</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">+{result.pointsEarned}</p>
            <p className="text-sm text-gray-600">Points</p>
          </div>
        </div>

        {result.bonus > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mt-4 text-orange-600 font-bold"
          >
            🔥 Streak Bonus: +{result.bonus}
          </motion.div>
        )}
      </GlassCard>
    </motion.div>
  );
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className={`flex-1 h-3 rounded-full ${
            i < current ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

function GameOverScreen({ gameState, onRestart }: any) {
  const averageAccuracy = gameState.challenges.length > 0
    ? Math.round(
        gameState.challenges.reduce((sum: number, c: any) => sum + (c.accuracy || 0), 0) /
        gameState.challenges.length
      )
    : 0;

  const perfectMatches = gameState.challenges.filter((c: any) => (c.accuracy || 0) >= 95).length;
  const isNewHighScore = gameState.score === gameState.highScore && gameState.score > 0;

  return (
    <GlassCard className="text-center p-8 md:p-12">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring' }}
      >
        {isNewHighScore ? (
          <>
            <span className="text-8xl block mb-4">🏆</span>
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">
              New High Score!
            </h2>
          </>
        ) : (
          <>
            <span className="text-8xl block mb-4">🎉</span>
            <h2 className="text-4xl font-bold mb-2 text-gray-800">Game Complete!</h2>
          </>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 my-8">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-6">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-3xl font-bold text-purple-700">{gameState.score}</p>
            <p className="text-sm text-gray-600">Total Score</p>
          </div>
          <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-6">
            <Target className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-3xl font-bold text-blue-700">{averageAccuracy}%</p>
            <p className="text-sm text-gray-600">Avg Accuracy</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-6">
            <Award className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <p className="text-3xl font-bold text-yellow-700">{perfectMatches}</p>
            <p className="text-sm text-gray-600">Perfect Matches</p>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-6">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-3xl font-bold text-green-700">{gameState.highScore}</p>
            <p className="text-sm text-gray-600">High Score</p>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={onRestart}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-10 py-4 rounded-full text-lg font-semibold shadow-xl"
          >
            Play Again
          </Button>
        </motion.div>
      </motion.div>
    </GlassCard>
  );
}

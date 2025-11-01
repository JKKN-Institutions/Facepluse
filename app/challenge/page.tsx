'use client';

import { useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Camera } from '@/components/Camera';
import { useCamera } from '@/hooks/useCamera';
import { useFaceAnalysis } from '@/hooks/useFaceAnalysis';
import { useEmojiReactionFlow } from '@/hooks/useEmojiReactionFlow';
import { PageHeader } from '@/components/shared/PageHeader';
import EmojiDisplay from '@/components/EmojiReaction/EmojiDisplay';
import CaptureProgress from '@/components/EmojiReaction/CaptureProgress';
import ResultsFrame from '@/components/EmojiReaction/ResultsFrame';
import { Smile, Play, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { captureFrameFromVideo } from '@/lib/imageProcessing';

export default function ChallengePage() {
  const { videoRef, loading, error } = useCamera();
  const { analysis, analyzing } = useFaceAnalysis(videoRef);

  const {
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
  } = useEmojiReactionFlow();

  const hasTriggeredCaptureRef = useRef(false);

  // Handle emotion detection
  useEffect(() => {
    if (
      analysis?.face_detected &&
      analysis.emotion &&
      (flowState === 'showing' || flowState === 'matching')
    ) {
      handleEmotionDetected(analysis.emotion, analysis.emotion_confidence / 100);
    }
  }, [analysis, flowState, handleEmotionDetected]);

  // Handle auto-capture when flowState changes to 'capturing'
  useEffect(() => {
    if (
      flowState === 'capturing' &&
      videoRef.current &&
      !hasTriggeredCaptureRef.current
    ) {
      hasTriggeredCaptureRef.current = true;

      // Small delay to ensure we get the best frame
      setTimeout(async () => {
        try {
          const imageData = await captureFrameFromVideo(videoRef.current!);
          manualCapture(imageData);
          toast.success('Reaction captured! 📸');
        } catch (error) {
          console.error('Capture failed:', error);
          toast.error('Failed to capture reaction');
        } finally {
          hasTriggeredCaptureRef.current = false;
        }
      }, 100);
    }
  }, [flowState, videoRef, manualCapture]);

  // Trigger confetti when completed
  useEffect(() => {
    if (flowState === 'completed') {
      confetti({
        particleCount: 200,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#059669', '#6EE7B7', '#34D399'],
      });

      toast.success('Challenge completed! 🎉', {
        description: 'All three reactions captured perfectly!',
      });
    }
  }, [flowState]);

  return (
    <DashboardLayout>
      <div className="min-h-screen p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Header */}
          <PageHeader
            title="🎭 Emoji Reaction Challenge"
            description="Match 3 random emojis with your facial expressions and capture your reactions!"
            icon={Smile}
          />

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {flowState === 'idle' ? (
              /* Start Screen */
              <motion.div
                key="start"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                {/* Camera Preview Section */}
                <div className="glass-premium rounded-3xl p-6">
                  <div className="max-w-2xl mx-auto">
                    <Camera
                      videoRef={videoRef}
                      loading={loading}
                      error={error}
                      analysis={analysis}
                      analyzing={analyzing}
                      faceDetection={null}
                    />

                    {/* Face Detection Status */}
                    <div className="mt-4 text-center">
                      {analysis?.face_detected ? (
                        <p className="text-emerald-600 font-semibold flex items-center justify-center gap-2">
                          <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
                          Face detected! Ready to start
                        </p>
                      ) : (
                        <p className="text-orange-600 font-medium">
                          ⚠️ Please position your face in the camera to start
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Challenge Instructions */}
                <div className="glass-premium rounded-3xl p-12 text-center space-y-8">
                  <div className="text-8xl">🎭</div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold text-emerald-800">
                      Ready for the Challenge?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      We&apos;ll show you 3 random emojis. Match each expression
                      with your face, and we&apos;ll capture your reactions!
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={start}
                    disabled={!analysis?.face_detected}
                    className="px-12 py-5 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    Start Challenge
                  </motion.button>

                  {/* Instructions */}
                  <div className="mt-12 pt-8 border-t-2 border-emerald-200">
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <Info className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-lg font-bold text-emerald-800">
                        How It Works
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">1️⃣</span>
                        <div>
                          <p className="font-semibold text-gray-800">
                            Watch the Emoji
                          </p>
                          <p className="text-sm text-gray-600">
                            An emoji will appear on the left side
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">2️⃣</span>
                        <div>
                          <p className="font-semibold text-gray-800">
                            Match the Expression
                          </p>
                          <p className="text-sm text-gray-600">
                            Make the same facial expression for 1 second
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">3️⃣</span>
                        <div>
                          <p className="font-semibold text-gray-800">
                            Auto-Capture
                          </p>
                          <p className="text-sm text-gray-600">
                            We&apos;ll capture your reaction automatically!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : flowState === 'completed' ? (
              /* Results Screen */
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ResultsFrame reactions={capturedReactions} onRetry={reset} />
              </motion.div>
            ) : (
              /* Challenge In Progress */
              <motion.div
                key="challenge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Progress indicator */}
                <CaptureProgress
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  selectedEmojis={selectedEmojis}
                  capturedCount={capturedReactions.length}
                />

                {/* Split screen: Emoji display and Camera */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Emoji Display */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="h-[500px] lg:h-[600px]"
                  >
                    <EmojiDisplay
                      emoji={currentEmoji}
                      flowState={flowState}
                      matchProgress={matchProgress}
                    />
                  </motion.div>

                  {/* Right: Camera Feed */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="h-[500px] lg:h-[600px]"
                  >
                    <div className="relative h-full">
                      <Camera
                        videoRef={videoRef}
                        loading={loading}
                        error={error}
                        analysis={analysis}
                        analyzing={analyzing}
                        faceDetection={null}
                      />

                      {/* Status overlay */}
                      {analysis?.face_detected && analysis.emotion && (
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="glass-premium rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">
                                {(() => {
                                  const emotion = analysis.emotion.toLowerCase();
                                  if (emotion === 'happy') return '😊';
                                  if (emotion === 'sad') return '😢';
                                  if (emotion === 'surprised') return '😲';
                                  if (emotion === 'angry') return '😠';
                                  if (emotion === 'fearful') return '😨';
                                  if (emotion === 'disgusted') return '🤢';
                                  return '😐';
                                })()}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-emerald-800 capitalize">
                                  {analysis.emotion}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {Math.round(analysis.emotion_confidence)}%
                                  confident
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Cancel button */}
                <div className="text-center">
                  <button
                    onClick={reset}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel Challenge
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}

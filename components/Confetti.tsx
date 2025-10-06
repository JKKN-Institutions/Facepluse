'use client'

import confetti from 'canvas-confetti'

export function triggerConfetti() {
  confetti({
    particleCount: 200,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#8B5CF6', '#EC4899', '#3B82F6', '#F59E0B'],
    disableForReducedMotion: true,
  })

  // Optional: Play sound if audio is enabled
  if (process.env.NEXT_PUBLIC_ENABLE_SOUND === 'true') {
    try {
      const audio = new Audio('/sounds/whoosh.mp3')
      audio.volume = 0.3
      audio.play().catch(() => {
        // Ignore audio errors
      })
    } catch {
      // Ignore audio errors
    }
  }
}

// Hook to trigger confetti when smile reaches 90%
export function useConfetti(smilePercentage: number) {
  const hasTriggered = typeof window !== 'undefined' ? sessionStorage.getItem('confetti-triggered') : null

  if (smilePercentage >= 90 && !hasTriggered) {
    triggerConfetti()
    sessionStorage.setItem('confetti-triggered', 'true')
  }
}

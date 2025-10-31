/**
 * Emotion-based color themes for dynamic UI theming
 * Each emotion has a unique color palette that transforms the entire app
 */

export const emotionThemes = {
  happy: {
    name: 'Happy',
    primary: '#F59E0B', // Warm yellow
    secondary: '#FCD34D',
    accent: '#FBBF24',
    gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
    glow: 'rgba(245, 158, 11, 0.3)',
    background: 'rgba(252, 211, 77, 0.05)',
    textPrimary: '#92400E',
    textSecondary: '#B45309',
  },
  sad: {
    name: 'Sad',
    primary: '#3B82F6', // Cool blue
    secondary: '#60A5FA',
    accent: '#2563EB',
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #1E40AF 100%)',
    glow: 'rgba(59, 130, 246, 0.3)',
    background: 'rgba(96, 165, 250, 0.05)',
    textPrimary: '#1E3A8A',
    textSecondary: '#1E40AF',
  },
  surprised: {
    name: 'Surprised',
    primary: '#EC4899', // Vibrant pink
    secondary: '#F472B6',
    accent: '#DB2777',
    gradient: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
    glow: 'rgba(236, 72, 153, 0.3)',
    background: 'rgba(244, 114, 182, 0.05)',
    textPrimary: '#831843',
    textSecondary: '#9F1239',
  },
  angry: {
    name: 'Angry',
    primary: '#EF4444', // Red
    secondary: '#F87171',
    accent: '#DC2626',
    gradient: 'linear-gradient(135deg, #F87171 0%, #DC2626 100%)',
    glow: 'rgba(239, 68, 68, 0.3)',
    background: 'rgba(248, 113, 113, 0.05)',
    textPrimary: '#7F1D1D',
    textSecondary: '#991B1B',
  },
  neutral: {
    name: 'Neutral',
    primary: '#10B981', // Emerald green (default app theme)
    secondary: '#34D399',
    accent: '#059669',
    gradient: 'linear-gradient(135deg, #34D399 0%, #059669 100%)',
    glow: 'rgba(16, 185, 129, 0.3)',
    background: 'rgba(52, 211, 153, 0.05)',
    textPrimary: '#065F46',
    textSecondary: '#047857',
  },
};

export type Emotion = keyof typeof emotionThemes;
export type EmotionTheme = typeof emotionThemes.neutral;

/**
 * Get emoji representation for each emotion
 */
export const emotionEmojis: Record<Emotion, string> = {
  happy: '😊',
  sad: '😢',
  surprised: '😲',
  angry: '😠',
  neutral: '😐',
};

/**
 * Get theme by emotion name
 */
export function getThemeByEmotion(emotion: string): EmotionTheme {
  const normalizedEmotion = emotion.toLowerCase() as Emotion;
  return emotionThemes[normalizedEmotion] || emotionThemes.neutral;
}

/**
 * Check if emotion is valid
 */
export function isValidEmotion(emotion: string): emotion is Emotion {
  return emotion in emotionThemes;
}

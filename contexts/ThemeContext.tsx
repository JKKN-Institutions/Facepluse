'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Emotion, emotionThemes, EmotionTheme } from '@/lib/emotion-themes';

interface ThemeContextType {
  currentTheme: EmotionTheme;
  emotion: Emotion;
  setEmotion: (emotion: Emotion) => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [currentTheme, setCurrentTheme] = useState<EmotionTheme>(emotionThemes.neutral);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update theme when emotion changes with smooth transition
  useEffect(() => {
    setIsTransitioning(true);

    // Smooth transition delay
    const timer = setTimeout(() => {
      setCurrentTheme(emotionThemes[emotion]);
      setIsTransitioning(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [emotion]);

  // Apply CSS variables for global theme
  useEffect(() => {
    const root = document.documentElement;

    // Set CSS custom properties
    root.style.setProperty('--color-primary', currentTheme.primary);
    root.style.setProperty('--color-secondary', currentTheme.secondary);
    root.style.setProperty('--color-accent', currentTheme.accent);
    root.style.setProperty('--gradient-primary', currentTheme.gradient);
    root.style.setProperty('--glow-color', currentTheme.glow);
    root.style.setProperty('--background-tint', currentTheme.background);
    root.style.setProperty('--text-primary', currentTheme.textPrimary);
    root.style.setProperty('--text-secondary', currentTheme.textSecondary);

    console.log('🎨 Theme updated:', emotion, currentTheme.name);
  }, [currentTheme, emotion]);

  return (
    <ThemeContext.Provider value={{ currentTheme, emotion, setEmotion, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

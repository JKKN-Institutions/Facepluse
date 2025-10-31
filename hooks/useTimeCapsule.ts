'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { EmotionalMoment, TimeCapsule, TimeCapsuleStatistics, EventConfig } from '@/types/timeCapsule';
import { Emotion } from '@/lib/emotion-themes';

const DEFAULT_CAPTURE_INTERVAL = 5000; // 5 seconds
const MAX_MOMENTS_PER_EVENT = 500;

export function useTimeCapsule() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<EventConfig | null>(null);
  const [capsule, setCapsule] = useState<TimeCapsule | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const momentsRef = useRef<EmotionalMoment[]>([]);
  const lastCaptureTimeRef = useRef<number>(0);
  const recordingStartTimeRef = useRef<number>(0);

  // Load saved events from localStorage
  const [savedEvents, setSavedEvents] = useState<TimeCapsule[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('timeCapsuleEvents');
    if (saved) {
      try {
        setSavedEvents(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved events:', error);
      }
    }
  }, []);

  // Save events to localStorage whenever they change
  const saveEvents = useCallback((events: TimeCapsule[]) => {
    localStorage.setItem('timeCapsuleEvents', JSON.stringify(events));
    setSavedEvents(events);
  }, []);

  // Create a new event
  const createEvent = useCallback((name: string, description: string = ''): EventConfig => {
    const event: EventConfig = {
      id: crypto.randomUUID(),
      name,
      description,
      captureInterval: DEFAULT_CAPTURE_INTERVAL,
      maxMoments: MAX_MOMENTS_PER_EVENT,
      createdAt: new Date().toISOString(),
    };

    console.log('📅 Event created:', event);
    return event;
  }, []);

  // Start recording an event
  const startRecording = useCallback((event: EventConfig) => {
    console.log('🎬 Recording started for:', event.name);

    setCurrentEvent(event);
    setIsRecording(true);
    momentsRef.current = [];
    recordingStartTimeRef.current = Date.now();
    lastCaptureTimeRef.current = 0;

    // Initialize capsule
    const newCapsule: TimeCapsule = {
      id: crypto.randomUUID(),
      eventId: event.id,
      eventName: event.name,
      eventDescription: event.description,
      startTime: Date.now(),
      endTime: 0,
      moments: [],
      statistics: {
        totalMoments: 0,
        emotionDistribution: {
          happy: 0,
          sad: 0,
          surprised: 0,
          angry: 0,
          neutral: 0,
        },
        averageSmile: 0,
        peakHappiness: null,
        mostCommonEmotion: 'neutral',
        duration: 0,
      },
    };

    setCapsule(newCapsule);
  }, []);

  // Capture a moment (called from face analysis)
  const captureMoment = useCallback((
    emotion: Emotion,
    confidence: number,
    smilePercentage: number,
    imageData: string
  ): boolean => {
    if (!isRecording || !currentEvent || !capsule) {
      return false;
    }

    // Check if enough time has passed since last capture
    const now = Date.now();
    const timeSinceLastCapture = now - lastCaptureTimeRef.current;

    if (timeSinceLastCapture < currentEvent.captureInterval) {
      return false;
    }

    // Check if max moments reached
    if (momentsRef.current.length >= currentEvent.maxMoments) {
      console.warn('⚠️ Max moments reached for this event');
      return false;
    }

    const moment: EmotionalMoment = {
      id: crypto.randomUUID(),
      timestamp: now,
      emotion,
      confidence,
      imageData,
      smilePercentage,
      metadata: {
        eventId: currentEvent.id,
      },
    };

    momentsRef.current.push(moment);
    lastCaptureTimeRef.current = now;

    console.log('📸 Moment captured:', {
      count: momentsRef.current.length,
      emotion,
      smile: smilePercentage,
    });

    return true;
  }, [isRecording, currentEvent, capsule]);

  // Calculate statistics from moments
  const calculateStatistics = useCallback((moments: EmotionalMoment[]): TimeCapsuleStatistics => {
    if (moments.length === 0) {
      return {
        totalMoments: 0,
        emotionDistribution: {
          happy: 0,
          sad: 0,
          surprised: 0,
          angry: 0,
          neutral: 0,
        },
        averageSmile: 0,
        peakHappiness: null,
        mostCommonEmotion: 'neutral',
        duration: 0,
      };
    }

    // Calculate emotion distribution
    const emotionCounts: Record<Emotion, number> = {
      happy: 0,
      sad: 0,
      surprised: 0,
      angry: 0,
      neutral: 0,
    };

    moments.forEach(m => {
      emotionCounts[m.emotion] = (emotionCounts[m.emotion] || 0) + 1;
    });

    // Find most common emotion
    const mostCommonEmotion = Object.entries(emotionCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as Emotion || 'neutral';

    // Calculate average smile
    const totalSmile = moments.reduce((sum, m) => sum + m.smilePercentage, 0);
    const averageSmile = Math.round(totalSmile / moments.length);

    // Find peak happiness moment
    const peakHappiness = moments.reduce((max, m) =>
      m.smilePercentage > max.smilePercentage ? m : max
    , moments[0]);

    // Calculate duration
    const duration = Math.floor((Date.now() - recordingStartTimeRef.current) / 1000);

    return {
      totalMoments: moments.length,
      emotionDistribution: emotionCounts,
      averageSmile,
      peakHappiness,
      mostCommonEmotion,
      duration,
    };
  }, []);

  // Stop recording and save capsule
  const stopRecording = useCallback((): TimeCapsule | null => {
    if (!capsule || !currentEvent) {
      return null;
    }

    console.log('🛑 Recording stopped');

    const finalMoments = [...momentsRef.current];
    const statistics = calculateStatistics(finalMoments);

    const finalCapsule: TimeCapsule = {
      ...capsule,
      endTime: Date.now(),
      moments: finalMoments,
      statistics,
    };

    // Save to localStorage
    const updatedEvents = [...savedEvents, finalCapsule];
    saveEvents(updatedEvents);

    setIsRecording(false);
    setCurrentEvent(null);
    setCapsule(finalCapsule);
    momentsRef.current = [];

    return finalCapsule;
  }, [capsule, currentEvent, calculateStatistics, savedEvents, saveEvents]);

  // Generate PNG collage from captured moments
  const generateCollage = useCallback(async (capsuleId: string): Promise<string | null> => {
    const targetCapsule = savedEvents.find(e => e.id === capsuleId);

    if (!targetCapsule || targetCapsule.moments.length === 0) {
      throw new Error('No moments to generate collage');
    }

    setIsGenerating(true);

    try {
      // Import collage generator dynamically
      const { generateCollage: generateCollageImage } = await import('@/lib/collageGenerator');

      const momentCount = targetCapsule.moments.length;

      // Provide feedback for large image counts
      if (momentCount > 200) {
        console.warn(`⚠️ Large image count (${momentCount}). Photos will be scaled to 100px for optimal viewing.`);
      } else if (momentCount > 100) {
        console.log(`📊 Medium image count (${momentCount}). Photos will be scaled to 120px.`);
      }

      // Generate collage (client-side)
      console.log('🎨 Generating collage with', momentCount, 'moments...');
      const collageDataUrl = await generateCollageImage(targetCapsule);

      // Update capsule with collage URL
      const updatedEvents = savedEvents.map(e =>
        e.id === capsuleId ? { ...e, collageUrl: collageDataUrl } : e
      );

      saveEvents(updatedEvents);

      console.log('✅ Collage generated successfully');

      return collageDataUrl;
    } catch (error) {
      console.error('❌ Failed to generate collage:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [savedEvents, saveEvents]);

  // Delete an event
  const deleteEvent = useCallback((eventId: string) => {
    const updatedEvents = savedEvents.filter(e => e.id !== eventId);
    saveEvents(updatedEvents);
    console.log('🗑️ Event deleted:', eventId);
  }, [savedEvents, saveEvents]);

  // Get live statistics during recording
  const getLiveStatistics = useCallback((): TimeCapsuleStatistics => {
    return calculateStatistics(momentsRef.current);
  }, [calculateStatistics]);

  return {
    // State
    isRecording,
    currentEvent,
    capsule,
    savedEvents,
    isGenerating,
    momentCount: momentsRef.current.length,

    // Actions
    createEvent,
    startRecording,
    captureMoment,
    stopRecording,
    generateCollage,
    deleteEvent,
    getLiveStatistics,
  };
}

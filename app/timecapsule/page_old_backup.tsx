'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { useTimeCapsule } from '@/hooks/useTimeCapsule';
import { useCamera } from '@/hooks/useCamera';
import { useFaceAnalysis } from '@/hooks/useFaceAnalysis';
import { Film, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventCard } from '@/components/TimeCapsule/EventCard';
import { RecordingView } from '@/components/TimeCapsule/RecordingView';
import { EventDetailView } from '@/components/TimeCapsule/EventDetailView';
import { useState, useEffect } from 'react';
import { TimeCapsule } from '@/types/timeCapsule';
import { Emotion } from '@/lib/emotion-themes';
import { toast } from 'sonner';

export default function TimeCapsulePage() {
  const {
    isRecording,
    currentEvent,
    savedEvents,
    isGenerating,
    momentCount,
    createEvent,
    startRecording,
    captureMoment,
    stopRecording,
    generateCollage,
    deleteEvent,
    getLiveStatistics,
  } = useTimeCapsule();

  const { videoRef, loading, error } = useCamera();
  const { analysis, analyzing, faceDetection } = useFaceAnalysis(videoRef);

  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedEvent, setSelectedEvent] = useState<TimeCapsule | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Auto-capture moments during recording
  useEffect(() => {
    if (isRecording && analysis?.face_detected && videoRef.current) {
      // Capture actual video frame as image
      const canvas = document.createElement('canvas');
      const video = videoRef.current;

      if (video.readyState === 4) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const imageData = canvas.toDataURL('image/jpeg', 0.7);

          const captured = captureMoment(
            analysis.emotion as Emotion,
            analysis.emotion_confidence,
            analysis.smile_percentage,
            imageData // Now capturing actual image
          );

          if (captured) {
            console.log('✨ Moment auto-captured with image');
          }
        }
      }
    }
  }, [isRecording, analysis, captureMoment, videoRef]);

  const handleCreateEvent = (name: string, description: string) => {
    const event = createEvent(name, description);
    startRecording(event);
    setShowCreateModal(false);
    toast.success(`Recording started for "${name}"`);
  };

  const handleStopRecording = () => {
    const capsule = stopRecording();
    if (capsule) {
      toast.success(`Recording saved! Captured ${capsule.statistics.totalMoments} moments.`);
    }
  };

  const handleViewEvent = (event: TimeCapsule) => {
    setSelectedEvent(event);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId);
      toast.success('Event deleted successfully');
    }
  };

  // Show loading state while camera initializes
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Initializing camera...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      {/* Recording View */}
      {isRecording && currentEvent && (
        <RecordingView
          videoRef={videoRef}
          loading={loading}
          error={error}
          analysis={analysis}
          analyzing={analyzing}
          faceDetection={faceDetection}
          statistics={getLiveStatistics()}
          momentCount={momentCount}
          onStopRecording={handleStopRecording}
          eventName={currentEvent.name}
        />
      )}

      {/* Event Detail View */}
      {!isRecording && view === 'detail' && selectedEvent && (
        <EventDetailView
          event={selectedEvent}
          onBack={handleBackToList}
          onGenerateCollage={generateCollage}
          isGenerating={isGenerating}
        />
      )}

      {/* Event List View */}
      {!isRecording && view === 'list' && (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <PageHeader
              title="Time Capsule"
              description="Capture and preserve emotional moments from your events"
              icon={Film}
            />

            {/* Create Event Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create New Event
            </motion.button>

            {/* Events Grid */}
            {savedEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-subtle rounded-2xl p-12 text-center"
              >
                <Film className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Events Yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first event to start capturing emotional moments
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedEvents.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <EventCard
                      event={event}
                      onView={handleViewEvent}
                      onDelete={handleDeleteEvent}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateEventModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateEvent}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

/* Create Event Modal Component */
function CreateEventModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, description: string) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim());
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <div className="glass-premium rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Event</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Birthday Party, Team Meeting"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description for your event..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all"
              >
                Start Recording
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}

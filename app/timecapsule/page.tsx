'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { useTimeCapsuleEvents } from '@/hooks/useTimeCapsuleEvents';
import { useTimeCapsuleFetch } from '@/hooks/useTimeCapsuleFetch';
import { Film, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventDetailView } from '@/components/TimeCapsule/EventDetailView';
import { CreateEventForm } from '@/components/TimeCapsule/CreateEventForm';
import { ActiveEventBanner } from '@/components/TimeCapsule/ActiveEventBanner';
import { useState } from 'react';
import { TimeCapsuleEvent } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function TimeCapsulePage() {
  const {
    events,
    loading,
    error,
    activeEvent,
    createEvent,
    stopEvent,
    updateCollageUrl,
    deleteEvent,
  } = useTimeCapsuleEvents();

  const {
    isGenerating,
    generateCollageFromEvent,
  } = useTimeCapsuleFetch();

  const [view, setView] = useState<'list' | 'detail'>('list');
  const [selectedEvent, setSelectedEvent] = useState<TimeCapsuleEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Handle create event
  const handleCreateEvent = async (
    name: string,
    description: string,
    durationMinutes: number | undefined,
    includeChallenges: boolean
  ) => {
    const event = await createEvent(name, description, includeChallenges, durationMinutes);

    if (event) {
      setShowCreateModal(false);

      if (durationMinutes) {
        toast.success(`Event "${name}" started! Will auto-stop in ${durationMinutes} minutes.`);
      } else {
        toast.success(`Event "${name}" started! Stop manually when ready.`);
      }
    } else {
      toast.error('Failed to create event');
    }
  };

  // Handle stop event
  const handleStopEvent = async () => {
    if (!activeEvent) return;

    const stopped = await stopEvent(activeEvent.id);
    if (stopped) {
      toast.success('Event stopped! Click "Generate Collage" to create your collage.');
    } else {
      toast.error('Failed to stop event');
    }
  };

  // Handle view event details
  const handleViewEvent = (event: TimeCapsuleEvent) => {
    setSelectedEvent(event);
    setView('detail');
  };

  // Handle back to list
  const handleBackToList = () => {
    setView('list');
    setSelectedEvent(null);
  };

  // Handle generate collage
  const handleGenerateCollage = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) {
      toast.error('Event not found');
      return null;
    }

    if (!event.end_time) {
      toast.error('Please stop the event first');
      return null;
    }

    toast.loading('Fetching captured moments...', { id: 'collage-gen' });

    try {
      // Generate collage from Supabase images
      const collageUrl = await generateCollageFromEvent(event);

      if (collageUrl) {
        // Update event with collage URL
        await updateCollageUrl(eventId, collageUrl);
        toast.success('Collage created successfully!', { id: 'collage-gen' });
        return collageUrl;
      }

      return null;
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate collage', { id: 'collage-gen' });
      return null;
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      const deleted = await deleteEvent(eventId);
      if (deleted) {
        toast.success('Event deleted successfully');
        if (selectedEvent?.id === eventId) {
          handleBackToList();
        }
      } else {
        toast.error('Failed to delete event');
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700">Loading Time Capsules...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state - Database not setup
  if (error === 'database_not_setup') {
    return (
      <DashboardLayout>
        <div className="min-h-screen p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-premium rounded-2xl p-8 md:p-12 text-center shadow-2xl"
            >
              {/* Icon */}
              <div className="text-8xl mb-6">⚠️</div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Database Setup Required
              </h2>

              {/* Description */}
              <p className="text-lg text-gray-600 mb-8">
                Time Capsule needs Supabase database configuration to work properly.
              </p>

              {/* Setup Instructions */}
              <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-2xl p-6 text-left mb-8 border-2 border-blue-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  Quick Setup (5 minutes)
                </h3>

                <ol className="space-y-4 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <div>
                      <strong>Open Setup Guide:</strong> Check the file{' '}
                      <code className="bg-gray-800 text-emerald-400 px-2 py-1 rounded text-xs">
                        SETUP_TIME_CAPSULE.md
                      </code>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <div>
                      <strong>Run SQL Migrations:</strong> Go to Supabase Dashboard → SQL Editor →
                      Run the migrations from{' '}
                      <code className="bg-gray-800 text-emerald-400 px-2 py-1 rounded text-xs">
                        supabase_migrations.sql
                      </code>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <div>
                      <strong>Create Storage Bucket:</strong> In Supabase Storage, create a public
                      bucket named <code className="bg-gray-800 text-emerald-400 px-2 py-1 rounded text-xs">mood-captures</code>
                    </div>
                  </li>

                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <div>
                      <strong>Refresh Page:</strong> Once setup is complete, refresh this page
                    </div>
                  </li>
                </ol>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold shadow-lg"
              >
                Refresh Page
              </motion.button>

              {/* Help Text */}
              <p className="text-xs text-gray-500 mt-6">
                Need help? Check the browser console for detailed error messages.
              </p>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Generic error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen p-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-premium rounded-2xl p-8 text-center"
            >
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold"
              >
                Try Again
              </button>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Event Detail View */}
      {view === 'detail' && selectedEvent && (
        <EventDetailView
          event={{
            id: selectedEvent.id,
            eventId: selectedEvent.id,
            eventName: selectedEvent.name,
            eventDescription: selectedEvent.description,
            startTime: new Date(selectedEvent.start_time).getTime(),
            endTime: selectedEvent.end_time ? new Date(selectedEvent.end_time).getTime() : 0,
            moments: [], // Not needed for display
            statistics: {
              totalMoments: 0,
              emotionDistribution: { happy: 0, sad: 0, surprised: 0, angry: 0, neutral: 0 },
              averageSmile: 0,
              peakHappiness: null,
              mostCommonEmotion: 'neutral',
              duration: selectedEvent.end_time
                ? Math.floor((new Date(selectedEvent.end_time).getTime() - new Date(selectedEvent.start_time).getTime()) / 1000)
                : 0,
            },
            collageUrl: selectedEvent.collage_url,
          }}
          onBack={handleBackToList}
          onGenerateCollage={handleGenerateCollage}
          isGenerating={isGenerating}
        />
      )}

      {/* Event List View */}
      {view === 'list' && (
        <div className="min-h-screen p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <PageHeader
              title="Time Capsule"
              description="Create events and generate collages from your captured moments"
              icon={Film}
            />

            {/* Active Event Banner */}
            {activeEvent && (
              <ActiveEventBanner
                event={activeEvent}
                onStop={handleStopEvent}
              />
            )}

            {/* Create Event Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateModal(true)}
              disabled={!!activeEvent}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              {activeEvent ? 'Stop current event first' : 'Create New Event'}
            </motion.button>

            {/* Info Box */}
            <div className="glass-subtle rounded-2xl p-6">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-500" />
                How it works
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Create an event and set a duration (or stop manually)</li>
                <li>• Continue using the main dashboard - your mood captures are automatically saved</li>
                <li>• When the event ends, click "Generate Collage" to create a beautiful image</li>
                <li>• All emotions captured during the event will be included!</li>
              </ul>
            </div>

            {/* Events Grid */}
            {events.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-subtle rounded-2xl p-12 text-center"
              >
                <Film className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Events Yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first Time Capsule event to start capturing emotional moments
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-premium rounded-2xl p-6 cursor-pointer hover:shadow-xl transition-all"
                    onClick={() => handleViewEvent(event)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
                      {!event.end_time && (
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>

                    {event.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                    )}

                    <div className="space-y-2 text-sm text-gray-600">
                      <div>📅 {new Date(event.start_time).toLocaleDateString()}</div>
                      <div>🕐 {new Date(event.start_time).toLocaleTimeString()}</div>
                      {event.end_time && (
                        <div>
                          ⏱️ Duration: {Math.floor((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 60000)}m
                        </div>
                      )}
                    </div>

                    {event.collage_url ? (
                      <div className="mt-4 px-3 py-2 bg-emerald-100 rounded-lg text-emerald-800 text-xs font-semibold">
                        ✅ Collage Generated
                      </div>
                    ) : event.end_time ? (
                      <div className="mt-4 px-3 py-2 bg-yellow-100 rounded-lg text-yellow-800 text-xs font-semibold">
                        ⏳ Ready for Collage
                      </div>
                    ) : (
                      <div className="mt-4 px-3 py-2 bg-blue-100 rounded-lg text-blue-800 text-xs font-semibold">
                        🎬 Recording...
                      </div>
                    )}
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
          <CreateEventForm
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateEvent}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

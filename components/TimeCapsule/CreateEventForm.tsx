'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Clock, Film } from 'lucide-react';

interface CreateEventFormProps {
  onClose: () => void;
  onCreate: (name: string, description: string, durationMinutes: number | undefined, includeChallenges: boolean) => void;
}

const DURATION_OPTIONS = [
  { label: '30 Minutes', value: 30 },
  { label: '1 Hour', value: 60 },
  { label: '2 Hours', value: 120 },
  { label: 'Manual Stop', value: undefined },
];

export function CreateEventForm({ onClose, onCreate }: CreateEventFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [includeChallenges, setIncludeChallenges] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), description.trim(), duration, includeChallenges);
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
        <div className="glass-premium rounded-2xl p-4 sm:p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl my-4 sm:my-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center">
              <Film className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Create Time Capsule</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Event Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Team Meeting, Birthday Party"
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about this event..."
                rows={2}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <Clock className="w-4 h-4 inline mr-2" />
                Duration
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DURATION_OPTIONS.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setDuration(option.value)}
                    className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl font-semibold transition-all ${
                      duration === option.value
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg'
                        : 'border-2 border-gray-300 hover:border-emerald-500 text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {duration === undefined && (
                <p className="text-xs text-gray-500 mt-2">
                  📌 You can stop the event manually when ready
                </p>
              )}
            </div>

            {/* Include Challenges */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeChallenges}
                  onChange={(e) => setIncludeChallenges(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-emerald-500 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-700 block">
                    Include Emoji Challenge Images
                  </span>
                  <span className="text-xs text-gray-500">
                    Add images from challenge games to the collage
                  </span>
                </div>
              </label>
            </div>

            {/* Info Box */}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
              <p className="text-sm text-emerald-800">
                💡 <strong>How it works:</strong> Time Capsule will fetch all mood analyzer captures
                from your selected time period and create a beautiful collage!
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl border-2 border-gray-300 hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Event
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}

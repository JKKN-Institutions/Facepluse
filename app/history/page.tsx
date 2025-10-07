'use client';

import { motion } from 'framer-motion';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { History, Calendar, Download, Clock, Smile, Eye } from 'lucide-react';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const { sessions, loading } = useSessionHistory();
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      const today = new Date().toDateString();
      return new Date(session.created_at).toDateString() === today;
    }
    if (filter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(session.created_at) >= weekAgo;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Session History"
        description="View and analyze your past analysis sessions"
        icon={History}
        action={{
          label: 'Export Data',
          icon: Download,
          onClick: () => console.log('Export'),
        }}
      />

      {/* Filter Bar */}
      <div className="flex items-center gap-3">
        {['All Time', 'Today', 'This Week'].map((label, index) => {
          const value = ['all', 'today', 'week'][index];
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-6 py-2 rounded-xl font-semibold text-sm transition-all ${
                filter === value
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <LoadingGrid />
      ) : filteredSessions.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No sessions found"
          description="Start a new session to see your analysis history here"
          action={{ label: 'Start Live Analysis', href: '/' }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <SessionCard session={session} onClick={() => router.push(`/session/${session.id}`)} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SessionCardProps {
  session: {
    id: string;
    created_at: string;
    avg_smile: number;
    total_duration: number;
    total_blinks: number;
    dominant_emotion: string;
  };
  onClick: () => void;
}

function SessionCard({ session, onClick }: SessionCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getEmoji = (emotion: string) => {
    const emojiMap: Record<string, string> = {
      happy: '😊',
      sad: '😢',
      surprised: '😲',
      neutral: '😐',
      angry: '😠',
    };
    return emojiMap[emotion.toLowerCase()] || '😐';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{formatDate(session.created_at)}</span>
        </div>
        <div className="text-3xl">{getEmoji(session.dominant_emotion)}</div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smile className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Avg Smile</span>
          </div>
          <span className="text-lg font-bold text-green-600">
            {session.avg_smile}%
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Duration</span>
          </div>
          <span className="text-sm font-semibold text-gray-800">
            {formatDuration(session.total_duration)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">Blinks</span>
          </div>
          <span className="text-sm font-semibold text-gray-800">
            {session.total_blinks}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>Session Quality</span>
          <span>{session.avg_smile}%</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${session.avg_smile}%` }}
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
          />
        </div>
      </div>

      {/* View Details Button */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="mt-4 text-center text-sm text-green-600 font-semibold group-hover:underline"
      >
        View Details →
      </motion.div>
    </motion.div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
      ))}
    </div>
  );
}

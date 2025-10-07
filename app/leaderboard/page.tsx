'use client';

import { motion } from 'framer-motion';
import { PageHeader } from '@/components/shared/PageHeader';
import { Trophy, Medal, Award } from 'lucide-react';
import { useLeaderboardSupabase } from '@/hooks/useLeaderboardSupabase';
import { useState } from 'react';

export default function LeaderboardPage() {
  const { entries, loading } = useLeaderboardSupabase();
  const [filter, setFilter] = useState('all');

  const topThree = entries?.slice(0, 3) || [];
  const restOfEntries = entries?.slice(3) || [];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Leaderboard"
          description="Top performers with the highest smile scores"
          icon={Trophy}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader
          title="Leaderboard"
          description="Top performers with the highest smile scores"
          icon={Trophy}
        />
        <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-700 mb-2">No entries yet</p>
            <p className="text-sm text-gray-500">Start smiling to get on the leaderboard!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Leaderboard"
        description="Top performers with the highest smile scores"
        icon={Trophy}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-3">
        {['All Time', 'Today', 'This Week', 'This Month'].map((label, index) => {
          const value = ['all', 'today', 'week', 'month'][index];
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

      {/* Top 3 Podium */}
      {topThree.length >= 3 && <PodiumDisplay topThree={topThree} />}

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">All Rankings</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Medal className="w-4 h-4" />
              <span>{entries?.length || 0} Total Entries</span>
            </div>
          </div>
        </div>
        <LeaderboardTable entries={restOfEntries} startRank={4} />
      </div>
    </div>
  );
}

interface PodiumDisplayProps {
  topThree: Array<{
    id: string;
    smile_percentage: number;
    created_at: string;
  }>;
}

function PodiumDisplay({ topThree }: PodiumDisplayProps) {
  if (topThree.length < 3) return null;

  const [second, first, third] = [topThree[1], topThree[0], topThree[2]];
  const positions = [second, first, third];
  const heights = ['h-48', 'h-64', 'h-40'];
  const colors = [
    'from-gray-300 to-gray-500',
    'from-yellow-400 to-yellow-600',
    'from-orange-400 to-orange-600',
  ];
  const icons = [Medal, Trophy, Award];

  return (
    <div className="flex items-end justify-center gap-6 py-12">
      {positions.map((entry, index) => {
        const Icon = icons[index];
        const actualRank = index === 1 ? 1 : index === 0 ? 2 : 3;

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="flex flex-col items-center"
          >
            {/* Avatar/Emoji */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                scale: actualRank === 1 ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3,
              }}
              className={`w-24 h-24 rounded-full bg-gradient-to-br ${colors[index]} flex items-center justify-center text-4xl shadow-2xl mb-4 border-4 border-white`}
            >
              {actualRank === 1 ? '👑' : actualRank === 2 ? '🥈' : '🥉'}
            </motion.div>

            {/* Podium */}
            <div
              className={`${heights[index]} w-32 bg-gradient-to-t ${colors[index]} rounded-t-2xl shadow-xl flex flex-col items-center justify-center text-white border-4 border-white`}
            >
              <Icon className="w-8 h-8 mb-2" />
              <div className="text-4xl font-black mb-1">{actualRank}</div>
              <div className="text-3xl font-bold">{entry.smile_percentage}%</div>
              <div className="text-xs opacity-80 mt-1">
                {new Date(entry.created_at).toLocaleDateString()}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

interface LeaderboardTableProps {
  entries: Array<{
    id: string;
    smile_percentage: number;
    created_at: string;
  }>;
  startRank: number;
}

function LeaderboardTable({ entries, startRank }: LeaderboardTableProps) {
  if (!entries || entries.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No more entries to display</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {entries.map((entry, index) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
              {startRank + index}
            </div>
            <div>
              <div className="font-semibold text-gray-800">Session #{entry.id.slice(-6)}</div>
              <div className="text-sm text-gray-500">
                {new Date(entry.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {entry.smile_percentage}%
              </div>
              <div className="text-xs text-gray-500">Smile Score</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

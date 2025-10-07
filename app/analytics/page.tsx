'use client';

import { motion } from 'framer-motion';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { BarChart3, TrendingUp, Users, Clock, Smile } from 'lucide-react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

export default function AnalyticsPage() {
  const { stats, loading } = useAnalyticsData();

  if (loading) {
    return <LoadingState />;
  }

  // Calculate dynamic insights from real data
  const peakSmileDay = stats.smileTrends.data.length > 0
    ? stats.smileTrends.labels[stats.smileTrends.data.indexOf(Math.max(...stats.smileTrends.data))]
    : 'N/A';

  const mostCommonEmotion = Object.entries(stats.emotionDistribution).length > 0
    ? Object.entries(stats.emotionDistribution).reduce((a, b) => (a[1] > b[1] ? a : b))[0]
    : 'N/A';

  const mostCommonEmotionPercent = Object.entries(stats.emotionDistribution).length > 0
    ? Object.entries(stats.emotionDistribution).reduce((a, b) => (a[1] > b[1] ? a : b))[1]
    : 0;

  const avgSessionMinutes = stats.totalSessions > 0
    ? Math.floor((stats.totalDuration * 60) / stats.totalSessions)
    : 0;

  const avgSessionSeconds = stats.totalSessions > 0
    ? Math.floor(((stats.totalDuration * 3600) / stats.totalSessions) % 60)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Analytics & Insights"
        description="Comprehensive analysis of your facial recognition data"
        icon={BarChart3}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Avg Smile Score"
          value={`${stats.avgSmile}%`}
          icon={Smile}
          color="green"
        />
        <StatsCard
          title="Total Duration"
          value={`${stats.totalDuration}h`}
          icon={Clock}
          color="purple"
        />
        <StatsCard
          title="Happiness Index"
          value={stats.happinessIndex}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Smile Trends */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Smile Trends</h3>
          <div className="h-64 flex items-end justify-around gap-2">
            {stats.smileTrends.data.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(value / 100) * 100}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="w-full bg-gradient-to-t from-green-400 to-emerald-500 rounded-t-lg min-h-[20px]"
                />
                <span className="text-xs text-gray-600">{stats.smileTrends.labels[index]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emotion Distribution */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Emotion Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats.emotionDistribution).map(([emotion, percentage], index) => (
              <div key={emotion}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-semibold">{emotion}</span>
                  <span className="text-gray-600">{percentage}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightCard
          title="Peak Smile Day"
          value={peakSmileDay}
          description="Highest average smile score"
          icon="😊"
          color="green"
        />
        <InsightCard
          title="Most Common Emotion"
          value={mostCommonEmotion}
          description={`${mostCommonEmotionPercent}% of all detected emotions`}
          icon="❤️"
          color="red"
        />
        <InsightCard
          title="Avg Session Length"
          value={`${avgSessionMinutes}m ${avgSessionSeconds}s`}
          description={`Based on ${stats.totalSessions} sessions`}
          icon="⏱️"
          color="blue"
        />
      </div>
    </div>
  );
}

interface InsightCardProps {
  title: string;
  value: string;
  description: string;
  icon: string;
  color: 'green' | 'red' | 'blue';
}

function InsightCard({ title, value, description, icon, color }: InsightCardProps) {
  const colors = {
    green: 'from-green-50 to-emerald-50 border-green-200',
    red: 'from-red-50 to-rose-50 border-red-200',
    blue: 'from-blue-50 to-sky-50 border-blue-200',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className={`bg-gradient-to-br ${colors[color]} rounded-2xl shadow-md border p-6`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h4 className="text-sm font-semibold text-gray-600 uppercase mb-2">{title}</h4>
      <div className="text-3xl font-bold text-gray-800 mb-2">{value}</div>
      <p className="text-sm text-gray-600">{description}</p>
    </motion.div>
  );
}

function LoadingState() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-20 bg-gray-200 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

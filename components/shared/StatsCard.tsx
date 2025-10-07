'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

export function StatsCard({ title, value, change, trend, icon: Icon, color }: StatsCardProps) {
  const colors = {
    blue: 'from-blue-400 to-blue-600',
    green: 'from-green-400 to-emerald-500',
    purple: 'from-purple-400 to-purple-600',
    orange: 'from-orange-400 to-orange-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && trend && (
          <div className={`flex items-center gap-1 text-sm font-semibold ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {change}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-600 uppercase tracking-wide">{title}</div>
    </motion.div>
  );
}

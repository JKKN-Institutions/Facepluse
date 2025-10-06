'use client'

import { motion } from 'framer-motion'
import { Users, TrendingUp, Award, Clock } from 'lucide-react'

export function StatsOverview() {
  const stats = [
    { icon: Users, label: 'Total Analyses', value: '1,234', color: 'from-green-400 to-emerald-500' },
    { icon: TrendingUp, label: 'Avg Smile Score', value: '78%', color: 'from-teal-400 to-green-500' },
    { icon: Award, label: 'Top Score', value: '95%', color: 'from-lime-400 to-green-500' },
    { icon: Clock, label: 'Session Time', value: '12m', color: 'from-emerald-400 to-teal-500' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-2xl p-6 border border-green-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

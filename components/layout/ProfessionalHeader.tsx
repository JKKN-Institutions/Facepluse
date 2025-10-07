'use client';

import { motion } from 'framer-motion';
import { Activity, TrendingUp, Users, Award, Zap } from 'lucide-react';

interface HeaderProps {
  totalAnalyses?: number;
  avgScore?: number;
  topScore?: number;
}

export function ProfessionalHeader({
  totalAnalyses = 0,
  avgScore = 0,
  topScore = 0
}: HeaderProps) {
  return (
    <header className="relative h-16 md:h-20 bg-gradient-to-r from-white via-green-50 to-emerald-50 border-b border-green-100 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.15) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative h-full max-w-7xl mx-auto px-3 md:px-6 flex items-center justify-between">
        {/* Left: Logo + Brand */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl md:rounded-2xl blur-md opacity-50" />
            <div className="relative w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl">
              <Zap className="w-5 h-5 md:w-7 md:h-7 text-white" strokeWidth={2.5} />
            </div>
          </motion.div>

          {/* Brand Text */}
          <div>
            <h1 className="text-lg md:text-2xl font-bold">
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                FacePulse
              </span>
            </h1>
            <p className="text-[10px] md:text-xs font-semibold text-gray-600 tracking-wide uppercase">
              Live Facial Intelligence
            </p>
          </div>

          {/* Vertical Divider */}
          <div className="hidden lg:block h-12 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent" />

          {/* Real-time Stats */}
          <div className="hidden lg:flex items-center gap-4">
            <StatCard icon={Users} value={totalAnalyses.toLocaleString()} label="Analyses" />
            <StatCard icon={TrendingUp} value={`${avgScore}%`} label="Avg Score" color="green" />
            <StatCard icon={Award} value={`${topScore}%`} label="Top Score" color="yellow" />
          </div>
        </div>

        {/* Right: Status Badges */}
        <div className="flex items-center gap-2 md:gap-3">
          <StatusBadge
            icon={Activity}
            label="Live"
            variant="success"
            pulse
          />
          <StatusBadge
            icon={Zap}
            label="Active"
            variant="primary"
          />
        </div>
      </div>
    </header>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  color = 'gray'
}: {
  icon: any;
  value: string;
  label: string;
  color?: 'gray' | 'green' | 'yellow';
}) {
  const colors = {
    gray: 'from-gray-100 to-gray-200 text-gray-700',
    green: 'from-green-100 to-emerald-100 text-green-700',
    yellow: 'from-yellow-100 to-orange-100 text-yellow-700',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className={`bg-gradient-to-br ${colors[color]} rounded-xl px-4 py-2 shadow-sm border border-white/50`}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <div>
          <div className="text-lg font-bold leading-none">{value}</div>
          <div className="text-[10px] font-medium opacity-75 uppercase tracking-wide">
            {label}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatusBadge({
  icon: Icon,
  label,
  variant = 'primary',
  pulse = false
}: {
  icon: any;
  label: string;
  variant?: 'success' | 'primary';
  pulse?: boolean;
}) {
  const variants = {
    success: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200',
    primary: 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 border-blue-200',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`${variants[variant]} flex items-center gap-1.5 md:gap-2 px-2 py-1.5 md:px-4 md:py-2 rounded-full border shadow-sm font-semibold text-xs md:text-sm`}
    >
      {pulse && (
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [1, 0, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="absolute w-2 h-2 bg-current rounded-full"
          />
          <div className="relative w-2 h-2 bg-current rounded-full" />
        </div>
      )}
      <Icon className="w-3 h-3 md:w-4 md:h-4" />
      <span className="hidden sm:inline">{label}</span>
    </motion.div>
  );
}

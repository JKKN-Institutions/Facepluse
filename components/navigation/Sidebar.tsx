'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  BarChart3,
  History,
  Trophy,
  ChevronLeft,
  Activity,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const navigationItems = [
  {
    name: 'Live Dashboard',
    href: '/',
    icon: Home,
    description: 'Real-time analysis'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Insights & trends'
  },
  {
    name: 'History',
    href: '/history',
    icon: History,
    description: 'Past sessions'
  },
  {
    name: 'Leaderboard',
    href: '/leaderboard',
    icon: Trophy,
    description: 'Top performers'
  },
];

export function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <motion.aside
      animate={{ width: open ? 280 : 80 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="h-full bg-white/80 backdrop-blur-2xl border-r-2 border-emerald-100 shadow-2xl flex flex-col relative"
    >
      {/* Logo Section with Gradient */}
      <div className="h-24 border-b-2 border-emerald-100/50 flex items-center px-4 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-transparent to-transparent opacity-50" />

        <motion.div
          animate={{ scale: open ? 1 : 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 relative z-10"
        >
          {/* Animated Logo Icon */}
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="w-12 h-12 bg-gradient-to-br from-green-400 via-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-emerald-lg relative overflow-hidden"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            <Activity className="w-6 h-6 text-white relative z-10" strokeWidth={2.5} />
          </motion.div>

          {/* App Name */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col"
              >
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 bg-clip-text text-transparent leading-tight">
                  FacePulse
                </h1>
                <p className="text-[10px] font-medium text-emerald-600/70 tracking-wider uppercase">
                  AI Analysis
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto scrollbar-thin">
        {navigationItems.map((item, index) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.href}
              onClick={() => router.push(item.href)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03, x: open ? 6 : 0 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-emerald-lg'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:shadow-md'
              }`}
            >
              {/* Active indicator glow */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon with animation */}
              <motion.div
                whileHover={{ rotate: isActive ? 0 : 12 }}
                className="relative z-10"
              >
                <Icon
                  className={`w-5 h-5 flex-shrink-0 transition-all ${
                    isActive ? 'drop-shadow-sm' : 'group-hover:scale-110'
                  }`}
                  strokeWidth={2.5}
                />
              </motion.div>

              {/* Text content */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-start relative z-10"
                  >
                    <span className={`font-semibold text-sm leading-tight ${
                      isActive ? 'text-white' : 'text-gray-800'
                    }`}>
                      {item.name}
                    </span>
                    <span className={`text-[10px] font-medium ${
                      isActive ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sparkle effect on hover (only when not active) */}
              {!isActive && (
                <Sparkles className="w-3 h-3 absolute top-2 right-2 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Toggle Button - Enhanced */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute -right-4 top-28 w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 border-3 border-white rounded-full flex items-center justify-center shadow-lg hover:shadow-emerald-lg transition-all duration-300 z-20"
        aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <motion.div
          animate={{ rotate: open ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronLeft className="w-4 h-4 text-white" strokeWidth={3} />
        </motion.div>
      </motion.button>
    </motion.aside>
  );
}

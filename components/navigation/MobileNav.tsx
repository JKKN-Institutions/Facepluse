'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, BarChart3, History, Trophy, Activity, Sparkles, Target, Film } from 'lucide-react';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
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
  {
    name: 'Emoji Challenge',
    href: '/challenge',
    icon: Target,
    description: 'Match emotions game'
  },
  {
    name: 'Time Capsule',
    href: '/timecapsule',
    icon: Film,
    description: 'Event recordings'
  },
];

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-white/95 backdrop-blur-2xl shadow-2xl z-50 flex flex-col lg:hidden border-r-2 border-emerald-100"
          >
            {/* Header with Gradient Background */}
            <div className="h-24 border-b-2 border-emerald-100/50 flex items-center justify-between px-6 relative overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-transparent to-transparent opacity-60" />

              {/* Logo Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3 relative z-10"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-12 h-12 bg-gradient-to-br from-green-400 via-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-emerald-lg relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  <Activity className="w-6 h-6 text-white relative z-10" strokeWidth={2.5} />
                </motion.div>

                <div className="flex flex-col">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 bg-clip-text text-transparent leading-tight">
                    FacePulse
                  </h1>
                  <p className="text-[10px] font-medium text-emerald-600/70 tracking-wider uppercase">
                  Live Facial Intelligence
                  </p>
                </div>
              </motion.div>

              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border border-red-200 transition-all relative z-10"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-red-600" strokeWidth={2.5} />
              </motion.button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto scrollbar-thin">
              {navigationItems.map((item, index) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <motion.button
                    key={item.href}
                    onClick={() => handleNavigate(item.href)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-emerald-lg'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 hover:shadow-md active:scale-95'
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="mobileActiveTab"
                        className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      className="relative z-10"
                    >
                      <Icon
                        className={`w-6 h-6 ${isActive ? 'drop-shadow-sm' : ''}`}
                        strokeWidth={2.5}
                      />
                    </motion.div>

                    {/* Text */}
                    <div className="flex flex-col items-start flex-1 relative z-10">
                      <span className={`font-semibold text-base leading-tight ${
                        isActive ? 'text-white' : 'text-gray-800'
                      }`}>
                        {item.name}
                      </span>
                      <span className={`text-xs font-medium ${
                        isActive ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </span>
                    </div>

                    {/* Sparkle indicator */}
                    {!isActive && (
                      <Sparkles className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity relative z-10" />
                    )}

                    {/* Active checkmark */}
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-white rounded-full relative z-10"
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

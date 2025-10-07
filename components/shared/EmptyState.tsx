'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6">
          <Icon className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        {action && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(action.href)}
            className="bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg font-semibold"
          >
            {action.label}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

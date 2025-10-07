'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
  };
}

export function PageHeader({ title, description, icon: Icon, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
          <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white px-6 py-3 rounded-xl shadow-lg font-semibold"
        >
          {action.icon && <action.icon className="w-5 h-5" />}
          {action.label}
        </motion.button>
      )}
    </div>
  );
}

'use client';

import { Menu } from 'lucide-react';

interface TopNavProps {
  onMobileMenuOpen: () => void;
}

export function TopNav({ onMobileMenuOpen }: TopNavProps) {
  return (
    <div className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200 px-6 flex items-center justify-between">
      {/* Left: Mobile Menu */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuOpen}
          className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
}

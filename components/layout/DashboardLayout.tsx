'use client'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      {/* Animated Background Orbs - Responsive */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 md:-top-40 -right-20 md:-right-40 w-40 h-40 md:w-80 md:h-80 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full blur-2xl md:blur-3xl animate-float" />
        <div className="absolute -bottom-20 md:-bottom-40 -left-20 md:-left-40 w-48 h-48 md:w-96 md:h-96 bg-gradient-to-br from-teal-400/20 to-green-500/20 rounded-full blur-2xl md:blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-96 md:h-96 bg-gradient-to-br from-lime-400/10 to-emerald-500/10 rounded-full blur-2xl md:blur-3xl animate-pulse" />
      </div>

      {/* Grid Pattern Overlay - Responsive */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:32px_32px] md:bg-[size:64px_64px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full">
        <main className="h-full overflow-auto">{children}</main>
      </div>
    </div>
  )
}

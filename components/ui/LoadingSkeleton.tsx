import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-lg bg-white/5',
        className
      )}
    />
  )
}

export function CameraLoadingSkeleton() {
  return (
    <div className="relative max-w-4xl mx-auto aspect-video rounded-3xl overflow-hidden border-2 border-purple-500/30 shadow-2xl bg-slate-900/50">
      <div className="absolute inset-0 animate-shimmer" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Initializing camera...</p>
        </div>
      </div>
    </div>
  )
}

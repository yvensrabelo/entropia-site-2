'use client'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-zinc-800'
  
  const variantClasses = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg'
  }
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  }
  
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={{
        width: width || (variant === 'circular' ? 40 : undefined),
        height: height || (variant === 'circular' ? 40 : undefined)
      }}
      aria-busy="true"
      aria-label="Carregando..."
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" />
          <Skeleton width="40%" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton />
        <Skeleton />
        <Skeleton width="80%" />
      </div>
      <Skeleton variant="rounded" height={40} />
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-4 p-4 bg-zinc-800 rounded-lg">
        <Skeleton width="30%" />
        <Skeleton width="20%" />
        <Skeleton width="30%" />
        <Skeleton width="20%" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-zinc-900 rounded-lg">
          <Skeleton width="30%" />
          <Skeleton width="20%" />
          <Skeleton width="30%" />
          <Skeleton width="20%" />
        </div>
      ))}
    </div>
  )
}
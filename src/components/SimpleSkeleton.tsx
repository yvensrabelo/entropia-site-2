'use client'

import React from 'react'

interface SimpleSkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
}

export function SimpleSkeleton({ 
  className = '',
  variant = 'rectangular',
  width,
  height
}: SimpleSkeletonProps) {
  const baseClasses = 'bg-zinc-800 animate-pulse'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  )
}

export function SimpleHeroSkeleton() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <SimpleSkeleton variant="text" height={80} width="80%" className="mx-auto" />
          <SimpleSkeleton variant="text" height={60} width="60%" className="mx-auto" />
        </div>
        
        <div className="space-y-3">
          <SimpleSkeleton variant="text" width="70%" className="mx-auto" />
          <SimpleSkeleton variant="text" width="50%" className="mx-auto" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <SimpleSkeleton variant="text" height={48} width="100%" />
              <SimpleSkeleton variant="text" width="60%" className="mx-auto" />
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <SimpleSkeleton variant="rounded" width={200} height={48} />
          <SimpleSkeleton variant="rounded" width={180} height={48} />
        </div>
      </div>
    </div>
  )
}

export default SimpleSkeleton
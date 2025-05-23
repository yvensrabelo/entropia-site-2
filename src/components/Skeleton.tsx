'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({ 
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-300%'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  }

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-gradient',
    none: ''
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  if (animation === 'wave') {
    return (
      <motion.div
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        style={style}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    )
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  )
}

// Specialized skeleton components
export function TextSkeleton({ 
  lines = 1, 
  className = '',
  width = '100%'
}: { 
  lines?: number
  className?: string
  width?: string | string[]
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={Array.isArray(width) ? width[i] || width[0] : width}
          className={i === lines - 1 ? 'w-3/4' : ''}
        />
      ))}
    </div>
  )
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-6 bg-zinc-900 border border-zinc-700 rounded-xl space-y-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" className="mt-2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="70%" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton variant="rounded" width={80} height={32} />
        <Skeleton variant="rounded" width={100} height={32} />
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
          <Skeleton variant="text" height={80} width="80%" className="mx-auto" />
          <Skeleton variant="text" height={60} width="60%" className="mx-auto" />
        </div>
        
        <div className="space-y-3">
          <Skeleton variant="text" width="70%" className="mx-auto" />
          <Skeleton variant="text" width="50%" className="mx-auto" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton variant="text" height={48} width="100%" />
              <Skeleton variant="text" width="60%" className="mx-auto" />
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Skeleton variant="rounded" width={200} height={48} />
          <Skeleton variant="rounded" width={180} height={48} />
        </div>
      </div>
    </div>
  )
}

export function NavbarSkeleton() {
  return (
    <div className="bg-black/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Skeleton variant="rounded" width={120} height={32} />
        
        <div className="hidden md:flex space-x-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="text" width={80} height={20} />
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <Skeleton variant="rounded" width={100} height={36} />
          <div className="md:hidden">
            <Skeleton variant="rounded" width={40} height={36} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton variant="text" width="30%" height={20} />
          <Skeleton variant="rounded" width="100%" height={44} />
        </div>
      ))}
      
      <div className="flex gap-4 pt-4">
        <Skeleton variant="rounded" width={120} height={44} />
        <Skeleton variant="rounded" width={100} height={44} />
      </div>
    </div>
  )
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4 
}: { 
  rows?: number
  columns?: number 
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" height={24} />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" height={20} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Skeleton
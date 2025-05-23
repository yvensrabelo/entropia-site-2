'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'
import { StatsCardProps } from '@/types/entropia'
import { cn } from '@/lib/utils'

interface ExtendedStatsCardProps extends StatsCardProps {
  animated?: boolean
  delay?: number
  size?: 'sm' | 'md' | 'lg'
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  className,
  animated = true,
  delay = 0,
  size = 'md'
}: ExtendedStatsCardProps) {
  
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8'
  }

  const valueSizes = {
    sm: 'text-xl md:text-2xl',
    md: 'text-2xl md:text-3xl',
    lg: 'text-3xl md:text-4xl'
  }

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-400" />
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-400" />
      default:
        return null
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-400'
      case 'down':
        return 'text-red-400'
      case 'stable':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  const cardContent = (
    <div className={cn(
      'bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl text-center hover:border-green-500/30 transition-all duration-300',
      sizeClasses[size],
      className
    )}>
      <div className="flex flex-col items-center space-y-2">
        {Icon && (
          <div className="p-2 rounded-full bg-white/10 text-green-400">
            <Icon className={iconSizes[size]} />
          </div>
        )}
        
        <div>
          <div className={cn('font-bold text-green-400', valueSizes[size])}>
            {value}
          </div>
          
          <div className="text-white text-sm font-medium">
            {title}
          </div>
          
          {subtitle && (
            <div className="text-gray-400 text-xs">
              {subtitle}
            </div>
          )}
          
          {trend && trendValue !== undefined && (
            <div className={cn('flex items-center justify-center gap-1 text-xs mt-1', getTrendColor())}>
              {getTrendIcon()}
              <span>{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay }}
        whileHover={{ 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
}
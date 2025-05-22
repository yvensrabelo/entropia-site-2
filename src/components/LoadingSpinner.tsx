'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'green' | 'gray' | 'white'
  message?: string
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'green', 
  message,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  const colorClasses = {
    green: 'border-green-500',
    gray: 'border-gray-400',
    white: 'border-white'
  }

  const textColorClasses = {
    green: 'text-green-600',
    gray: 'text-gray-400',
    white: 'text-white'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full`}
        />
        {message && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-sm font-medium ${textColorClasses[color]}`}
          >
            {message}
          </motion.span>
        )}
      </div>
    </div>
  )
}
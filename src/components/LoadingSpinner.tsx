'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
  color?: 'white' | 'green' | 'gray' | 'blue'
  text?: string
  fullScreen?: boolean
  overlay?: boolean
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  variant = 'spinner',
  color = 'green',
  text,
  fullScreen = false,
  overlay = false,
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const iconSizes = {
    xs: 12,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  }

  const colorClasses = {
    white: {
      spinner: 'text-white',
      dots: 'bg-white',
      pulse: 'bg-white',
      bars: 'bg-white',
      text: 'text-white/70'
    },
    green: {
      spinner: 'text-green-500',
      dots: 'bg-green-500',
      pulse: 'bg-green-500', 
      bars: 'bg-green-500',
      text: 'text-green-400'
    },
    gray: {
      spinner: 'text-gray-400',
      dots: 'bg-gray-400',
      pulse: 'bg-gray-400',
      bars: 'bg-gray-400',
      text: 'text-gray-400'
    },
    blue: {
      spinner: 'text-blue-500',
      dots: 'bg-blue-500',
      pulse: 'bg-blue-500',
      bars: 'bg-blue-500',
      text: 'text-blue-400'
    }
  }

  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 
              size={iconSizes[size]} 
              className={colorClasses[color].spinner} 
            />
          </motion.div>
        )
      
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`${sizeClasses[size]} ${colorClasses[color].dots} rounded-full`}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        )
      
      case 'pulse':
        return (
          <motion.div 
            className={`${sizeClasses[size]} ${colorClasses[color].pulse} rounded-full`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity
            }}
          />
        )
      
      case 'bars':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={`w-1 h-6 ${colorClasses[color].bars}`}
                animate={{
                  scaleY: [1, 2, 1]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1
                }}
              />
            ))}
          </div>
        )
      
      default:
        return null
    }
  }

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {renderSpinner()}
      {text && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`text-sm ${colorClasses[color].text}`}
        >
          {text}
        </motion.p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className={`
        fixed inset-0 flex items-center justify-center z-50
        ${overlay ? 'bg-black/50 backdrop-blur-sm' : ''}
      `}>
        {content}
      </div>
    )
  }

  return content
}

// Specialized loading components
export function ButtonSpinner({ size = 'sm' }: { size?: 'xs' | 'sm' | 'md' }) {
  return <LoadingSpinner size={size} variant="spinner" color="white" />
}

export function PageSpinner() {
  return (
    <LoadingSpinner 
      size="lg" 
      variant="spinner" 
      color="green" 
      text="Carregando..." 
      fullScreen 
      overlay 
    />
  )
}

export function CardSpinner({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="md" variant="spinner" color="green" text={text} />
    </div>
  )
}
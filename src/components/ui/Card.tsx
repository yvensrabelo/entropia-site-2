'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  hover?: boolean
  animated?: boolean
  loading?: boolean
}

const cardVariants = {
  default: 'bg-zinc-900 border border-zinc-700',
  elevated: 'bg-zinc-900 border border-zinc-700 shadow-xl',
  outlined: 'bg-transparent border-2 border-zinc-600',
  ghost: 'bg-zinc-800/50 border border-zinc-700/50'
}

const cardSizes = {
  sm: 'p-4 rounded-lg',
  md: 'p-6 rounded-xl', 
  lg: 'p-8 rounded-2xl'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    hover = false,
    animated = true,
    loading = false,
    children,
    ...props
  }, ref) => {
    const cardClass = cn(
      'transition-all duration-200',
      cardVariants[variant],
      cardSizes[size],
      hover && 'hover:border-zinc-600 hover:shadow-lg cursor-pointer',
      loading && 'opacity-60 pointer-events-none',
      className
    )

    const cardContent = loading ? (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-zinc-700 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-zinc-700 rounded"></div>
          <div className="h-3 bg-zinc-700 rounded w-5/6"></div>
        </div>
        <div className="h-8 bg-zinc-700 rounded w-1/2"></div>
      </div>
    ) : (
      children
    )


    return (
      <div ref={ref} className={cardClass} {...props}>
        {cardContent}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Subcomponentes do Card
export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-1.5 pb-4', className)}
      {...props}
    />
  )
)

CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold text-white', className)}
      {...props}
    />
  )
)

CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-gray-400', className)}
      {...props}
    />
  )
)

CardDescription.displayName = 'CardDescription'

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-4', className)}
      {...props}
    />
  )
)

CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('pt-4 flex items-center justify-between', className)}
      {...props}
    />
  )
)

CardFooter.displayName = 'CardFooter'

export default Card
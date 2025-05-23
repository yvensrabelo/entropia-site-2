'use client'

import React, { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  animated?: boolean
}

const buttonVariants = {
  primary: [
    'bg-green-600 text-white',
    'hover:bg-green-700 focus:ring-green-500',
    'shadow-md hover:shadow-lg'
  ].join(' '),
  
  secondary: [
    'bg-zinc-700 text-white',
    'hover:bg-zinc-600 focus:ring-zinc-500',
    'shadow-md hover:shadow-lg'
  ].join(' '),
  
  outline: [
    'border-2 border-green-600 text-green-600 bg-transparent',
    'hover:bg-green-600 hover:text-white focus:ring-green-500',
    'shadow-sm hover:shadow-md'
  ].join(' '),
  
  ghost: [
    'text-gray-300 bg-transparent',
    'hover:bg-zinc-800 hover:text-white focus:ring-zinc-500'
  ].join(' '),
  
  link: [
    'text-green-400 bg-transparent underline-offset-4',
    'hover:underline focus:ring-green-500'
  ].join(' '),
  
  destructive: [
    'bg-red-600 text-white',
    'hover:bg-red-700 focus:ring-red-500',
    'shadow-md hover:shadow-lg'
  ].join(' ')
}

const buttonSizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    animated = true,
    children,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    const buttonClass = cn(
      // Base styles
      'inline-flex items-center justify-center gap-2',
      'font-medium rounded-xl transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      
      // Variant styles
      buttonVariants[variant],
      
      // Size styles
      buttonSizes[size],
      
      // Width
      fullWidth && 'w-full',
      
      // Custom className
      className
    )

    const content = (
      <>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        
        {children}
        
        {!loading && rightIcon && rightIcon}
      </>
    )

    if (animated && !isDisabled) {
      return (
        <motion.button
          ref={ref}
          className={buttonClass}
          disabled={isDisabled}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98, y: 0 }}
          transition={{ duration: 0.1 }}
          {...props}
        >
          {content}
        </motion.button>
      )
    }

    return (
      <button
        ref={ref}
        className={buttonClass}
        disabled={isDisabled}
        {...props}
      >
        {content}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
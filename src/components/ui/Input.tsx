'use client'

import React, { forwardRef, useState } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'outlined' | 'filled'
  showPasswordToggle?: boolean
}

const inputSizes = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg'
}

const inputVariants = {
  default: [
    'bg-zinc-900 border border-zinc-700',
    'focus:border-green-500 focus:ring-1 focus:ring-green-500'
  ].join(' '),
  
  outlined: [
    'bg-transparent border-2 border-zinc-600',
    'focus:border-green-500 focus:ring-0'
  ].join(' '),
  
  filled: [
    'bg-zinc-800 border-0',
    'focus:bg-zinc-700 focus:ring-2 focus:ring-green-500'
  ].join(' ')
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    label,
    error,
    success,
    helperText,
    leftIcon,
    rightIcon,
    size = 'md',
    variant = 'default',
    type = 'text',
    showPasswordToggle = false,
    disabled,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [focused, setFocused] = useState(false)

    const inputType = type === 'password' && showPasswordToggle
      ? showPassword ? 'text' : 'password'
      : type

    const hasError = !!error
    const hasSuccess = !!success && !hasError
    const hasLeftIcon = !!leftIcon
    const hasRightIcon = !!rightIcon || showPasswordToggle || hasError || hasSuccess

    const inputClass = cn(
      // Base styles
      'w-full rounded-xl transition-all duration-200',
      'text-white placeholder:text-gray-400',
      'focus:outline-none',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      
      // Size
      inputSizes[size],
      
      // Variant styles
      inputVariants[variant],
      
      // Icons padding
      hasLeftIcon && 'pl-12',
      hasRightIcon && 'pr-12',
      
      // Error/Success states
      hasError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
      hasSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500',
      
      // Focus state
      focused && !hasError && !hasSuccess && 'border-green-500 ring-1 ring-green-500',
      
      className
    )

    const iconClass = cn(
      'absolute top-1/2 transform -translate-y-1/2 text-gray-400',
      size === 'sm' && 'w-4 h-4',
      size === 'md' && 'w-5 h-5',
      size === 'lg' && 'w-6 h-6'
    )

    return (
      <div className="space-y-2">
        {label && (
          <label className={cn(
            'block text-sm font-medium',
            hasError ? 'text-red-400' : hasSuccess ? 'text-green-400' : 'text-gray-300'
          )}>
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className={cn(iconClass, 'left-4')}>
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={inputType}
            className={inputClass}
            disabled={disabled}
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />
          
          <div className={cn(iconClass, 'right-4 flex items-center space-x-2')}>
            {showPasswordToggle && type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
            
            {hasError && (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            
            {hasSuccess && (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
            
            {rightIcon && !showPasswordToggle && !hasError && !hasSuccess && rightIcon}
          </div>
        </div>
        
        {(error || success || helperText) && (
          <div className="space-y-1">
            {error && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            )}
            
            {success && !error && (
              <p className="text-sm text-green-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {success}
              </p>
            )}
            
            {helperText && !error && !success && (
              <p className="text-sm text-gray-400">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
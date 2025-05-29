'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  isLoading?: boolean; // Alternate prop name for compatibility
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ 
    loading = false,
    isLoading = false,
    loadingText = 'Carregando...',
    children, 
    disabled,
    className = '',
    variant = 'primary',
    size = 'md',
    ...props 
  }, ref) => {
    // Extract custom props that shouldn't be passed to DOM
    const { 
      loading: _loading,
      isLoading: _isLoading,
      loadingText: _loadingText,
      variant: _variant,
      size: _size,
      ...buttonProps 
    } = props as any;

    // Support both loading and isLoading props
    const isCurrentlyLoading = loading || isLoading;

    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2.5'
    };

    const variantStyles = {
      primary: 'bg-[#3FA037] text-black hover:bg-[#358A2F] active:bg-[#2B7325] border border-[#3FA037]/20',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 active:bg-gray-800 border border-gray-500/20',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-red-500/20'
    };

    const roundedSize = {
      sm: 'rounded',
      md: 'rounded-md',
      lg: 'rounded-lg'
    };

    const iconSize = {
      sm: 'w-3.5 h-3.5',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isCurrentlyLoading}
        className={`
          ${baseStyles}
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${roundedSize[size]}
          ${className}
        `}
        {...buttonProps}
      >
        {isCurrentlyLoading ? (
          <>
            <Loader2 className={`${iconSize[size]} animate-spin`} />
            <span>{loadingText}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';
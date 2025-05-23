'use client'

import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  message?: string
  compact?: boolean
}

export function ErrorFallback({ 
  error, 
  resetError, 
  message = "Erro ao carregar componente",
  compact = false 
}: ErrorFallbackProps) {
  if (compact) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
        <span className="text-sm text-red-700">{message}</span>
        {resetError && (
          <button
            onClick={resetError}
            className="ml-2 text-red-600 hover:text-red-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 border border-zinc-700 rounded-xl">
      <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">
        {message}
      </h3>
      
      {process.env.NODE_ENV === 'development' && error && (
        <p className="text-sm text-gray-400 mb-4 text-center max-w-md">
          {error.message}
        </p>
      )}
      
      {resetError && (
        <button
          onClick={resetError}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar Novamente
        </button>
      )}
    </div>
  )
}

// Higher-order component for wrapping components with error handling
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  fallbackComponent?: React.ComponentType<ErrorFallbackProps>
) {
  const WithErrorBoundaryComponent = (props: P) => {
    const FallbackComponent = fallbackComponent || ErrorFallback

    return (
      <ErrorBoundaryWrapper
        fallback={<FallbackComponent />}
      >
        <WrappedComponent {...props} />
      </ErrorBoundaryWrapper>
    )
  }

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`

  return WithErrorBoundaryComponent
}

// Simple wrapper component
interface ErrorBoundaryWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

function ErrorBoundaryWrapper({ children, fallback }: ErrorBoundaryWrapperProps) {
  const [hasError, setHasError] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (hasError) {
      setHasError(false)
      setError(null)
    }
  }, [children])

  if (hasError) {
    return fallback || <ErrorFallback error={error || undefined} resetError={() => setHasError(false)} />
  }

  return (
    <React.Suspense fallback={<div className="animate-pulse">Carregando...</div>}>
      {children}
    </React.Suspense>
  )
}

export default ErrorFallback
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook para debounce de valores
 * @param value - Valor a ser debounced
 * @param delay - Delay em millisegundos
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup do timeout se o valor ou delay mudarem
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para debounce de callbacks
 * @param callback - Função a ser executada
 * @param delay - Delay em millisegundos
 * @param deps - Dependências do callback
 * @returns Função debounced
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    }) as T,
    [callback, delay, ...deps]
  )

  // Cleanup do timeout quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

/**
 * Hook para throttle de funções
 * @param callback - Função a ser executada
 * @param delay - Delay em millisegundos
 * @param deps - Dependências do callback
 * @returns Função throttled
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const lastCallTime = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const throttledCallback = useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastCall = now - lastCallTime.current

      if (timeSinceLastCall >= delay) {
        lastCallTime.current = now
        callback(...args)
      } else {
        // Se ainda não passou o tempo necessário, agenda para executar no futuro
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallTime.current = Date.now()
          callback(...args)
        }, delay - timeSinceLastCall)
      }
    }) as T,
    [callback, delay, ...deps]
  )

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttledCallback
}

/**
 * Hook para controlar search input com debounce
 * @param initialValue - Valor inicial
 * @param delay - Delay do debounce
 * @returns [searchTerm, debouncedSearchTerm, setSearchTerm, clearSearch]
 */
export function useSearch(initialValue: string = '', delay: number = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const debouncedSearchTerm = useDebounce(searchTerm, delay)

  const clearSearch = useCallback(() => {
    setSearchTerm('')
  }, [])

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    clearSearch,
    isSearching: searchTerm !== debouncedSearchTerm
  }
}

export default useDebounce
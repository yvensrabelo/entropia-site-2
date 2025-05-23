'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

/**
 * Hook para Intersection Observer API
 * @param options - Opções do IntersectionObserver
 * @returns [ref, isIntersecting, entry]
 */
export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false
}: UseIntersectionObserverOptions = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const elementRef = useRef<Element | null>(null)
  const frozen = useRef(false)

  const setRef = useCallback((element: Element | null) => {
    elementRef.current = element
  }, [])

  useEffect(() => {
    const element = elementRef.current

    if (!element || (frozen.current && freezeOnceVisible)) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting

        setEntry(entry)
        setIsIntersecting(isElementIntersecting)

        if (isElementIntersecting && freezeOnceVisible) {
          frozen.current = true
        }
      },
      { threshold, root, rootMargin }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, root, rootMargin, freezeOnceVisible])

  return [setRef, isIntersecting, entry] as const
}

/**
 * Hook para animações baseadas em scroll
 * @param options - Opções do observer
 * @returns [ref, isVisible]
 */
export function useScrollAnimation(options: UseIntersectionObserverOptions = {}) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true,
    ...options
  })

  return [ref, isIntersecting] as const
}

/**
 * Hook para lazy loading de imagens
 * @param src - URL da imagem
 * @param options - Opções do observer
 * @returns [ref, imageSrc, isLoaded]
 */
export function useLazyImage(
  src: string,
  options: UseIntersectionObserverOptions = {}
) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [isLoaded, setIsLoaded] = useState(false)
  
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0,
    freezeOnceVisible: true,
    ...options
  })

  useEffect(() => {
    if (isIntersecting && !imageSrc) {
      setImageSrc(src)
    }
  }, [isIntersecting, src, imageSrc])

  useEffect(() => {
    if (imageSrc) {
      const img = new Image()
      img.onload = () => setIsLoaded(true)
      img.onerror = () => setIsLoaded(false)
      img.src = imageSrc
    }
  }, [imageSrc])

  return [ref, imageSrc, isLoaded] as const
}

/**
 * Hook para infinite scroll
 * @param callback - Função a ser executada quando o elemento for visível
 * @param options - Opções do observer
 * @returns [ref, isLoading, setIsLoading]
 */
export function useInfiniteScroll(
  callback: () => void | Promise<void>,
  options: UseIntersectionObserverOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false)
  
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0,
    rootMargin: '100px',
    ...options
  })

  useEffect(() => {
    if (isIntersecting && !isLoading) {
      setIsLoading(true)
      
      const result = callback()
      
      if (result && typeof result.then === 'function') {
        result.finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    }
  }, [isIntersecting, isLoading, callback])

  return [ref, isLoading, setIsLoading] as const
}

/**
 * Hook para detectar quando múltiplos elementos estão visíveis
 * @param options - Opções do observer
 * @returns [addRef, removeRef, visibleElements]
 */
export function useMultipleIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
) {
  const [visibleElements, setVisibleElements] = useState<Set<Element>>(new Set())
  const elementsRef = useRef<Map<Element, boolean>>(new Map())
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target
          const isIntersecting = entry.isIntersecting

          elementsRef.current.set(element, isIntersecting)

          setVisibleElements(prev => {
            const newSet = new Set(prev)
            if (isIntersecting) {
              newSet.add(element)
            } else {
              newSet.delete(element)
            }
            return newSet
          })
        })
      },
      {
        threshold: 0.1,
        root: null,
        rootMargin: '0px',
        ...options
      }
    )

    return () => {
      observerRef.current?.disconnect()
    }
  }, [options])

  const addRef = useCallback((element: Element | null) => {
    if (element && observerRef.current) {
      observerRef.current.observe(element)
      elementsRef.current.set(element, false)
    }
  }, [])

  const removeRef = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element)
      elementsRef.current.delete(element)
      setVisibleElements(prev => {
        const newSet = new Set(prev)
        newSet.delete(element)
        return newSet
      })
    }
  }, [])

  return [addRef, removeRef, visibleElements] as const
}

export default useIntersectionObserver
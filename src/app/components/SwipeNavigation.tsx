'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SwipeRoute {
  path: string
  label: string
}

interface SwipeNavigationProps {
  children: React.ReactNode
  routes?: SwipeRoute[]
  enabled?: boolean
  threshold?: number
  showIndicators?: boolean
}

// Rotas principais da aplicação
const defaultRoutes: SwipeRoute[] = [
  { path: '/', label: 'Início' },
  { path: '/calculadora', label: 'Calculadora' },
  { path: '/materiais', label: 'Materiais' },
  { path: '/sobre', label: 'Sobre' },
  { path: '/contato', label: 'Contato' },
]

export default function SwipeNavigation({
  children,
  routes = defaultRoutes,
  enabled = true,
  threshold = 50,
  showIndicators = true,
}: SwipeNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Encontrar índice da rota atual
  const currentIndex = routes.findIndex(route => route.path === pathname)
  const canSwipeLeft = currentIndex > 0
  const canSwipeRight = currentIndex < routes.length - 1 && currentIndex !== -1

  const handleSwipe = useCallback((info: PanInfo) => {
    if (!enabled || isTransitioning || currentIndex === -1) return

    const swipeThreshold = threshold
    const velocity = info.velocity.x
    const offset = info.offset.x

    // Swipe para a direita (página anterior)
    if ((offset > swipeThreshold || velocity > 500) && canSwipeLeft) {
      setIsTransitioning(true)
      setDirection('right')
      const prevRoute = routes[currentIndex - 1]
      router.push(prevRoute.path)
      setTimeout(() => {
        setIsTransitioning(false)
        setDirection(null)
      }, 300)
    }
    // Swipe para a esquerda (próxima página)
    else if ((offset < -swipeThreshold || velocity < -500) && canSwipeRight) {
      setIsTransitioning(true)
      setDirection('left')
      const nextRoute = routes[currentIndex + 1]
      router.push(nextRoute.path)
      setTimeout(() => {
        setIsTransitioning(false)
        setDirection(null)
      }, 300)
    }
  }, [enabled, isTransitioning, currentIndex, canSwipeLeft, canSwipeRight, threshold, routes, router])

  // Prevenir swipe em elementos que não devem ter esse comportamento
  useEffect(() => {
    const preventSwipeElements = [
      'input',
      'textarea',
      'select',
      'button',
      '[data-no-swipe]',
      '.no-swipe',
    ]

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      const shouldPrevent = preventSwipeElements.some(selector => 
        target.matches(selector) || target.closest(selector)
      )
      
      if (shouldPrevent) {
        e.stopPropagation()
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { capture: true })
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart, { capture: true })
    }
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-screen">
      <motion.div
        drag={enabled && currentIndex !== -1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => handleSwipe(info)}
        className="relative"
        animate={{
          x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
          opacity: isTransitioning ? 0.5 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>

      {/* Indicadores de navegação */}
      {showIndicators && currentIndex !== -1 && (
        <>
          {/* Indicador esquerdo */}
          <AnimatePresence>
            {canSwipeLeft && !isTransitioning && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="fixed left-0 top-1/2 -translate-y-1/2 z-40 pointer-events-none"
              >
                <div className="bg-black/50 backdrop-blur-sm text-white p-3 rounded-r-lg flex items-center gap-2">
                  <ChevronLeft size={20} />
                  <span className="text-sm hidden sm:inline">{routes[currentIndex - 1]?.label}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Indicador direito */}
          <AnimatePresence>
            {canSwipeRight && !isTransitioning && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="fixed right-0 top-1/2 -translate-y-1/2 z-40 pointer-events-none"
              >
                <div className="bg-black/50 backdrop-blur-sm text-white p-3 rounded-l-lg flex items-center gap-2">
                  <span className="text-sm hidden sm:inline">{routes[currentIndex + 1]?.label}</span>
                  <ChevronRight size={20} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dots indicator */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-2">
            {routes.map((route, index) => (
              <div
                key={route.path}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-green-500 w-8' 
                    : 'bg-gray-400'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * Hook para detectar swipe gestures customizados
 */
export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold: number = 50
) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setTouchEnd(null)
      setTouchStart({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      })
    }

    const handleTouchMove = (e: TouchEvent) => {
      setTouchEnd({
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      })
    }

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return

      const distanceX = touchStart.x - touchEnd.x
      const distanceY = touchStart.y - touchEnd.y
      const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY)

      if (isHorizontalSwipe) {
        if (Math.abs(distanceX) > threshold) {
          if (distanceX > 0) {
            onSwipeLeft?.()
          } else {
            onSwipeRight?.()
          }
        }
      } else {
        if (Math.abs(distanceY) > threshold) {
          if (distanceY > 0) {
            onSwipeUp?.()
          } else {
            onSwipeDown?.()
          }
        }
      }
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [touchStart, touchEnd, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold])
}
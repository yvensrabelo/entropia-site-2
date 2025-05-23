'use client'

import React, { useEffect, useState, useCallback } from 'react'

/**
 * Hook customizado para detectar dispositivos móveis
 * Detecta tanto por user agent quanto por características de toque
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      // Detecção por user agent
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      
      // Regex patterns para detecção
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      const iosRegex = /iPhone|iPad|iPod/i
      const androidRegex = /Android/i
      
      const isMobileDevice = mobileRegex.test(userAgent)
      const isIOSDevice = iosRegex.test(userAgent)
      const isAndroidDevice = androidRegex.test(userAgent)
      
      // Detecção adicional por características
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const smallScreen = window.innerWidth <= 768
      
      setIsMobile(isMobileDevice || (hasTouch && smallScreen))
      setIsIOS(isIOSDevice)
      setIsAndroid(isAndroidDevice)
    }

    checkMobile()
    
    // Re-verificar ao redimensionar
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return { isMobile, isIOS, isAndroid }
}

/**
 * Hook para prevenir zoom indesejado em dispositivos móveis
 */
export function usePreventZoom(enabled: boolean = true) {
  const { isMobile } = useIsMobile()
  
  useEffect(() => {
    if (!enabled || !isMobile) return
    // Prevenir zoom por double tap
    let lastTouchEnd = 0
    
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now()
      if (now - lastTouchEnd <= 300) {
        e.preventDefault()
      }
      lastTouchEnd = now
    }

    // Prevenir zoom por pinch
    const preventPinchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault()
      }
    }

    // Prevenir zoom por atalhos de teclado
    const preventKeyboardZoom = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false })
    document.addEventListener('touchstart', preventPinchZoom, { passive: false })
    document.addEventListener('keydown', preventKeyboardZoom, { passive: false })

    return () => {
      document.removeEventListener('touchend', preventDoubleTapZoom)
      document.removeEventListener('touchstart', preventPinchZoom)
      document.removeEventListener('keydown', preventKeyboardZoom)
    }
  }, [enabled, isMobile])
}

/**
 * Hook para controlar pull-to-refresh
 */
export function usePullToRefreshControl(enabled: boolean = false) {
  const { isMobile } = useIsMobile()
  
  useEffect(() => {
    if (!isMobile) return
    
    if (!enabled) {
      // CSS para prevenir pull-to-refresh
      const style = document.createElement('style')
      style.innerHTML = `
        body {
          overscroll-behavior-y: contain;
        }
      `
      document.head.appendChild(style)

      // Prevenir o comportamento padrão do pull
      let startY = 0
      
      const handleTouchStart = (e: TouchEvent) => {
        startY = e.touches[0].pageY
      }
      
      const handleTouchMove = (e: TouchEvent) => {
        const y = e.touches[0].pageY
        // Prevenir scroll para cima quando já está no topo
        if (window.scrollY === 0 && y > startY) {
          e.preventDefault()
        }
      }

      document.addEventListener('touchstart', handleTouchStart, { passive: false })
      document.addEventListener('touchmove', handleTouchMove, { passive: false })

      return () => {
        document.removeEventListener('touchstart', handleTouchStart)
        document.removeEventListener('touchmove', handleTouchMove)
        style.remove()
      }
    }
  }, [enabled, isMobile])
}

interface MobileOptimizedProps {
  children: React.ReactNode
  preventZoom?: boolean
  allowPullToRefresh?: boolean
  className?: string
}

/**
 * Componente wrapper para otimizações mobile
 * 
 * @example
 * <MobileOptimized preventZoom>
 *   <YourApp />
 * </MobileOptimized>
 */
export default function MobileOptimized({ 
  children, 
  preventZoom = true,
  allowPullToRefresh = false,
  className = ''
}: MobileOptimizedProps) {
  const { isMobile } = useIsMobile()
  
  // Hooks devem ser chamados sempre, não condicionalmente
  usePreventZoom(preventZoom)
  usePullToRefreshControl(allowPullToRefresh)

  // Adicionar meta tags para prevenir zoom no viewport
  useEffect(() => {
    if (isMobile && preventZoom) {
      const metaViewport = document.querySelector('meta[name="viewport"]')
      if (metaViewport) {
        const originalContent = metaViewport.getAttribute('content') || ''
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
        
        return () => {
          metaViewport.setAttribute('content', originalContent)
        }
      }
    }
  }, [isMobile, preventZoom])

  return (
    <div 
      className={`mobile-optimized ${className}`}
      style={{
        // Prevenir seleção de texto acidental em mobile
        WebkitUserSelect: isMobile ? 'none' : 'auto',
        userSelect: isMobile ? 'none' : 'auto',
        // Melhorar performance de toque
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      {children}
    </div>
  )
}

/**
 * Componente para área scrollável otimizada
 * Útil para modais, drawers, etc.
 */
export function MobileScrollArea({ 
  children, 
  className = '',
  height = '100%'
}: {
  children: React.ReactNode
  className?: string
  height?: string
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      setIsScrolling(true)
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    element.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      element.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  return (
    <div
      ref={scrollRef}
      className={`mobile-scroll-area ${className} ${isScrolling ? 'is-scrolling' : ''}`}
      style={{
        height,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        scrollbarWidth: 'thin',
        msOverflowStyle: '-ms-autohiding-scrollbar',
      }}
    >
      {children}
    </div>
  )
}

/**
 * Hook para detectar orientação do dispositivo
 */
export function useDeviceOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      )
    }

    checkOrientation()
    
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)
    
    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  return orientation
}

/**
 * Hook para detectar teclado virtual aberto (útil para formulários)
 */
export function useVirtualKeyboard() {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const { isMobile } = useIsMobile()

  useEffect(() => {
    if (!isMobile) return

    const initialHeight = window.innerHeight
    
    const checkKeyboard = () => {
      const currentHeight = window.innerHeight
      const heightDiff = initialHeight - currentHeight
      
      if (heightDiff > 100) { // Teclado provavelmente aberto
        setIsKeyboardOpen(true)
        setKeyboardHeight(heightDiff)
      } else {
        setIsKeyboardOpen(false)
        setKeyboardHeight(0)
      }
    }

    window.addEventListener('resize', checkKeyboard)
    
    return () => {
      window.removeEventListener('resize', checkKeyboard)
    }
  }, [])

  return { isKeyboardOpen, keyboardHeight }
}
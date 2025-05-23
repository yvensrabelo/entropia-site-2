'use client'

import { useState, useEffect } from 'react'

/**
 * Hook para detectar se o dispositivo é mobile
 * @param breakpoint - Largura em pixels para considerar mobile (padrão: 768)
 * @returns boolean indicando se é mobile
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    // Função para verificar se é mobile
    const checkIsMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < breakpoint)
      }
    }

    // Verificação inicial
    checkIsMobile()

    // Listener para mudanças de tamanho
    const handleResize = () => {
      checkIsMobile()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [breakpoint])

  return isMobile
}

/**
 * Hook avançado para detectar diferentes breakpoints
 * @returns objeto com diferentes tamanhos de tela
 */
export function useBreakpoints() {
  const [breakpoints, setBreakpoints] = useState({
    isMobile: false,    // < 768px
    isTablet: false,    // 768px - 1024px  
    isDesktop: false,   // 1024px - 1280px
    isLarge: false      // > 1280px
  })

  useEffect(() => {
    const checkBreakpoints = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth
        
        setBreakpoints({
          isMobile: width < 768,
          isTablet: width >= 768 && width < 1024,
          isDesktop: width >= 1024 && width < 1280,
          isLarge: width >= 1280
        })
      }
    }

    checkBreakpoints()

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkBreakpoints)
      return () => window.removeEventListener('resize', checkBreakpoints)
    }
  }, [])

  return breakpoints
}

export default useIsMobile
'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

// Lazy loading components
const MatrixEffect = lazy(() => import('./components/MatrixEffect'))
const KnowledgeExplosion = lazy(() => import('./components/KnowledgeExplosion'))
const ConfettiEffect = lazy(() => import('./components/ConfettiEffect'))

// Performance utilities
const useDeviceCapabilities = () => {
  const [capabilities, setCapabilities] = useState({
    isLowEndDevice: false,
    supportsCSSProperties: true,
    maxParticles: 50
  })

  useEffect(() => {
    // Detect device capabilities
    const userAgent = navigator.userAgent.toLowerCase()
    const isLowEndDevice = /android.*version\/[0-4]|iphone.*os [0-9]_|ipad.*os [0-9]_/.test(userAgent)
    
    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 4
    
    // Check memory (if available)
    const memory = (navigator as any).deviceMemory || 4
    
    // Performance-based particle limits
    let maxParticles = 50
    if (cores < 4 || memory < 4 || isLowEndDevice) {
      maxParticles = 20
    }
    
    setCapabilities({
      isLowEndDevice: isLowEndDevice || cores < 4 || memory < 4,
      supportsCSSProperties: CSS.supports('backdrop-filter', 'blur(10px)'),
      maxParticles
    })
  }, [])

  return capabilities
}

// Throttled animation hook
const useThrottledAnimation = (callback: () => void, delay: number = 16) => {
  const lastRun = useRef(Date.now())
  
  const throttledCallback = useCallback(() => {
    if (Date.now() - lastRun.current >= delay) {
      callback()
      lastRun.current = Date.now()
    }
  }, [callback, delay])
  
  return throttledCallback
}

// Intersection Observer hook for lazy loading
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, { threshold: 0.1, ...options })

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return [ref, isIntersecting] as const
}

// Optimized video component with lazy loading
const LazyVideo = ({ src, className, ...props }: any) => {
  const [videoRef, isVisible] = useIntersectionObserver()
  const [loaded, setLoaded] = useState(false)
  const capabilities = useDeviceCapabilities()

  useEffect(() => {
    if (isVisible && !loaded) {
      setLoaded(true)
    }
  }, [isVisible, loaded])

  if (!loaded || capabilities.isLowEndDevice) {
    return (
      <div 
        ref={videoRef}
        className={`${className} bg-gradient-to-br from-gray-800 to-black flex items-center justify-center`}
        {...props}
      >
        <div className="text-gray-400 text-center">
          <div className="animate-pulse">📹</div>
          <p className="text-sm mt-2">Vídeo carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={videoRef} className={className}>
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="w-full h-full object-cover"
        onLoadedData={() => console.log('Video loaded')}
        {...props}
      >
        <source src={src} type="video/mp4" />
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
          <span className="text-gray-400">Seu navegador não suporta vídeo HTML5</span>
        </div>
      </video>
    </div>
  )
}

export default function PageNova() {
  const [mounted, setMounted] = useState(false)
  const [knowledgeExplosion, setKnowledgeExplosion] = useState(false)
  const [matrixMode, setMatrixMode] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [sequence, setSequence] = useState<string[]>([])
  const [logoClickCount, setLogoClickCount] = useState(0)
  
  const capabilities = useDeviceCapabilities()
  const prefersReducedMotion = useReducedMotion()
  
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']

  // Throttled scroll handler
  const handleScroll = useThrottledAnimation(() => {
    // Scroll-based animations here
  }, 32) // 30fps throttle

  useEffect(() => {
    setMounted(true)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Optimized Konami Code detection
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (capabilities.isLowEndDevice) return // Skip on low-end devices
    
    setSequence(prev => {
      const newSequence = [...prev, e.code].slice(-konamiCode.length)
      if (JSON.stringify(newSequence) === JSON.stringify(konamiCode)) {
        setKnowledgeExplosion(true)
        return []
      }
      return newSequence
    })
  }, [capabilities.isLowEndDevice])

  useEffect(() => {
    if (!mounted || capabilities.isLowEndDevice) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mounted, handleKeyDown, capabilities.isLowEndDevice])

  // Throttled logo click handler
  const handleLogoClick = useThrottledAnimation(() => {
    if (capabilities.isLowEndDevice) return
    
    setLogoClickCount(prev => {
      const newCount = prev + 1
      if (newCount === 5) {
        setMatrixMode(true)
        setTimeout(() => setMatrixMode(false), capabilities.isLowEndDevice ? 3000 : 10000)
        return 0
      }
      
      setTimeout(() => setLogoClickCount(0), 2000)
      return newCount
    })
  }, 200) // Throttle clicks

  // Memoized animation variants
  const animationVariants = useMemo(() => ({
    hero: prefersReducedMotion ? 
      { opacity: 1, y: 0 } : 
      { 
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: capabilities.isLowEndDevice ? 0.5 : 1 }
      },
    card: prefersReducedMotion ?
      {} :
      {
        whileHover: capabilities.isLowEndDevice ? {} : { y: -5, scale: 1.02 },
        transition: { duration: 0.2 }
      }
  }), [prefersReducedMotion, capabilities.isLowEndDevice])

  // Loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-500 text-2xl animate-pulse">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Lazy-loaded Effects */}
      {!capabilities.isLowEndDevice && (
        <>
          <Suspense fallback={null}>
            {knowledgeExplosion && (
              <KnowledgeExplosion 
                onComplete={() => setKnowledgeExplosion(false)}
                maxParticles={capabilities.maxParticles}
              />
            )}
          </Suspense>

          <Suspense fallback={null}>
            {matrixMode && (
              <MatrixEffect 
                maxParticles={Math.min(capabilities.maxParticles, 30)}
              />
            )}
          </Suspense>

          <Suspense fallback={null}>
            {showConfetti && (
              <ConfettiEffect 
                onComplete={() => setShowConfetti(false)}
                maxParticles={capabilities.maxParticles}
              />
            )}
          </Suspense>
        </>
      )}

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 p-4 ${
        capabilities.supportsCSSProperties 
          ? 'bg-black/50 backdrop-blur-md' 
          : 'bg-black/90'
      }`}>
        <div className="flex justify-between items-center">
          <motion.h1 
            className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent cursor-pointer"
            onClick={handleLogoClick}
            {...(prefersReducedMotion ? {} : { whileHover: { scale: 1.05 } })}
          >
            ENTROPIA
          </motion.h1>
          <div className="flex gap-6">
            <a href="#turmas" className="hover:text-green-400 transition-colors">Turmas</a>
            <a href="#materiais" className="hover:text-green-400 transition-colors">Materiais</a>
            <a href="#video" className="hover:text-green-400 transition-colors">Vídeo</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-emerald-900/20"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 90%)'
          }}
        />
        <motion.div 
          className="text-center z-10"
          {...animationVariants.hero}
        >
          <h1 className="text-6xl md:text-8xl font-black mb-8">
            <span className="block text-white">TRANSFORME</span>
            <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              SEU FUTURO
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl">
            O cursinho pré-vestibular com metodologia comprovada e resultados extraordinários
          </p>
          <motion.button
            className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-4 rounded-full font-bold text-lg"
            {...(prefersReducedMotion ? {} : {
              whileHover: { scale: 1.05 },
              whileTap: { scale: 0.95 }
            })}
          >
            Comece Agora
          </motion.button>
        </motion.div>
      </section>

      {/* Video Section with Lazy Loading */}
      <section id="video" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-black text-center mb-16 text-white">
            Conheça a <span className="text-green-400">Entropia</span>
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <LazyVideo
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
              className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl"
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12 text-center">
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">850+</div>
              <p className="text-gray-300">Aprovações em 2024</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">95%</div>
              <p className="text-gray-300">Taxa de Satisfação</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">15+</div>
              <p className="text-gray-300">Anos de Tradição</p>
            </div>
          </div>
        </div>
      </section>

      {/* Turmas */}
      <section id="turmas" className="py-20 bg-gray-100 text-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-black text-center mb-16">
            Nossas <span className="text-green-600">Turmas</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { nome: 'Intensivo PSC', desc: 'Preparação focada para UFAM', periodo: 'Manhã e Tarde', vagas: 40 },
              { nome: 'ENEM Total', desc: 'Curso completo para ENEM', periodo: 'Manhã', vagas: 35 },
              { nome: 'SIS/MACRO', desc: 'Preparação para UEA', periodo: 'Noite', vagas: 30 }
            ].map((turma, i) => (
              <motion.div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-lg"
                {...animationVariants.card}
              >
                <h3 className="text-2xl font-bold mb-4">{turma.nome}</h3>
                <p className="text-gray-600 mb-4">{turma.desc}</p>
                <div className="space-y-2 mb-6 text-sm">
                  <p><strong>Período:</strong> {turma.periodo}</p>
                  <p><strong>Vagas:</strong> {turma.vagas} disponíveis</p>
                </div>
                <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold w-full">
                  Saiba Mais
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Materiais */}
      <section id="materiais" className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-black text-center mb-16">
            Biblioteca <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Digital</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { tipo: 'Apostilas', count: '200+', icon: '📚' },
              { tipo: 'Vídeos', count: '1000+', icon: '🎥' },
              { tipo: 'Podcasts', count: '150+', icon: '🎧' },
              { tipo: 'Simulados', count: '500+', icon: '📝' }
            ].map((material, i) => (
              <motion.div
                key={i}
                className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-2xl border border-green-500/10"
                {...animationVariants.card}
              >
                <div className="text-3xl mb-3">{material.icon}</div>
                <h3 className="text-xl font-bold mb-2">{material.tipo}</h3>
                <p className="text-green-400 font-semibold">{material.count}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer com CTA */}
      <footer className="py-20 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-black mb-8 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            ENTROPIA
          </h3>
          <motion.button
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-12 py-4 rounded-full font-bold text-xl mb-8"
            onClick={() => !capabilities.isLowEndDevice && setShowConfetti(true)}
            {...(prefersReducedMotion ? {} : { whileHover: { scale: 1.05 } })}
          >
            🎯 GARANTIR MINHA APROVAÇÃO 🎓
          </motion.button>
          <p className="text-gray-400">
            © 2024 Entropia Cursinho. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Performance Info for Low-End Devices */}
      {capabilities.isLowEndDevice && (
        <div className="fixed top-20 right-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 max-w-xs">
          <p className="text-yellow-400 text-xs">
            ⚡ Modo otimizado ativado para melhor performance
          </p>
        </div>
      )}

      {/* Easter Eggs Instructions - Only on capable devices */}
      {!capabilities.isLowEndDevice && (
        <motion.div
          className="fixed bottom-8 right-8 bg-black/80 border border-green-500/20 rounded-xl p-4 max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 3 }}
        >
          <h4 className="text-green-400 font-bold text-sm mb-2">🎮 Easter Eggs</h4>
          <ul className="text-xs text-gray-300 space-y-1">
            <li>↑↑↓↓←→←→BA = Explosão</li>
            <li>5x no logo = Matrix</li>
            <li>Botão final = Confetti</li>
          </ul>
        </motion.div>
      )}
    </div>
  )
}
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import dynamic from 'next/dynamic'

// Importar componentes dinamicamente
const NavbarDiagonal = dynamic(() => import('./components/diagonal/NavbarDiagonal'), { 
  ssr: false 
})
const HeroSection = dynamic(() => import('./components/diagonal/HeroSection'), { 
  ssr: false 
})
const TurmasSection = dynamic(() => import('./components/diagonal/TurmasSection'), { 
  ssr: false 
})
const MateriaisSection = dynamic(() => import('./components/diagonal/MateriaisSection'), { 
  ssr: false 
})
const DiagonalDivider = dynamic(() => import('./components/diagonal/DiagonalDivider'), { 
  ssr: false 
})

// Cursor personalizado com rastro de partículas
function CustomCursor() {
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const springConfig = { damping: 25, stiffness: 700 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)
  
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([])
  const particleId = useRef(0)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      
      // Criar partículas no rastro
      if (Math.random() > 0.8) {
        const newParticle = {
          id: particleId.current++,
          x: e.clientX,
          y: e.clientY
        }
        setParticles(prev => [...prev, newParticle])
        
        // Remover partícula após animação
        setTimeout(() => {
          setParticles(prev => prev.filter(p => p.id !== newParticle.id))
        }, 1000)
      }
    }

    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [cursorX, cursorY])

  return (
    <>
      {/* Cursor principal */}
      <motion.div
        className="fixed w-6 h-6 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%'
        }}
      >
        <div className="w-full h-full bg-white rounded-full" />
      </motion.div>
      
      {/* Anel exterior */}
      <motion.div
        className="fixed w-10 h-10 pointer-events-none z-[9998] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%'
        }}
      >
        <div className="w-full h-full border-2 border-white rounded-full" />
      </motion.div>
      
      {/* Partículas do rastro */}
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="fixed w-2 h-2 bg-green-400 rounded-full pointer-events-none z-[9997]"
          initial={{ 
            x: particle.x - 4, 
            y: particle.y - 4,
            opacity: 1,
            scale: 1
          }}
          animate={{ 
            opacity: 0,
            scale: 0,
            x: particle.x - 4 + (Math.random() - 0.5) * 50,
            y: particle.y - 4 + (Math.random() - 0.5) * 50
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}
    </>
  )
}

// Sistema de som para interações
function SoundSystem() {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Criar contexto de áudio apenas no cliente
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    return () => {
      audioContextRef.current?.close()
    }
  }, [])

  const playHoverSound = () => {
    if (!audioContextRef.current) return
    
    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)
    
    oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContextRef.current.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0.05, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1)
    
    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + 0.1)
  }

  const playClickSound = () => {
    if (!audioContextRef.current) return
    
    const oscillator = audioContextRef.current.createOscillator()
    const gainNode = audioContextRef.current.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContextRef.current.destination)
    
    oscillator.frequency.setValueAtTime(400, audioContextRef.current.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(100, audioContextRef.current.currentTime + 0.15)
    
    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.15)
    
    oscillator.start(audioContextRef.current.currentTime)
    oscillator.stop(audioContextRef.current.currentTime + 0.15)
  }

  useEffect(() => {
    // Adicionar sons aos elementos interativos
    const addSoundToElements = () => {
      const buttons = document.querySelectorAll('button, a')
      
      buttons.forEach(button => {
        button.addEventListener('mouseenter', playHoverSound)
        button.addEventListener('click', playClickSound)
      })
      
      return () => {
        buttons.forEach(button => {
          button.removeEventListener('mouseenter', playHoverSound)
          button.removeEventListener('click', playClickSound)
        })
      }
    }

    // Aguardar um pouco para garantir que os elementos foram renderizados
    const timer = setTimeout(addSoundToElements, 1000)
    
    return () => clearTimeout(timer)
  }, [])

  return null
}

// Transição diagonal entre seções
function DiagonalTransition({ color = '#000000' }: { color?: string }) {
  return (
    <div className="relative h-32 -my-16">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0,0 L1200,100 L1200,100 L0,100 Z"
          fill={color}
        />
      </svg>
    </div>
  )
}

export default function PageNova() {
  const [mounted, setMounted] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Ocultar cursor padrão
    document.body.style.cursor = 'none'
    
    // Smooth scroll
    document.documentElement.style.scrollBehavior = 'smooth'
    
    return () => {
      document.body.style.cursor = 'auto'
      document.documentElement.style.scrollBehavior = 'auto'
    }
  }, [])

  // Aguardar hidratação completa
  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Cursor personalizado */}
      <CustomCursor />
      
      {/* Sistema de som */}
      {soundEnabled && <SoundSystem />}
      
      {/* Botão para habilitar som */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="fixed bottom-8 left-8 z-50 bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-full hover:bg-white/20 transition-all duration-300"
      >
        <motion.div
          animate={{ scale: soundEnabled ? 1 : 0.8 }}
          className="relative"
        >
          {soundEnabled ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </motion.div>
      </button>

      {/* Navbar */}
      <NavbarDiagonal />
      
      {/* Hero Section */}
      <section id="hero">
        <HeroSection />
      </section>
      
      {/* Transição diagonal para Turmas */}
      <DiagonalTransition color="#f3f4f6" />
      
      {/* Turmas Section */}
      <section id="turmas" className="relative">
        <TurmasSection />
      </section>
      
      {/* Transição diagonal para Materiais */}
      <DiagonalTransition color="#000000" />
      
      {/* Materiais Section */}
      <section id="materiais" className="relative">
        <MateriaisSection />
      </section>
      
      {/* Footer com transição diagonal */}
      <div className="relative">
        <DiagonalDivider position="top" color="#111827" height={150} />
        <footer className="bg-gray-900 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-4xl font-black mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              ENTROPIA
            </h3>
            <p className="text-gray-400 mb-8">
              Transformando sonhos em realidade acadêmica desde 2009
            </p>
            <div className="flex justify-center gap-6">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                YouTube
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-8">
              © 2024 Entropia Cursinho. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
      
      {/* Indicador de scroll */}
      <motion.div
        className="fixed bottom-8 right-8 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-3"
        >
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  )
}
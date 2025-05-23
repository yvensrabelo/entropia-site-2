'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import NavbarDiagonal from '../components/diagonal/NavbarDiagonal'
import HeroSection from '../components/diagonal/HeroSection'
import TurmasSection from '../components/diagonal/TurmasSection'
import MateriaisSection from '../components/diagonal/MateriaisSection'

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

export default function CleanPage() {
  const [mounted, setMounted] = useState(false)

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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-500 text-2xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Cursor personalizado */}
      <CustomCursor />
      
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
      
      {/* Footer */}
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
  )
}
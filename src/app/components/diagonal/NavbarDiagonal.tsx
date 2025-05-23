'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  vx: number
  vy: number
  life: number
  delay: number
}

export default function NavbarDiagonal() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const logoRef = useRef<HTMLDivElement>(null)
  const particleIdRef = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isHovering && logoRef.current) {
      const rect = logoRef.current.getBoundingClientRect()
      const newParticles: Particle[] = []

      for (let i = 0; i < 40; i++) {
        newParticles.push({
          id: particleIdRef.current++,
          x: rect.left + Math.random() * rect.width,
          y: rect.top + rect.height / 2,
          size: Math.random() * 4 + 2,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3 - 1,
          life: 1,
          delay: Math.random() * 0.2
        })
      }

      setParticles(prev => [...prev, ...newParticles])
    }
  }, [isHovering])

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => 
        prev
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.1,
            life: particle.life - 0.02
          }))
          .filter(particle => particle.life > 0)
      )
    }, 16)

    return () => clearInterval(interval)
  }, [])

  const navItems = [
    { href: '#inicio', label: 'Início' },
    { href: '#turmas', label: 'Turmas' },
    { href: '#materiais', label: 'Materiais' },
    { href: '#sobre', label: 'Sobre' },
    { href: '#contato', label: 'Contato' },
  ]

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-xl shadow-2xl border-b border-white/10' 
          : 'bg-white/5 backdrop-blur-md'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
        
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link 
              href="/" 
              className="relative group"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="relative">
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur-xl transition-all duration-500 ${
                  isHovering ? 'opacity-100 scale-150' : 'opacity-50 scale-100'
                }`} />
                
                {/* Logo container */}
                <div 
                  ref={logoRef}
                  className="relative bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 overflow-visible"
                >
                  <motion.span 
                    className="text-white font-black text-2xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent relative z-10"
                    animate={{
                      opacity: isHovering ? [1, 0.7, 1] : 1,
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: isHovering ? Infinity : 0,
                    }}
                  >
                    ENTROPIA
                  </motion.span>
                  
                  {/* Disintegration effect overlay */}
                  {isHovering && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 to-transparent animate-pulse" />
                    </motion.div>
                  )}
                </div>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-white/70 hover:text-white transition-all duration-300 font-medium group"
                >
                  <span className="relative z-10">{item.label}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 -m-2" />
                </Link>
              ))}
              <Link
                href="/matricula"
                className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5 group"
              >
                <span className="relative z-10">Matricule-se</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2 relative"
            >
              <div className="absolute inset-0 bg-white/10 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300" />
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10"
            >
              <div className="container mx-auto px-4 py-4 space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="block text-white/70 hover:text-white transition-colors font-medium py-3 px-4 rounded-lg hover:bg-white/5"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.1 }}
                >
                  <Link
                    href="/matricula"
                    className="block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-semibold text-center mt-4"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Matricule-se
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Particles layer */}
      <div className="fixed inset-0 pointer-events-none z-40">
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-gradient-to-r from-green-400 to-emerald-400"
              initial={{ 
                opacity: 0,
                scale: 0,
                x: particle.x,
                y: particle.y
              }}
              animate={{ 
                opacity: particle.life,
                scale: 1,
                x: particle.x,
                y: particle.y
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ 
                duration: 0.5,
                delay: particle.delay
              }}
              style={{
                width: particle.size,
                height: particle.size,
                filter: 'blur(1px)',
                boxShadow: `0 0 ${particle.size * 2}px rgba(16, 185, 129, 0.6)`
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
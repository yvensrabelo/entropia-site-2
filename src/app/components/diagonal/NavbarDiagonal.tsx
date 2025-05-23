'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NavbarDiagonal() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    if (typeof window !== 'undefined') {
      // Use passive listener for better performance
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileMenuOpen && !(event.target as Element).closest('nav')) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const target = document.getElementById(targetId.replace('#', ''))
    if (target) {
      const navHeight = 80 // navbar height
      const targetPosition = target.offsetTop - navHeight
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
    }
    setIsMobileMenuOpen(false)
  }

  const navItems = [
    { href: '#inicio', label: 'Início' },
    { href: '#turmas', label: 'Turmas' },
    { href: '#materiais', label: 'Materiais' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/contato', label: 'Contato' },
  ]

  // Loading state - prevent layout shift
  if (!mounted) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
        <div className="container mx-auto px-4 safe-area-x">
          <div className="flex items-center justify-between h-20">
            <div className="text-white font-black text-2xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              ENTROPIA
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <div className="w-20 h-6 bg-white/10 rounded animate-pulse"></div>
              <div className="w-20 h-6 bg-white/10 rounded animate-pulse"></div>
              <div className="w-20 h-6 bg-white/10 rounded animate-pulse"></div>
              <div className="w-20 h-6 bg-white/10 rounded animate-pulse"></div>
              <div className="w-24 h-8 bg-green-500/50 rounded-full animate-pulse"></div>
            </div>
            <div className="md:hidden w-8 h-8 bg-white/10 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 safe-area-top ${
        isScrolled 
          ? 'bg-black/98 backdrop-blur-xl shadow-2xl border-b border-white/20' 
          : 'bg-black/90 backdrop-blur-md'
      }`}>
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
        
        <div className="container mx-auto px-4 safe-area-x">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="relative group" aria-label="Entropia - Página inicial">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur-xl opacity-50 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500" />
                
                <div className="relative bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 group-hover:border-green-500/30 transition-colors">
                  <span className="text-white font-black text-2xl bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    ENTROPIA
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={item.href.startsWith('#') ? (e) => handleSmoothScroll(e, item.href) : undefined}
                  className="relative text-white/70 hover:text-white transition-all duration-300 font-medium group"
                >
                  <span className="relative z-10">{item.label}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 -m-2" />
                </Link>
              ))}
              <Link
                href="/matricula"
                className="relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5 hover:scale-105 group focus:outline-none focus:ring-2 focus:ring-green-500/50"
              >
                <span className="relative z-10">Matricule-se</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-white p-2 relative hover:bg-white/10 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <div className="relative w-6 h-6">
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10"
            >
              <div className="container mx-auto px-4 py-6 space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                  >
                    <Link
                      href={item.href}
                      onClick={item.href.startsWith('#') ? (e) => handleSmoothScroll(e, item.href) : () => setIsMobileMenuOpen(false)}
                      className="block text-white/70 hover:text-white transition-colors font-medium py-3 px-4 rounded-lg hover:bg-white/5 focus:outline-none focus:bg-white/10"
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navItems.length * 0.1, duration: 0.3 }}
                  className="pt-2"
                >
                  <Link
                    href="/matricula"
                    className="block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full font-semibold text-center mt-4 hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500/50"
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
    </>
  )
}
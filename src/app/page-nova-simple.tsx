'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PageNovaSimple() {
  const [mounted, setMounted] = useState(false)
  const [knowledgeExplosion, setKnowledgeExplosion] = useState(false)
  const [matrixMode, setMatrixMode] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [sequence, setSequence] = useState<string[]>([])
  const [logoClickCount, setLogoClickCount] = useState(0)

  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA']

  useEffect(() => {
    setMounted(true)
  }, [])

  // Konami Code
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      setSequence(prev => {
        const newSequence = [...prev, e.code].slice(-konamiCode.length)
        if (JSON.stringify(newSequence) === JSON.stringify(konamiCode)) {
          setKnowledgeExplosion(true)
          return []
        }
        return newSequence
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mounted])

  // Logo click counter
  const handleLogoClick = useCallback(() => {
    setLogoClickCount(prev => {
      const newCount = prev + 1
      if (newCount === 5) {
        setMatrixMode(true)
        setTimeout(() => setMatrixMode(false), 10000)
        return 0
      }
      
      setTimeout(() => setLogoClickCount(0), 2000)
      return newCount
    })
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-500 text-2xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Knowledge Explosion */}
      <AnimatePresence>
        {knowledgeExplosion && (
          <div className="fixed inset-0 pointer-events-none z-[10000]">
            {Array.from({ length: 30 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl font-bold"
                style={{
                  left: '50%',
                  top: '50%',
                  color: ['#10b981', '#34d399', '#6ee7b7'][i % 3]
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: 1,
                  opacity: 0,
                  x: (Math.random() - 0.5) * 800,
                  y: (Math.random() - 0.5) * 800,
                  rotate: 360
                }}
                transition={{ duration: 3, ease: "easeOut" }}
                onAnimationComplete={() => i === 0 && setKnowledgeExplosion(false)}
              >
                {['FÍSICA', 'MATEMÁTICA', 'QUÍMICA', 'BIOLOGIA', '🧠', '📚', '🎓'][i % 7]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Matrix Mode */}
      {matrixMode && (
        <div className="fixed inset-0 pointer-events-none z-[9999] bg-black/50">
          {Array.from({ length: 50 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute text-green-400 font-mono"
              style={{
                left: `${(i * 2) % 100}%`,
                fontSize: '14px'
              }}
              animate={{
                y: [0, window.innerHeight + 50],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "linear"
              }}
            >
              {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
            </motion.div>
          ))}
        </div>
      )}

      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-[10000]">
            {Array.from({ length: 50 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute text-2xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-50px'
                }}
                animate={{
                  y: window.innerHeight + 100,
                  rotate: 720,
                  opacity: [1, 1, 0]
                }}
                transition={{
                  duration: 4,
                  ease: "easeIn"
                }}
                onAnimationComplete={() => i === 0 && setShowConfetti(false)}
              >
                {['🎉', '🎊', '🎓', '📚', '🏆', '⭐'][i % 6]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md p-4">
        <div className="flex justify-between items-center">
          <motion.h1 
            className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent cursor-pointer"
            onClick={handleLogoClick}
            whileHover={{ scale: 1.05 }}
          >
            ENTROPIA
          </motion.h1>
          <div className="flex gap-6">
            <a href="#turmas" className="hover:text-green-400 transition-colors">Turmas</a>
            <a href="#materiais" className="hover:text-green-400 transition-colors">Materiais</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center relative">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-emerald-900/20"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 90%)'
          }}
        />
        <motion.div 
          className="text-center z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Comece Agora
          </motion.button>
        </motion.div>
      </section>

      {/* Turmas */}
      <section id="turmas" className="py-20 bg-gray-100 text-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-black text-center mb-16">
            Nossas <span className="text-green-600">Turmas</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { nome: 'Intensivo PSC', desc: 'Preparação focada para UFAM' },
              { nome: 'ENEM Total', desc: 'Curso completo para ENEM' },
              { nome: 'SIS/MACRO', desc: 'Preparação para UEA' }
            ].map((turma, i) => (
              <motion.div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-lg"
                whileHover={{ y: -5 }}
              >
                <h3 className="text-2xl font-bold mb-4">{turma.nome}</h3>
                <p className="text-gray-600 mb-6">{turma.desc}</p>
                <button className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold">
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
              { tipo: 'Apostilas', count: '200+' },
              { tipo: 'Vídeos', count: '1000+' },
              { tipo: 'Podcasts', count: '150+' },
              { tipo: 'Simulados', count: '500+' }
            ].map((material, i) => (
              <motion.div
                key={i}
                className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-6 rounded-2xl"
                whileHover={{ scale: 1.05 }}
              >
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
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowConfetti(true)}
          >
            🎯 GARANTIR MINHA APROVAÇÃO 🎓
          </motion.button>
          <p className="text-gray-400">
            © 2024 Entropia Cursinho. Todos os direitos reservados.
          </p>
        </div>
      </footer>

      {/* Easter Eggs Instructions */}
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
    </div>
  )
}
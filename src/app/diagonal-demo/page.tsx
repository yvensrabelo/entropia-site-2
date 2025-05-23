'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function DiagonalDemoPage() {
  const [currentTime, setCurrentTime] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section com Divisão Diagonal */}
      <section className="relative min-h-screen">
        {/* Fundo Diagonal */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"
            style={{
              clipPath: 'polygon(0 0, 100% 0, 100% 60%, 0 80%)'
            }}
          />
          <div 
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(0 80%, 100% 60%, 100% 100%, 0 100%)',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            }}
          />
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl md:text-9xl font-black mb-8">
              <span className="block text-white">ENTROPIA</span>
              <span className="block bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                DIAGONAL
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              Design experimental com elementos diagonais
            </p>
            <p className="text-sm text-gray-500">
              {currentTime} - yvens
            </p>
          </motion.div>
        </div>

        {/* Partículas Simples */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400 rounded-full"
              style={{
                left: `${(i * 5) % 100}%`,
                top: `${(i * 7) % 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3 + i % 3,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </section>

      {/* Grid Hexagonal Simplificado */}
      <section className="relative py-20">
        <h2 className="text-5xl font-black text-center mb-16">
          <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Turmas Hexagonais
          </span>
        </h2>
        
        <div className="flex justify-center items-center">
          <div className="relative w-64 h-64">
            <div 
              className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500"
              style={{
                clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)'
              }}
            >
              <div className="flex items-center justify-center h-full">
                <span className="text-2xl font-bold">PSC</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
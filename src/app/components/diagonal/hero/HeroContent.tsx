'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Target, Trophy } from 'lucide-react'
import Link from 'next/link'
// Removidos imports que não existem

interface HeroContentProps {
  className?: string
  primaryCTA?: {
    text: string
    href: string
  }
  secondaryCTA?: {
    text: string
    href: string
  }
  showStats?: boolean
}

export default function HeroContent({ 
  className = "",
  primaryCTA = { text: "Calcular Nota de Corte", href: "/calculadora" },
  secondaryCTA = { text: "Banco de Provas", href: "/banco-de-provas" },
  showStats = true
}: HeroContentProps) {
  return (
    <div className={`relative z-10 min-h-screen flex items-center py-12 md:py-20 ${className}`}>
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left Column - Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-medium backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" />
              2º lugar em aprovações Medicina UFAM
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-4">
              <div 
                className="relative hero-title-rotated"
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-center lg:text-left"
                >
                  <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-2">
                    SUA
                  </div>
                  <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-green-400 mb-2">
                    APROVAÇÃO
                  </div>
                  <div className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white">
                    COMEÇA AQUI
                  </div>
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="text-lg md:text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto lg:mx-0"
              >
                O cursinho que mais aprova em Manaus. Prepare-se para{' '}
                <span className="text-green-400 font-semibold">PSC UFAM</span>,{' '}
                <span className="text-green-400 font-semibold">ENEM</span>,{' '}
                <span className="text-green-400 font-semibold">SIS UEA</span> e{' '}
                <span className="text-green-400 font-semibold">MACRO</span>.
              </motion.p>
            </div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href={primaryCTA.href}>
                <button className="group px-8 py-4 text-lg font-semibold w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl">
                  <Target className="w-5 h-5 mr-2" />
                  {primaryCTA.text}
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </button>
              </Link>

              <Link href={secondaryCTA.href}>
                <button className="px-8 py-4 text-lg font-semibold w-full sm:w-auto border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300">
                  <Trophy className="w-5 h-5 mr-2" />
                  {secondaryCTA.text}
                </button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Column - Stats */}
          {showStats && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:justify-self-end"
            >
              <HeroStats />
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}

function HeroStats() {
  const stats = [
    {
      number: "2º",
      label: "Lugar em",
      sublabel: "Medicina UFAM",
      icon: Trophy,
      color: "text-green-400"
    },
    {
      number: "95%",
      label: "Taxa de",
      sublabel: "Aprovação",
      icon: Target,
      color: "text-blue-400"
    },
    {
      number: "15",
      label: "Anos de",
      sublabel: "Experiência",
      icon: Sparkles,
      color: "text-purple-400"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
          className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6 text-center hover:border-green-500/30 transition-all duration-300"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className={`p-2 rounded-full bg-white/10 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <div className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
                {stat.number}
              </div>
              <div className="text-white text-sm font-medium">
                {stat.label}
              </div>
              <div className="text-gray-400 text-xs">
                {stat.sublabel}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
'use client'

import React, { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Target, Trophy, Volume2, VolumeX } from 'lucide-react'
import { motion } from 'framer-motion'
import ParticleSystem from './ParticleSystem'

export default function HeroSection() {
  const [isMuted, setIsMuted] = useState(true)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)


  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Auto-play was blocked
      })
    }
  }, [isVideoLoaded])

  return (
    <section id="inicio" className="relative min-h-screen overflow-hidden bg-black">
      {/* Diagonal Split Background */}
      <div className="absolute inset-0">
        {/* Video Section - Upper Diagonal */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 65%, 0 85%)'
          }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover scale-110"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onLoadedData={() => setIsVideoLoaded(true)}
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4" type="video/mp4" />
            {/* Fallback para navegadores que não suportam video */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
          </video>
          
          {/* Dark overlay for video */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Gradient Section - Lower Diagonal */}
        <div 
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0 85%, 100% 65%, 100% 100%, 0 100%)',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)'
          }}
        />

        {/* Diagonal Edge Glow */}
        <div 
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0 83%, 100% 63%, 100% 67%, 0 87%)',
            background: 'linear-gradient(to right, rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.8))',
            filter: 'blur(20px)'
          }}
        />
      </div>

      {/* Particles */}
      <ParticleSystem />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Diagonal Title */}
            <div 
              className="relative mb-12"
              style={{
                transform: 'rotate(-5deg)',
                transformOrigin: 'center left'
              }}
            >
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-black">
                  <span className="block text-white drop-shadow-2xl">
                    TRANSFORME
                  </span>
                  <span className="block bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 bg-clip-text text-transparent animate-gradient bg-300% drop-shadow-2xl">
                    SEU FUTURO
                  </span>
                </h1>
              </motion.div>
            </div>

            {/* Info Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
                <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-4 py-1 mb-4">
                  <Sparkles className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium text-sm">+850 Aprovações</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Excelência Comprovada</h3>
                <p className="text-gray-300">15 anos transformando sonhos em realidade acadêmica</p>
              </div>

              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
                <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-4 py-1 mb-4">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium text-sm">98% Aprovação</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Método Eficaz</h3>
                <p className="text-gray-300">Preparação focada para PSC, ENEM, SIS e MACRO</p>
              </div>

              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
                <div className="inline-flex items-center gap-2 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-4 py-1 mb-4">
                  <Trophy className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium text-sm">1º Lugar</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Líder em Manaus</h3>
                <p className="text-gray-300">Referência em educação pré-vestibular no Amazonas</p>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                href="/matricula"
                className="group bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                Comece sua jornada
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/calculadora"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                Calcule suas chances
              </Link>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Video Control Button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-32 right-8 z-20 bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-full hover:bg-white/20 transition-all duration-300 group"
        aria-label={isMuted ? "Ativar som" : "Desativar som"}
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        ) : (
          <Volume2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Diagonal Pattern Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 35px,
              rgba(255, 255, 255, 0.05) 35px,
              rgba(255, 255, 255, 0.05) 70px
            )`
          }}
        />
      </div>
    </section>
  )
}
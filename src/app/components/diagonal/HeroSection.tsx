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
      <div className="relative z-10 min-h-screen flex items-center py-12 md:py-20">
        <div className="container mx-auto px-4 safe-area-x">
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
                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black">
                  <span className="block text-white drop-shadow-2xl">
                    TRANSFORME
                  </span>
                  <span className="block bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 bg-clip-text text-transparent animate-gradient bg-300% drop-shadow-2xl">
                    SEU FUTURO
                  </span>
                </h1>
              </motion.div>
            </div>

            {/* Info Cards - Stats Section */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20">
                <div className="mb-3">
                  <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-green-400 mb-2" />
                  <span className="text-green-400 font-black text-2xl md:text-3xl lg:text-4xl block">+850</span>
                </div>
                <h3 className="text-sm md:text-base font-semibold text-white mb-1">Aprovações</h3>
                <p className="text-gray-400 text-xs md:text-sm hidden sm:block">15 anos de excelência</p>
              </div>

              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20">
                <div className="mb-3">
                  <Target className="w-6 h-6 md:w-8 md:h-8 text-green-400 mb-2" />
                  <span className="text-green-400 font-black text-2xl md:text-3xl lg:text-4xl block">98%</span>
                </div>
                <h3 className="text-sm md:text-base font-semibold text-white mb-1">Taxa de Aprovação</h3>
                <p className="text-gray-400 text-xs md:text-sm hidden sm:block">Método comprovado</p>
              </div>

              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20 col-span-2 md:col-span-1">
                <div className="mb-3">
                  <Trophy className="w-6 h-6 md:w-8 md:h-8 text-green-400 mb-2" />
                  <span className="text-green-400 font-black text-2xl md:text-3xl lg:text-4xl block">#1</span>
                </div>
                <h3 className="text-sm md:text-base font-semibold text-white mb-1">Líder em Manaus</h3>
                <p className="text-gray-400 text-xs md:text-sm hidden sm:block">Referência no Amazonas</p>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                href="/matricula"
                className="group bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 sm:px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Comece sua jornada
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/calculadora"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 sm:px-8 py-4 rounded-full font-bold text-base sm:text-lg hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 text-center w-full sm:w-auto"
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
'use client'

import React from 'react'
import VideoBackgroundSSR from './hero/VideoBackgroundSSR'
import HeroContent from './hero/HeroContent'
import ParticleSystem from './ParticleSystem'
import { ChevronDown, GraduationCap } from 'lucide-react'
import Link from 'next/link'

export default function HeroSection() {

  return (
    <section id="inicio" className="relative min-h-screen bg-black">
      {/* Diagonal Split Background */}
      <div className="absolute inset-0">
        {/* Video Section - Upper Diagonal */}
        <div 
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 65%, 0 85%)'
          }}
        >
          <VideoBackgroundSSR 
            showMuteButton={true}
          />
        </div>

        {/* Gradient Section - Lower Diagonal */}
        <div 
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0 85%, 100% 65%, 100% 100%, 0 100%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-800" />
          
          {/* Particle System */}
          <ParticleSystem />
        </div>

        {/* Diagonal Pattern Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 49%, rgba(34, 197, 94, 0.1) 50%, transparent 51%),
                linear-gradient(-45deg, transparent 49%, rgba(34, 197, 94, 0.1) 50%, transparent 51%)
              `,
              backgroundSize: '40px 40px'
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <HeroContent showStats={false} />

      {/* Conheça nossas turmas - Na área diagonal */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
        <div className="relative h-32">
          {/* Posicionamento na linha diagonal */}
          <Link 
            href="#turmas" 
            className="absolute left-1/2 -translate-x-1/2 bottom-24 pointer-events-auto group"
          >
            <div className="flex flex-col items-center text-white hover:text-green-400 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5" />
                <span className="text-lg font-semibold">Conheça nossas turmas</span>
              </div>
              <div className="animate-bounce">
                <ChevronDown className="w-8 h-8" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
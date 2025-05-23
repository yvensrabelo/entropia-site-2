'use client'

import React from 'react'
import VideoBackgroundSimple from './hero/VideoBackgroundSimple'
import HeroContent from './hero/HeroContent'
import ParticleSystem from './ParticleSystem'

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
          <VideoBackgroundSimple 
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
      <HeroContent />
    </section>
  )
}
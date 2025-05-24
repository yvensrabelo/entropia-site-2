'use client'

import React from 'react'
import HeroSection from '../components/diagonal/HeroSection'
import TurmasSection from '../components/diagonal/TurmasSection'
import MateriaisSection from '../components/diagonal/MateriaisSection'
import Timestamp from '@/components/Timestamp'

export default function DiagonalPageClient() {
  return (
    <div className="bg-black pt-20">
      <HeroSection />
      <TurmasSection />
      <MateriaisSection />
      
      {/* Footer */}
      <footer className="bg-zinc-900 py-8 mt-20">
        <div className="container mx-auto px-4">
          <p className="text-sm sm:text-base text-gray-300 text-center max-w-3xl mx-auto">
            © 2024 Entropia Cursinho. Todos os direitos reservados. 
            Transformando sonhos em aprovações desde 2015.
          </p>
          <Timestamp />
        </div>
      </footer>
    </div>
  )
}
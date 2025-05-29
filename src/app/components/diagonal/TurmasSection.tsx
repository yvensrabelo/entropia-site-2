'use client'

import React from 'react'
import DiagonalDivider from './DiagonalDivider'
import TurmasCards from '@/components/TurmasCards'

export default function TurmasSection() {

  return (
    <section id="turmas" className="relative py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <DiagonalDivider position="top" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)`,
          backgroundSize: '100px 100px'
        }} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3 sm:mb-4">
            Escolha Seu <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Futuro</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Cursos preparatórios com aprovação garantida
          </p>
        </div>
        
        {/* Novos TurmasCards Estilo Descomplica */}
        <TurmasCards />
      </div>
      
      <DiagonalDivider position="bottom" />
    </section>
  )
}
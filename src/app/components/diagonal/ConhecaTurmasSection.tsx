'use client'

import React from 'react'
import { ArrowRight, GraduationCap, ChevronDown } from 'lucide-react'
import Link from 'next/link'

export default function ConhecaTurmasSection() {
  return (
    <section className="relative py-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 49%, rgba(34, 197, 94, 0.1) 50%, transparent 51%),
            linear-gradient(-45deg, transparent 49%, rgba(34, 197, 94, 0.1) 50%, transparent 51%)
          `,
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <GraduationCap className="w-8 h-8 text-green-600" />
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              Conheça nossas <span className="text-green-600">Turmas</span>
            </h2>
          </div>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Escolha o curso ideal para sua jornada rumo à aprovação. 
            Turmas com vagas limitadas e metodologia exclusiva!
          </p>

          {/* Animated Arrow */}
          <div className="flex justify-center mb-6">
            <div className="animate-bounce">
              <ChevronDown className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* CTA Button */}
          <Link 
            href="#turmas"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:shadow-green-500/30 hover:scale-105 transition-all duration-300"
          >
            Ver Todas as Turmas
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-green-600">850+</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Aprovações</h3>
            <p className="text-sm text-gray-600">Histórico comprovado de sucesso</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-green-600">10+</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Anos de Experiência</h3>
            <p className="text-sm text-gray-600">Metodologia aperfeiçoada</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-green-600">3</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Modalidades</h3>
            <p className="text-sm text-gray-600">PSC, ENEM e SIS/MACRO</p>
          </div>
        </div>
      </div>
    </section>
  )
}
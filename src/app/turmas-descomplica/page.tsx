'use client';

import React from 'react';
import TurmasCardUnified from '@/components/sections/TurmasCardUnified';

export default function TurmasDescomplica() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navigation */}
      <nav className="fixed top-4 left-4 z-50">
        <a 
          href="/" 
          className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white transition-all duration-300 shadow-lg"
        >
          ← Voltar ao Início
        </a>
      </nav>
      {/* Header */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
            Escolha Seu <span className="text-gradient">Futuro</span>
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Cursos preparatórios com aprovação garantida
          </p>
          <p className="text-lg text-gray-500">
            Mais de 850 aprovações em universidades públicas
          </p>
        </div>
      </section>

      {/* TurmasCards Component */}
      <TurmasCardUnified />
      
      {/* Footer Section */}
      <section className="py-16 px-6 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Dúvidas? Fale Conosco!
          </h2>
          <p className="text-gray-600 mb-8">
            Nossa equipe está pronta para te ajudar a escolher o melhor plano
          </p>
          <button className="btn-primary text-lg px-8 py-4">
            WhatsApp: (92) 99999-9999
          </button>
        </div>
      </section>
    </div>
  );
}
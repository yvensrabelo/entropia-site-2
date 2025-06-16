'use client';

import React from 'react';
import TurmasCardUnified from '@/components/sections/TurmasCardUnified';
import StudentCards from '@/components/sections/StudentCards';
import Layout from '@/components/Layout';
import { BookOpen, School, Calculator, Sparkles } from 'lucide-react';

// Componente HeroSection
const HeroSection = () => {
  const scrollToTurmas = () => {
    const turmasSection = document.getElementById('turmas-section-mobile');
    if (turmasSection) {
      turmasSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="mb-6">
        <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-semibold">
          <Sparkles className="w-4 h-4" />
          2º lugar em aprovações Medicina UFAM
        </span>
      </div>
      
      <h1 className="text-4xl lg:text-5xl font-black text-green-600 mb-6">
        Estude conosco
      </h1>
      
      <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
        Conheça nossos materiais e ferramentas gratuitas para turbinar sua preparação!
      </p>
      
      <div className="space-y-4">
        <button 
          className="w-full bg-green-600 text-white px-6 py-3 rounded-full font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          onClick={scrollToTurmas}
        >
          <School className="w-5 h-5" />
          Turmas Presenciais
        </button>
        <button 
          className="w-full bg-white text-gray-700 px-6 py-3 rounded-full font-bold border-2 border-gray-200 hover:border-green-600 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
          onClick={() => window.location.href = '/banco-de-provas'}
        >
          <BookOpen className="w-5 h-5" />
          Banco de Provas
        </button>
        <button 
          className="w-full bg-white text-gray-700 px-6 py-3 rounded-full font-bold border-2 border-gray-200 hover:border-green-600 hover:text-green-600 transition-colors flex items-center justify-center gap-2"
          onClick={() => window.location.href = '/calculadora'}
        >
          <Calculator className="w-5 h-5" />
          Calculadora de Notas
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <Layout>
      {/* Container principal */}
      <div className="container mx-auto px-4 py-8 pt-24">
        
        {/* DESKTOP: 3 COLUNAS LADO A LADO */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Coluna 1: Hero Section (Estude conosco) */}
          <div>
            <HeroSection />
          </div>
          
          {/* Coluna 2: Cards dos Alunos */}
          <div>
            <StudentCards />
          </div>
          
          {/* Coluna 3: Card de Turmas */}
          <div>
            <TurmasCardUnified />
          </div>
        </div>
        
        {/* MOBILE: Tudo empilhado */}
        <div className="lg:hidden space-y-6">
          <HeroSection />
          <StudentCards />
          <section id="turmas-section-mobile">
            <TurmasCardUnified />
          </section>
        </div>
        
      </div>
    </Layout>
  );
}
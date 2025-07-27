'use client';

import React from 'react';
import { Wrench, Calculator, FileText } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-600 flex items-center justify-center px-4">
      {/* Textura de fundo */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%)`,
        backgroundSize: '50px 50px'
      }}></div>

      {/* Container principal */}
      <div className="relative z-10 max-w-4xl w-full">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl text-center">
          
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <span className="text-white font-black text-4xl">E</span>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            ENTROPIA CURSINHO
          </h1>
          
          {/* Ícone de manutenção */}
          <div className="flex justify-center mb-6">
            <Wrench className="w-16 h-16 text-white/80 animate-spin-slow" />
          </div>

          {/* Mensagem */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Site em Manutenção
          </h2>
          
          <p className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Estamos trabalhando para trazer uma experiência ainda melhor para você. 
            Enquanto isso, você pode acessar nossas ferramentas disponíveis:
          </p>

          {/* Botões de acesso */}
          <div className="grid md:grid-cols-2 gap-4 max-w-lg mx-auto">
            {/* Calculadora */}
            <a href="/calculadora" className="group">
              <div className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl border border-white/30">
                <Calculator className="w-12 h-12 text-white mb-3 mx-auto" />
                <h3 className="text-white font-bold text-lg mb-2">Calculadora de Notas</h3>
                <p className="text-white/70 text-sm">Calcule suas chances de aprovação</p>
              </div>
            </a>

            {/* Banco de Provas */}
            <a href="/banco-de-provas" className="group">
              <div className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl border border-white/30">
                <FileText className="w-12 h-12 text-white mb-3 mx-auto" />
                <h3 className="text-white font-bold text-lg mb-2">Banco de Provas</h3>
                <p className="text-white/70 text-sm">Acesse provas anteriores</p>
              </div>
            </a>
          </div>

          {/* Contato */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-white/60 text-sm">
              Precisa de ajuda? Entre em contato conosco
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
              <a href="https://wa.me/5592984123771" className="text-white/80 hover:text-white transition-colors">
                📱 WhatsApp
              </a>
              <a href="mailto:contato@entropiacursinho.com" className="text-white/80 hover:text-white transition-colors">
                ✉️ E-mail
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CSS para animação lenta */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
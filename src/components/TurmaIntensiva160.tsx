'use client'

import React from 'react'

export default function TurmaIntensiva160() {
  return (
    <div className="relative group max-w-md mx-auto">
      {/* Efeito de glow suave */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-green-600 rounded-3xl blur-md opacity-25 group-hover:opacity-40 transition duration-500"></div>
      
      {/* Card principal */}
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header elegante */}
        <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 px-8 py-7 border-b border-gray-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-purple-50 rounded-full blur-3xl opacity-50"></div>
          <h3 className="relative text-2xl font-bold text-gray-800 tracking-tight">
            TURMA INTENSIVA 160
          </h3>
          <div className="relative flex items-center gap-3 mt-2">
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">ENEM</span>
            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">MACRO</span>
          </div>
        </div>

        {/* Lista de benefícios com novo design */}
        <div className="px-8 py-7 space-y-5">
          {/* Benefício 1 */}
          <div className="flex items-start gap-4 group/item">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-400 rounded-full blur-sm opacity-40"></div>
              <div className="relative w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all">
                <span className="text-white text-sm font-bold">✦</span>
              </div>
            </div>
            <p className="text-[15px] text-gray-700 leading-relaxed pt-1">
              AULAS DOS 160 PRINCIPAIS TÓPICOS ENEM
            </p>
          </div>

          {/* Benefício 2 */}
          <div className="flex items-start gap-4 group/item">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-400 rounded-full blur-sm opacity-40"></div>
              <div className="relative w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all">
                <span className="text-white text-sm font-bold">✦</span>
              </div>
            </div>
            <p className="text-[15px] text-gray-700 leading-relaxed pt-1">
              ACESSO À SALA DE ESTUDOS (9h-21h)
            </p>
          </div>

          {/* Benefício 3 */}
          <div className="flex items-start gap-4 group/item">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-400 rounded-full blur-sm opacity-40"></div>
              <div className="relative w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all">
                <span className="text-white text-sm font-bold">✦</span>
              </div>
            </div>
            <p className="text-[15px] text-gray-700 leading-relaxed pt-1">
              MATERIAL EXCLUSIVO INTENSIVA 160
            </p>
          </div>

          {/* Benefício 4 - com check */}
          <div className="flex items-start gap-4 group/item">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-sm opacity-40"></div>
              <div className="relative w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <p className="text-[15px] text-gray-700 leading-relaxed pt-1">
              AULAS DE REDAÇÃO
            </p>
          </div>

          {/* Benefício 5 - com check */}
          <div className="flex items-start gap-4 group/item">
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-sm opacity-40"></div>
              <div className="relative w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md group-hover/item:scale-110 transition-all">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <p className="text-[15px] text-gray-700 leading-relaxed pt-1">
              PROFESSORES DE ESCOLAS DE ELITE
            </p>
          </div>
        </div>

        {/* Botão redesenhado */}
        <div className="px-8 pb-8">
          <button className="w-full relative overflow-hidden rounded-xl group/btn transform transition-all hover:scale-[1.02] active:scale-[0.98]">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 transition-all"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
            <span className="relative flex items-center justify-center gap-3 px-6 py-4 text-white font-bold text-[15px] tracking-wide">
              RESERVAR MINHA VAGA
              <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
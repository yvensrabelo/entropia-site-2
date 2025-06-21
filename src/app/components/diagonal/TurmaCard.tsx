'use client'

import React, { useState } from 'react'
import { Clock, Users, Calendar, BookOpen, CheckCircle } from 'lucide-react'
import WhatsAppModal from './WhatsAppModal'

interface TurmaCardProps {
  title: string
  descricao?: string
  periodo?: string
  duracao?: string
  vagas?: number | string
  diferenciais?: string[]
  destaque?: string
  exibirPeriodo?: boolean
  exibirDuracao?: boolean
  exibirVagas?: boolean
  href?: string
  linkText?: string
  className?: string
  enableWhatsApp?: boolean
}

export default function TurmaCard({
  title,
  descricao,
  periodo,
  duracao,
  vagas,
  diferenciais,
  destaque,
  exibirPeriodo = true,
  exibirDuracao = true,
  exibirVagas = true,
  href = "/matricula",
  linkText = "RESERVAR MINHA VAGA",
  className = "",
  enableWhatsApp = true
}: TurmaCardProps) {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  
  return (
    <div className={`relative group ${className}`}>
      {/* Efeito de glow suave ao hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-green-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
      
      {/* Card principal */}
      <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
        {/* Header com gradiente sutil */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 px-8 py-6 border-b border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            {title}
          </h3>
          {destaque && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">{destaque}</span>
            </div>
          )}
          {descricao && (
            <p className="text-sm text-gray-600 mt-2">{descricao}</p>
          )}
        </div>

        {/* Lista de benefícios/diferenciais */}
        <div className="px-8 py-6 space-y-4">
          {/* Informações básicas primeiro */}
          {periodo && exibirPeriodo && (
            <div className="flex items-start gap-3 group/item">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform">
                <Clock className="w-3 h-3 text-purple-600" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                PERÍODO: {periodo.toUpperCase()}
              </p>
            </div>
          )}

          {duracao && exibirDuracao && (
            <div className="flex items-start gap-3 group/item">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform">
                <Calendar className="w-3 h-3 text-purple-600" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                DURAÇÃO: {duracao.toUpperCase()}
              </p>
            </div>
          )}

          {vagas && exibirVagas && (
            <div className="flex items-start gap-3 group/item">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform">
                <Users className="w-3 h-3 text-purple-600" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {typeof vagas === 'number' ? `${vagas} VAGAS DISPONÍVEIS` : vagas.toString().toUpperCase()}
              </p>
            </div>
          )}

          {/* Diferenciais */}
          {diferenciais && diferenciais.map((diferencial, idx) => (
            <div key={idx} className="flex items-start gap-3 group/item">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0 group-hover/item:scale-110 transition-transform">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {diferencial.toUpperCase()}
              </p>
            </div>
          ))}
        </div>

        {/* Botão de ação */}
        <div className="px-8 pb-8">
          {enableWhatsApp ? (
            <button 
              onClick={() => setShowWhatsAppModal(true)}
              className="w-full relative group/btn overflow-hidden rounded-xl"
            >
              {/* Gradiente animado de fundo */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 transition-all duration-300 group-hover/btn:from-green-700 group-hover/btn:to-emerald-700"></div>
              
              {/* Efeito de shine ao hover */}
              <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000"></div>
              </div>
              
              {/* Texto do botão */}
              <span className="relative flex items-center justify-center gap-2 px-6 py-4 text-white font-semibold text-sm tracking-wide">
                {linkText}
                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </span>
            </button>
          ) : (
            <a 
              href={href}
              className="w-full relative group/btn overflow-hidden rounded-xl block"
            >
              {/* Gradiente animado de fundo */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 transition-all duration-300 group-hover/btn:from-green-700 group-hover/btn:to-emerald-700"></div>
              
              {/* Efeito de shine ao hover */}
              <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000"></div>
              </div>
              
              {/* Texto do botão */}
              <span className="relative flex items-center justify-center gap-2 px-6 py-4 text-white font-semibold text-sm tracking-wide">
                {linkText}
                <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </span>
            </a>
          )}
        </div>

        {/* Detalhe decorativo no canto */}
        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-purple-100/50 to-green-100/50 rotate-45"></div>
        </div>
      </div>

      {/* Modal WhatsApp */}
      <WhatsAppModal 
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        turmaTitle={title}
        periodo={periodo}
        duracao={duracao}
        vagas={vagas}
      />
    </div>
  )
}
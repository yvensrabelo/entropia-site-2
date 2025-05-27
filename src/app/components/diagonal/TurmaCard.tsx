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
  linkText = "Saiba mais",
  className = "",
  enableWhatsApp = true
}: TurmaCardProps) {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  return (
    <div className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${className}`}>
      {/* Tag de destaque opcional */}
      {destaque && (
        <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold">
          {destaque}
        </div>
      )}
      
      <div className="p-4 sm:p-6 md:p-8">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{title}</h3>
        
        {descricao && (
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{descricao}</p>
        )}
        
        {/* Informações básicas - só renderiza se existir e estiver habilitado */}
        {((periodo && exibirPeriodo) || (duracao && exibirDuracao) || (vagas && exibirVagas)) && (
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            {periodo && exibirPeriodo && (
              <div className="flex items-center gap-3 text-gray-700">
                <div className="p-2 rounded-lg bg-green-50 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
                <span className="text-sm sm:text-base">Período: {periodo}</span>
              </div>
            )}
            
            {duracao && exibirDuracao && (
              <div className="flex items-center gap-3 text-gray-700">
                <div className="p-2 rounded-lg bg-green-50 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
                <span className="text-sm sm:text-base">Duração: {duracao}</span>
              </div>
            )}
            
            {vagas && exibirVagas && (
              <div className="flex items-center gap-3 text-gray-700">
                <div className="p-2 rounded-lg bg-green-50 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
                <span className="text-sm sm:text-base">
                  {typeof vagas === 'number' ? `${vagas} vagas disponíveis` : vagas}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Diferenciais - só renderiza se existir */}
        {diferenciais && diferenciais.length > 0 && (
          <div className="border-t pt-4 sm:pt-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-50 min-w-[44px] min-h-[44px] flex items-center justify-center">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              </div>
              <span className="text-base sm:text-lg">Diferenciais</span>
            </h4>
            <ul className="space-y-2 ml-2">
              {diferenciais.map((diferencial, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-600">
                  <div className="p-1.5 rounded-full bg-green-50 min-w-[32px] min-h-[32px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-sm sm:text-base">{diferencial}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {enableWhatsApp ? (
          <button 
            onClick={() => setShowWhatsAppModal(true)}
            className="block w-full mt-6 sm:mt-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 sm:py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 min-h-[44px] text-sm sm:text-base text-center"
          >
            {linkText}
          </button>
        ) : (
          <a 
            href={href} 
            className="block w-full mt-6 sm:mt-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 sm:py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 min-h-[44px] text-sm sm:text-base text-center"
          >
            {linkText}
          </a>
        )}
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
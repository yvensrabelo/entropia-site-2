'use client'

import React from 'react'
import { Clock, Users, Calendar, BookOpen, CheckCircle } from 'lucide-react'
import DiagonalDivider from './DiagonalDivider'

const turmas = [
  {
    nome: 'Intensivo PSC',
    descricao: 'Preparação focada para o Processo Seletivo Contínuo da UFAM',
    periodo: 'Manhã e Tarde',
    duracao: '6 meses',
    vagas: 40,
    diferenciais: [
      'Simulados semanais',
      'Material exclusivo',
      'Monitoria personalizada',
      'Revisões estratégicas'
    ],
    destaque: true
  },
  {
    nome: 'ENEM Total',
    descricao: 'Curso completo para conquistar sua vaga pelo ENEM',
    periodo: 'Manhã',
    duracao: '8 meses',
    vagas: 35,
    diferenciais: [
      'Redação nota 1000',
      'Questões comentadas',
      'Plantão de dúvidas',
      'Aulas de reforço'
    ]
  },
  {
    nome: 'SIS/MACRO',
    descricao: 'Preparação especializada para UEA e universidades privadas',
    periodo: 'Noite',
    duracao: '4 meses',
    vagas: 30,
    diferenciais: [
      'Foco em questões',
      'Professores especialistas',
      'Material atualizado',
      'Acompanhamento individual'
    ]
  }
]

export default function TurmasSectionOriginal() {
  return (
    <section id="turmas" className="relative py-20 bg-gray-50">
      <DiagonalDivider position="top" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Nossas <span className="text-green-600">Turmas</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Escolha o curso ideal para sua jornada rumo à aprovação
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {turmas.map((turma, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                turma.destaque ? 'ring-2 ring-green-500' : ''
              }`}
            >
              {turma.destaque && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold">
                  Mais procurado
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{turma.nome}</h3>
                <p className="text-gray-600 mb-6">{turma.descricao}</p>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-5 h-5 text-green-500" />
                    <span>Período: {turma.periodo}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-5 h-5 text-green-500" />
                    <span>Duração: {turma.duracao}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Users className="w-5 h-5 text-green-500" />
                    <span>{turma.vagas} vagas disponíveis</span>
                  </div>
                </div>
                
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-green-500" />
                    Diferenciais
                  </h4>
                  <ul className="space-y-2">
                    {turma.diferenciais.map((diferencial, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{diferencial}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button className="w-full mt-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300">
                  Saiba mais
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <DiagonalDivider position="bottom" />
    </section>
  )
}
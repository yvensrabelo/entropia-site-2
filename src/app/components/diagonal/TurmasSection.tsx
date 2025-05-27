'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Users, Calendar, BookOpen, CheckCircle } from 'lucide-react'
import DiagonalDivider from './DiagonalDivider'
import { supabase } from '@/lib/supabase-singleton'
import { Turma } from '@/lib/types/turma'

export default function TurmasSection() {
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTurmas()
  }, [])

  const fetchTurmas = async () => {
    try {
      const { data, error } = await supabase
        .from('turmas')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true })

      if (error) throw error
      setTurmas(data || [])
    } catch (error) {
      console.error('Erro ao buscar turmas:', error)
      // Fallback para dados estáticos em caso de erro
      setTurmas([
        {
          id: '1',
          nome: 'PSC Intensivo 2025',
          descricao: 'Preparação completa para o PSC UFAM com foco em aprovação',
          periodo: 'Janeiro a Novembro',
          duracao: '11 meses',
          vagas_disponiveis: 30,
          tipo: 'intensivo_psc',
          diferenciais: ['Material completo PSC', 'Simulados semanais', 'Monitoria diária', 'Aulas de redação'],
          ativo: true,
          ordem: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          nome: 'ENEM Total',
          descricao: 'Preparação completa para o ENEM com metodologia exclusiva',
          periodo: 'Fevereiro a Novembro',
          duracao: '10 meses',
          vagas_disponiveis: 40,
          tipo: 'enem_total',
          diferenciais: ['Correção de redações', 'Plataforma online', 'Aulões especiais', 'Material atualizado BNCC'],
          ativo: true,
          ordem: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          nome: 'SIS/MACRO Focado',
          descricao: 'Curso direcionado para medicina UEA',
          periodo: 'Março a Dezembro',
          duracao: '10 meses',
          vagas_disponiveis: 25,
          tipo: 'sis_macro',
          diferenciais: ['Professores especialistas', 'Material específico UEA', 'Simulados modelo SIS', 'Acompanhamento individual'],
          ativo: true,
          ordem: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="turmas" className="relative py-20 bg-gray-50">
      <DiagonalDivider position="top" />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-3 sm:mb-4">
            Nossas <span className="text-green-600">Turmas</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Escolha o curso ideal para sua jornada rumo à aprovação
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse">
              <div className="inline-block h-12 w-12 rounded-full bg-gray-300"></div>
              <p className="mt-4 text-gray-500">Carregando turmas...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {turmas.map((turma, index) => (
              <div
                key={turma.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                  index === 0 ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {index === 0 && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-xl text-sm font-semibold">
                    Mais procurado
                  </div>
                )}
                
                <div className="p-4 sm:p-6 md:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{turma.nome}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{turma.descricao}</p>
                  
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="p-2 rounded-lg bg-green-50 min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      </div>
                      <span className="text-sm sm:text-base">Período: {turma.periodo}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="p-2 rounded-lg bg-green-50 min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      </div>
                      <span className="text-sm sm:text-base">Duração: {turma.duracao}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <div className="p-2 rounded-lg bg-green-50 min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      </div>
                      <span className="text-sm sm:text-base">{turma.vagas_disponiveis} vagas disponíveis</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 sm:pt-6">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-green-50 min-w-[44px] min-h-[44px] flex items-center justify-center">
                        <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      </div>
                      <span className="text-base sm:text-lg">Diferenciais</span>
                    </h4>
                    <ul className="space-y-2 ml-2">
                      {turma.diferenciais.map((diferencial, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-600">
                          <div className="p-1.5 rounded-full bg-green-50 min-w-[32px] min-h-[32px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                          <span className="text-sm sm:text-base">{diferencial}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <a href="/matricula" className="block w-full mt-6 sm:mt-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 sm:py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 min-h-[44px] text-sm sm:text-base text-center">
                    Saiba mais
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <DiagonalDivider position="bottom" />
    </section>
  )
}
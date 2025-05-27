'use client'

import React, { useState, useEffect } from 'react'
import DiagonalDivider from './DiagonalDivider'
import TurmaCard from './TurmaCard'
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
          destaque: 'Mais procurado',
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
            Nossas <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Turmas</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Escolha o curso ideal para sua jornada rumo à aprovação
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-spin"></div>
              <p className="mt-4 text-gray-500 font-medium">Carregando turmas...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {turmas.map((turma, index) => (
              <TurmaCard
                key={turma.id}
                title={turma.nome}
                descricao={turma.descricao}
                periodo={turma.periodo}
                duracao={turma.duracao}
                vagas={turma.vagas_disponiveis}
                diferenciais={turma.diferenciais}
                destaque={turma.destaque || (index === 0 ? 'Mais procurado' : undefined)}
                exibirPeriodo={turma.exibir_periodo !== false}
                exibirDuracao={turma.exibir_duracao !== false}
                exibirVagas={turma.exibir_vagas !== false}
                className={index === 0 && !turma.destaque ? 'ring-2 ring-green-500' : ''}
              />
            ))}
          </div>
        )}
      </div>
      
      <DiagonalDivider position="bottom" />
    </section>
  )
}
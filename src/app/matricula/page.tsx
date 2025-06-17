'use client'

// Limpar cookies problemáticos
if (typeof window !== 'undefined') {
  try {
    // Limpar dados corrompidos do localStorage/sessionStorage
    const keysToCheck = ['sb-auth-token', 'supabase.auth.token']
    keysToCheck.forEach(key => {
      const value = localStorage.getItem(key)
      if (value && value.startsWith('base64-')) {
        console.warn(`Removendo cookie corrompido: ${key}`)
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Erro ao limpar cookies:', error)
  }
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Sun, Cloud, Moon, ArrowLeft, CheckCircle } from 'lucide-react'
import { turmasService } from '@/services/turmasService'
import type { TurmaSimples } from '@/lib/types/turma'

type Serie = '1' | '2' | '3' | 'formado'
type Turno = 'matutino' | 'vespertino' | 'noturno'
type Etapa = 'serie' | 'turno' | 'turmas'

export default function MatriculaPage() {
  const [etapa, setEtapa] = useState<Etapa>('serie')
  const [serieSelecionada, setSerieSelecionada] = useState<Serie | null>(null)
  const [turnoSelecionado, setTurnoSelecionado] = useState<Turno | null>(null)
  const [todasTurmas, setTodasTurmas] = useState<TurmaSimples[]>([])
  const [turmasFiltradas, setTurmasFiltradas] = useState<TurmaSimples[]>([])
  const [turnosDisponiveis, setTurnosDisponiveis] = useState<Turno[]>([])
  const [carregando, setCarregando] = useState(true)

  // Carregar TODAS as turmas ao iniciar
  useEffect(() => {
    const carregarTurmas = async () => {
      setCarregando(true)
      try {
        const turmas = await turmasService.listarTurmas(true) // apenas ativas
        console.log('✅ TODAS AS TURMAS:', turmas)
        setTodasTurmas(turmas)
      } catch (error) {
        console.error('❌ Erro ao carregar turmas:', error)
      } finally {
        setCarregando(false)
      }
    }
    carregarTurmas()
  }, [])

  // Quando selecionar série, descobrir turnos disponíveis
  useEffect(() => {
    if (serieSelecionada && todasTurmas.length > 0) {
      console.log(`[FILTRO] Buscando turmas para série:`, serieSelecionada)
      console.log(`🔍 Buscando turnos para série: ${serieSelecionada}`)
      
      // Filtrar turmas que atendem esta série
      const turmasDaSerie = todasTurmas.filter(turma => {
        console.log(`[FILTRO] ${turma.nome} - seriesAtendidas:`, turma.seriesAtendidas)
        
        // Verificar ambos os formatos por segurança  
        const atende = turma.seriesAtendidas?.includes(serieSelecionada) || 
                      (serieSelecionada === 'formado' && turma.seriesAtendidas?.includes('formado' as Serie)) ||
                      false
        
        console.log(`[FILTRO] ${turma.nome} atende ${serieSelecionada}?`, atende)
        console.log(`   - ${turma.nome}: seriesAtendidas=${JSON.stringify(turma.seriesAtendidas)} | Atende? ${atende}`)
        return atende
      })
      
      console.log(`[FILTRO] Turmas encontradas:`, turmasDaSerie)
      console.log(`📚 Turmas que atendem ${serieSelecionada}:`, turmasDaSerie)
      
      // Extrair turnos únicos
      const turnosSet = new Set<Turno>()
      turmasDaSerie.forEach(turma => {
        turma.turnos?.forEach(turno => turnosSet.add(turno))
      })
      
      const turnos = Array.from(turnosSet).sort()
      console.log(`🕐 Turnos disponíveis para ${serieSelecionada}:`, turnos)
      setTurnosDisponiveis(turnos)
    }
  }, [serieSelecionada, todasTurmas])

  // Quando selecionar turno, filtrar turmas
  useEffect(() => {
    if (serieSelecionada && turnoSelecionado && todasTurmas.length > 0) {
      console.log(`🎯 Filtrando turmas: série=${serieSelecionada}, turno=${turnoSelecionado}`)
      
      const filtradas = todasTurmas.filter(turma => {
        const atendeASerie = turma.seriesAtendidas?.includes(serieSelecionada) || false
        const atendeOTurno = turma.turnos?.includes(turnoSelecionado) || false
        const passa = atendeASerie && atendeOTurno
        
        console.log(`   - ${turma.nome}:`, {
          seriesAtendidas: turma.seriesAtendidas,
          atendeASerie,
          turnos: turma.turnos,
          atendeOTurno,
          resultado: passa ? '✅ PASSA' : '❌ NÃO PASSA'
        })
        
        return passa
      })
      
      console.log(`✅ TURMAS FILTRADAS:`, filtradas)
      setTurmasFiltradas(filtradas)
    }
  }, [serieSelecionada, turnoSelecionado, todasTurmas])

  const handleSelectSerie = (serie: Serie) => {
    console.log(`[SELEÇÃO] Série selecionada:`, serie)
    console.log(`[SELEÇÃO] Tipo da série:`, typeof serie)
    console.log(`🎓 Série selecionada: ${serie}`)
    setSerieSelecionada(serie)
    setTurnoSelecionado(null)
    setEtapa('turno')
  }

  const handleSelectTurno = (turno: Turno) => {
    console.log(`🕐 Turno selecionado: ${turno}`)
    setTurnoSelecionado(turno)
    setEtapa('turmas')
  }

  const voltarParaSeries = () => {
    setSerieSelecionada(null)
    setTurnoSelecionado(null)
    setEtapa('serie')
  }

  const voltarParaTurnos = () => {
    setTurnoSelecionado(null)
    setEtapa('turno')
  }

  // Componente de Seleção de Série
  const SelecaoSerie = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-white mb-4">ENTROPIA</h1>
        <div className="w-24 h-1 bg-white mx-auto mb-8"></div>
        <h2 className="text-3xl text-white/90">SELECIONE A SUA SÉRIE</h2>
        <div className="mt-6 text-white text-3xl animate-bounce">↓</div>
      </div>

      <div className="space-y-6">
        {/* Séries 1-3 */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-3">
          <div className="grid grid-cols-3 gap-3">
            {(['1', '2', '3'] as Serie[]).map((serie) => (
              <motion.button
                key={serie}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectSerie(serie)}
                className="py-6 px-4 rounded-2xl font-bold text-xl text-white bg-white/10 hover:bg-white/20 transition-all"
              >
                {serie}ª Série
              </motion.button>
            ))}
          </div>
        </div>

        {/* Já Formado */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSelectSerie('formado')}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 hover:from-orange-600 hover:to-red-600 transition-all"
        >
          <span className="text-2xl font-bold text-white">Já Formado</span>
        </motion.button>

        {/* Card Especial */}
        <div className="bg-white rounded-3xl p-10 text-center shadow-2xl">
          <h3 className="text-3xl font-black text-gray-800 mb-4">
            TURMAS ESPECIAIS
          </h3>
          <p className="text-gray-600 text-lg">Confira nossas turmas exclusivas após selecionar sua série</p>
        </div>
      </div>
    </motion.div>
  )

  // Componente de Seleção de Turno
  const SelecaoTurno = () => {
    const turnos: { value: Turno; label: string; icon: any; color: string }[] = [
      { value: 'matutino', label: 'Matutino', icon: Sun, color: 'from-yellow-400 to-orange-500' },
      { value: 'vespertino', label: 'Vespertino', icon: Cloud, color: 'from-orange-500 to-pink-500' },
      { value: 'noturno', label: 'Noturno', icon: Moon, color: 'from-blue-500 to-purple-600' }
    ]

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-4xl mx-auto"
      >
        <div className="text-center mb-10">
          <button
            onClick={voltarParaSeries}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <h2 className="text-4xl font-bold text-white mb-2">Selecione o Turno</h2>
          <p className="text-xl text-white/70">
            {serieSelecionada === 'formado' ? 'Já Formado' : `${serieSelecionada}ª Série`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {turnos.map((turno) => {
            const disponivel = turnosDisponiveis?.includes(turno.value) || false
            const Icon = turno.icon

            return (
              <motion.button
                key={turno.value}
                whileHover={disponivel ? { scale: 1.05 } : {}}
                whileTap={disponivel ? { scale: 0.95 } : {}}
                onClick={() => disponivel && handleSelectTurno(turno.value)}
                disabled={!disponivel}
                className={`relative p-10 rounded-3xl transition-all ${
                  disponivel
                    ? 'bg-gradient-to-br ' + turno.color + ' shadow-2xl cursor-pointer'
                    : 'bg-gray-800/50 cursor-not-allowed'
                }`}
              >
                {!disponivel && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-6 h-6 text-gray-500" />
                  </div>
                )}

                <div className={`flex flex-col items-center gap-4 ${!disponivel ? 'opacity-50' : ''}`}>
                  <Icon className="w-20 h-20 text-white" />
                  <span className="text-2xl font-bold text-white">
                    {turno.label}
                  </span>
                  {!disponivel && (
                    <span className="text-sm text-gray-400">
                      Não disponível
                    </span>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>

        {turnosDisponiveis.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-white/70">Nenhum turno disponível para esta série.</p>
          </div>
        )}
      </motion.div>
    )
  }

  // Componente de Lista de Turmas
  const ListaTurmas = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-6xl mx-auto"
    >
      <div className="text-center mb-10">
        <button
          onClick={voltarParaTurnos}
          className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>
        <h2 className="text-4xl font-bold text-white mb-2">Escolha sua Turma</h2>
        <p className="text-xl text-white/70">
          {serieSelecionada === 'formado' ? 'Já Formado' : `${serieSelecionada || ''}ª Série`} • {' '}
          {turnoSelecionado ? turnoSelecionado.charAt(0).toUpperCase() + turnoSelecionado.slice(1) : ''}
        </p>
      </div>

      {turmasFiltradas.length > 0 ? (
        <div className="grid gap-6">
          {turmasFiltradas.map((turma) => (
            <motion.div
              key={turma.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">{turma.nome || 'Turma'}</h3>
                  <p className="text-xl text-gray-600">{turma.foco || ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Mensalidade</p>
                  <p className="text-3xl font-bold text-green-600">
                    R$ {turma.precoMensal?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {turma.duracaoMeses || 12} meses
                  </p>
                </div>
              </div>

              {turma.beneficios && turma.beneficios.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Benefícios:</h4>
                  <div className="space-y-2">
                    {turma.beneficios?.map((beneficio, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 ${beneficio?.destaquePlatinado ? 'text-purple-600' : 'text-green-500'}`} />
                        <span className={`${beneficio?.destaquePlatinado ? 'font-bold text-purple-600' : 'text-gray-700'}`}>
                          {beneficio?.texto || ''}
                        </span>
                      </div>
                    )) || []}
                  </div>
                </div>
              )}

              <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 rounded-2xl hover:from-green-600 hover:to-blue-600 transition-all">
                RESERVAR MINHA VAGA
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/70 text-xl">
            Nenhuma turma disponível para esta combinação de série e turno.
          </p>
        </div>
      )}
    </motion.div>
  )

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-green-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-green-900 py-12 px-4">
      <AnimatePresence mode="wait">
        {etapa === 'serie' && <SelecaoSerie key="serie" />}
        {etapa === 'turno' && <SelecaoTurno key="turno" />}
        {etapa === 'turmas' && <ListaTurmas key="turmas" />}
      </AnimatePresence>
    </div>
  )
}
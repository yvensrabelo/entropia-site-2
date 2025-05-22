'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Plus, 
  Trash2, 
  BookOpen, 
  User, 
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Users,
  Calendar
} from 'lucide-react'

// Tipos
type Aula = {
  id: string
  professor: string
  materia: string
  tempo: string
  descricao: string
}

const TURMAS = [
  'T1 PREVEST (MATUTINO)',
  'T2 PREVEST (MATUTINO)', 
  'T1 PREVEST (VESPERTINO)',
  'T2 PREVEST (VESPERTINO)',
  'T1 TURMA SEGUNDO ANO (VESPERTINO)',
  'T1 TURMA PRIMEIRO ANO (VESPERTINO)',
  'T1 PREVEST (NOTURNO)',
  'TURMA Z'
]

const PROFESSORES = [
  'Prof. Anderson Silva',
  'Profa. Maria Santos',
  'Prof. João Oliveira', 
  'Profa. Ana Costa',
  'Prof. Carlos Lima',
  'Profa. Beatriz Rocha',
  'Prof. Ricardo Alves',
  'Profa. Fernanda Dias'
]

const MATERIAS = [
  'Matemática',
  'Português',
  'Física', 
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Literatura',
  'Inglês',
  'Filosofia',
  'Sociologia',
  'Redação'
]

const TEMPOS = [
  '1º TEMPO',
  '2º TEMPO',
  '3º TEMPO', 
  '4º TEMPO',
  '5º TEMPO',
  '6º TEMPO'
]

export default function RelatorioAulas() {
  const [turmaSelecionada, setTurmaSelecionada] = useState('')
  const [aulas, setAulas] = useState<Aula[]>([
    {
      id: '1',
      professor: '',
      materia: '',
      tempo: '',
      descricao: ''
    }
  ])
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [webhookMessage, setWebhookMessage] = useState('')

  const adicionarAula = () => {
    const novaAula: Aula = {
      id: Date.now().toString(),
      professor: '',
      materia: '',
      tempo: '',
      descricao: ''
    }
    setAulas([...aulas, novaAula])
  }

  const removerAula = (id: string) => {
    if (aulas.length > 1) {
      setAulas(aulas.filter(aula => aula.id !== id))
    }
  }

  const atualizarAula = (id: string, campo: keyof Aula, valor: string) => {
    setAulas(aulas.map(aula => 
      aula.id === id ? { ...aula, [campo]: valor } : aula
    ))
  }

  const enviarRelatorio = async () => {
    if (!turmaSelecionada) {
      setWebhookStatus('error')
      setWebhookMessage('Selecione uma turma primeiro!')
      setTimeout(() => {
        setWebhookStatus('idle')
        setWebhookMessage('')
      }, 3000)
      return
    }

    const aulasValidas = aulas.filter(aula => 
      aula.professor && aula.materia && aula.tempo && aula.descricao
    )

    if (aulasValidas.length === 0) {
      setWebhookStatus('error')
      setWebhookMessage('Preencha pelo menos uma aula completa!')
      setTimeout(() => {
        setWebhookStatus('idle')
        setWebhookMessage('')
      }, 3000)
      return
    }

    setWebhookStatus('loading')
    setWebhookMessage('')

    // Formatação para WhatsApp
    const mensagemFormatada = aulasValidas
      .map(aula => 
        `🔆 *${aula.tempo} (${aula.materia.toUpperCase()})*\n*_${aula.professor}_*\n"${aula.descricao}"`
      )
      .join('\n\n')

    try {
      const payload = {
        timestamp: new Date().toISOString(),
        action: 'relatorio_aulas',
        turma: turmaSelecionada,
        total_aulas: aulasValidas.length,
        mensagem_formatada: mensagemFormatada,
        aulas_detalhadas: aulasValidas.map(aula => ({
          professor: aula.professor,
          materia: aula.materia,
          tempo: aula.tempo,
          descricao: aula.descricao
        })),
        source: 'admin_panel'
      }

      const response = await fetch('https://n8n.cursoentropia.com/webhook-test/9a2ee02e-f9f3-4b79-951b-f7eeb0714b59', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setWebhookStatus('success')
        setWebhookMessage(`Relatório enviado com sucesso! ${aulasValidas.length} aula(s) para ${turmaSelecionada}`)
        
        // Salvar no localStorage para registros
        const novoRegistro = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          turma: turmaSelecionada,
          total_aulas: aulasValidas.length,
          status: 'enviado',
          mensagem: mensagemFormatada
        }
        
        const registrosExistentes = JSON.parse(localStorage.getItem('entropia_relatorios') || '[]')
        const novosRegistros = [novoRegistro, ...registrosExistentes].slice(0, 50) // Manter apenas os 50 mais recentes
        localStorage.setItem('entropia_relatorios', JSON.stringify(novosRegistros))
        
        // Limpar formulário após sucesso
        setTimeout(() => {
          setTurmaSelecionada('')
          setAulas([{
            id: '1',
            professor: '',
            materia: '',
            tempo: '',
            descricao: ''
          }])
        }, 2000)
      } else {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
    } catch (error) {
      setWebhookStatus('error')
      setWebhookMessage(error instanceof Error ? error.message : 'Erro desconhecido')
      
      // Salvar erro no localStorage também
      const registroErro = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        turma: turmaSelecionada,
        total_aulas: aulasValidas.length,
        status: 'erro',
        erro: error instanceof Error ? error.message : 'Erro desconhecido'
      }
      
      const registrosExistentes = JSON.parse(localStorage.getItem('entropia_relatorios') || '[]')
      const novosRegistros = [registroErro, ...registrosExistentes].slice(0, 50)
      localStorage.setItem('entropia_relatorios', JSON.stringify(novosRegistros))
    }

    setTimeout(() => {
      setWebhookStatus('idle')
      setWebhookMessage('')
    }, 5000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="mt-8 bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-green-500/30 p-8 shadow-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-500/20 p-3 rounded-2xl">
          <MessageSquare className="text-blue-400" size={28} />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">
            Relatório de <span className="text-green-400">Aulas</span>
          </h3>
          <p className="text-gray-400">Envie descrições das aulas para pais e alunos</p>
        </div>
      </div>

      {/* Seleção de Turma */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Users className="text-green-400" size={20} />
          <h4 className="text-lg font-semibold text-white">Para qual turma você gostaria de relatar?</h4>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {TURMAS.map((turma) => (
            <motion.button
              key={turma}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTurmaSelecionada(turma)}
              className={`p-3 rounded-2xl border-2 font-medium transition-all text-sm ${
                turmaSelecionada === turma
                  ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-orange-400/50 hover:bg-gray-600/50'
              }`}
            >
              {turma}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Formulário de Aulas */}
      <AnimatePresence>
        {turmaSelecionada && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-400" size={20} />
                <h4 className="text-lg font-semibold text-white">Turma: {turmaSelecionada}</h4>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={adicionarAula}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 hover:bg-green-500/30 transition-all"
              >
                <Plus size={18} />
                Adicionar Aula
              </motion.button>
            </div>

            <div className="space-y-6">
              {aulas.map((aula, index) => (
                <motion.div
                  key={aula.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-700/30 rounded-2xl p-6 border border-gray-600/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-yellow-500/20 p-2 rounded-xl">
                        <BookOpen className="text-yellow-400" size={18} />
                      </div>
                      <h5 className="text-white font-medium">Aula {index + 1}</h5>
                    </div>
                    
                    {aulas.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removerAula(aula.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Tempo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <Clock size={16} className="inline mr-1" />
                        Tempo
                      </label>
                      <select
                        value={aula.tempo}
                        onChange={(e) => atualizarAula(aula.id, 'tempo', e.target.value)}
                        className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                      >
                        <option value="">Selecione o tempo</option>
                        {TEMPOS.map((tempo) => (
                          <option key={tempo} value={tempo}>{tempo}</option>
                        ))}
                      </select>
                    </div>

                    {/* Professor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <User size={16} className="inline mr-1" />
                        Professor
                      </label>
                      <select
                        value={aula.professor}
                        onChange={(e) => atualizarAula(aula.id, 'professor', e.target.value)}
                        className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                      >
                        <option value="">Selecione o professor</option>
                        {PROFESSORES.map((professor) => (
                          <option key={professor} value={professor}>{professor}</option>
                        ))}
                      </select>
                    </div>

                    {/* Matéria */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <BookOpen size={16} className="inline mr-1" />
                        Matéria
                      </label>
                      <select
                        value={aula.materia}
                        onChange={(e) => atualizarAula(aula.id, 'materia', e.target.value)}
                        className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                      >
                        <option value="">Selecione a matéria</option>
                        {MATERIAS.map((materia) => (
                          <option key={materia} value={materia}>{materia}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descrição da Aula
                    </label>
                    <textarea
                      value={aula.descricao}
                      onChange={(e) => atualizarAula(aula.id, 'descricao', e.target.value)}
                      placeholder="Descreva o conteúdo ministrado na aula..."
                      rows={4}
                      className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors resize-none"
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Status do Webhook */}
            {webhookMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                  webhookStatus === 'success'
                    ? 'bg-green-900/50 border border-green-500/50 text-green-300'
                    : 'bg-red-900/50 border border-red-500/50 text-red-300'
                }`}
              >
                {webhookStatus === 'success' ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertCircle size={20} />
                )}
                <span>{webhookMessage}</span>
              </motion.div>
            )}

            {/* Botão Enviar */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={enviarRelatorio}
              disabled={webhookStatus === 'loading'}
              className="w-full mt-6 flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 disabled:from-gray-600 disabled:to-gray-500 text-white font-bold rounded-2xl transition-all shadow-lg disabled:cursor-not-allowed"
            >
              {webhookStatus === 'loading' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando relatório...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Enviar Relatório para {turmaSelecionada}
                </>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
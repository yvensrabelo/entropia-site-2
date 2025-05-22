'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  History, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Users,
  Eye,
  X,
  Copy,
  ExternalLink
} from 'lucide-react'

type Registro = {
  id: string
  timestamp: string
  turma: string
  total_aulas: number
  status: 'enviado' | 'erro'
  mensagem?: string
  erro?: string
}

export default function RegistrosRelatorios() {
  const [registros, setRegistros] = useState<Registro[]>([])
  const [registroSelecionado, setRegistroSelecionado] = useState<Registro | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)

  useEffect(() => {
    // Carregar registros do localStorage
    const carregarRegistros = () => {
      const registrosSalvos = localStorage.getItem('entropia_relatorios')
      if (registrosSalvos) {
        setRegistros(JSON.parse(registrosSalvos))
      }
    }

    carregarRegistros()
    
    // Atualizar registros a cada 5 segundos (caso novos sejam adicionados)
    const interval = setInterval(carregarRegistros, 5000)
    return () => clearInterval(interval)
  }, [])

  const formatarData = (timestamp: string) => {
    const data = new Date(timestamp)
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const copiarMensagem = (mensagem: string) => {
    navigator.clipboard.writeText(mensagem)
    // Você pode adicionar um toast aqui se quiser
  }

  const abrirModal = (registro: Registro) => {
    setRegistroSelecionado(registro)
    setMostrarModal(true)
  }

  const fecharModal = () => {
    setMostrarModal(false)
    setRegistroSelecionado(null)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="mt-8 bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-green-500/30 p-8 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-500/20 p-3 rounded-2xl">
            <History className="text-purple-400" size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">
              Histórico de <span className="text-green-400">Relatórios</span>
            </h3>
            <p className="text-gray-400">Últimos relatórios enviados</p>
          </div>
        </div>

        {registros.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-700/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <History className="text-gray-500" size={32} />
            </div>
            <p className="text-gray-400">Nenhum relatório enviado ainda</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {registros.map((registro, index) => (
              <motion.div
                key={registro.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-700/30 rounded-2xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${
                      registro.status === 'enviado' 
                        ? 'bg-green-500/20' 
                        : 'bg-red-500/20'
                    }`}>
                      {registro.status === 'enviado' ? (
                        <CheckCircle className="text-green-400" size={20} />
                      ) : (
                        <AlertCircle className="text-red-400" size={20} />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="text-blue-400" size={16} />
                        <span className="text-white font-medium">{registro.turma}</span>
                        <span className="text-gray-400 text-sm">
                          • {registro.total_aulas} aula{registro.total_aulas > 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock size={14} />
                        <span>{formatarData(registro.timestamp)}</span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          registro.status === 'enviado'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {registro.status === 'enviado' ? 'ENVIADO' : 'ERRO'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {registro.mensagem && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => copiarMensagem(registro.mensagem!)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all"
                        title="Copiar mensagem"
                      >
                        <Copy size={16} />
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => abrirModal(registro)}
                      className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/20 rounded-xl transition-all"
                      title="Ver detalhes"
                    >
                      <Eye size={16} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal de Detalhes */}
      <AnimatePresence>
        {mostrarModal && registroSelecionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={fecharModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gray-800 rounded-3xl border border-green-500/30 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    registroSelecionado.status === 'enviado' 
                      ? 'bg-green-500/20' 
                      : 'bg-red-500/20'
                  }`}>
                    {registroSelecionado.status === 'enviado' ? (
                      <CheckCircle className="text-green-400" size={24} />
                    ) : (
                      <AlertCircle className="text-red-400" size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Detalhes do Relatório</h3>
                    <p className="text-gray-400">{registroSelecionado.turma}</p>
                  </div>
                </div>
                
                <button
                  onClick={fecharModal}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/30 rounded-xl p-3">
                    <span className="text-gray-400 text-sm">Data/Hora</span>
                    <p className="text-white font-medium">{formatarData(registroSelecionado.timestamp)}</p>
                  </div>
                  <div className="bg-gray-700/30 rounded-xl p-3">
                    <span className="text-gray-400 text-sm">Total de Aulas</span>
                    <p className="text-white font-medium">{registroSelecionado.total_aulas}</p>
                  </div>
                </div>

                {registroSelecionado.status === 'enviado' && registroSelecionado.mensagem && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">Mensagem Enviada:</h4>
                      <button
                        onClick={() => copiarMensagem(registroSelecionado.mensagem!)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm"
                      >
                        <Copy size={14} />
                        Copiar
                      </button>
                    </div>
                    <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-600">
                      <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                        {registroSelecionado.mensagem}
                      </pre>
                    </div>
                  </div>
                )}

                {registroSelecionado.status === 'erro' && registroSelecionado.erro && (
                  <div>
                    <h4 className="text-red-400 font-medium mb-2">Erro:</h4>
                    <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                      <p className="text-red-300">{registroSelecionado.erro}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
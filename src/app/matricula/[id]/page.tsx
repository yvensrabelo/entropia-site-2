'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  GraduationCap, 
  Clock, 
  DollarSign, 
  FileText, 
  CheckCircle,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  BookOpen,
  Users,
  Trophy,
  Star,
  Send,
  MapPin,
  ArrowLeft
} from 'lucide-react'
import { useToast, ToastContainer } from '@/components/ui/toast'

interface TurmaCard {
  id: string;
  nome: string;
  descricao: string;
  turno: 'manhã' | 'tarde' | 'noite';
  tipo: 'psc' | 'enem' | 'intensivo' | 'militar';
  preco: number;
  destaque: boolean;
  ativa: boolean;
  ordem: number;
  cor: string;
}

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  escolaridade: string;
  objetivo: string;
  turma_id: string;
  turma_nome: string;
  valor_mensalidade: number;
}

export default function MatriculaTurmaPage() {
  const params = useParams()
  const router = useRouter()
  const turmaId = params?.id as string
  const { toasts, showToast, removeToast } = useToast()

  const [turma, setTurma] = useState<TurmaCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    escolaridade: '',
    objetivo: '',
    turma_id: '',
    turma_nome: '',
    valor_mensalidade: 0
  })
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const processos = [
    { nome: 'PSC UFAM', cor: 'bg-blue-100 text-blue-800' },
    { nome: 'SIS UEA', cor: 'bg-green-100 text-green-800' },
    { nome: 'ENEM', cor: 'bg-purple-100 text-purple-800' },
    { nome: 'MACRO', cor: 'bg-orange-100 text-orange-800' }
  ]

  useEffect(() => {
    loadTurma()
  }, [turmaId])

  const loadTurma = () => {
    try {
      const stored = localStorage.getItem('turmas_cards')
      if (stored) {
        const allTurmas: TurmaCard[] = JSON.parse(stored)
        const turmaEncontrada = allTurmas.find(t => t.id === turmaId && t.ativa)
        
        if (turmaEncontrada) {
          setTurma(turmaEncontrada)
          setFormData(prev => ({
            ...prev,
            turma_id: turmaEncontrada.id,
            turma_nome: turmaEncontrada.nome,
            valor_mensalidade: turmaEncontrada.preco
          }))
        } else {
          // Turma não encontrada ou inativa
          router.push('/matricula')
        }
      } else {
        router.push('/matricula')
      }
    } catch (error) {
      console.error('Erro ao carregar turma:', error)
      router.push('/matricula')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    
    // Adicionar timestamp aos dados
    const dadosCompletos = {
      ...formData,
      timestamp: new Date().toISOString(),
      data_envio: new Date().toLocaleString('pt-BR'),
      origem: 'site_matricula_individual'
    }

    try {
      const response = await fetch('/api/matricula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosCompletos)
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      // Sucesso
      setEnviando(false)
      setSucesso(true)
      
      // Mostrar toast de sucesso
      showToast(
        'Matrícula enviada com sucesso! Entraremos em contato em breve.',
        'success',
        8000
      )
      
      // Reset após 8 segundos
      setTimeout(() => {
        setSucesso(false)
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          escolaridade: '',
          objetivo: '',
          turma_id: turma?.id || '',
          turma_nome: turma?.nome || '',
          valor_mensalidade: turma?.preco || 0
        })
      }, 8000)
      
    } catch (error) {
      console.error('Erro ao enviar matrícula:', error)
      setEnviando(false)
      
      // Mostrar toast de erro
      showToast(
        'Erro ao enviar matrícula. Tente novamente.',
        'error',
        8000
      )
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="text-gray-600">Carregando dados da turma...</span>
        </div>
      </div>
    )
  }

  if (!turma) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Turma não encontrada</h1>
          <p className="text-gray-600 mb-6">A turma selecionada não está mais disponível.</p>
          <button
            onClick={() => router.push('/matricula')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Ver todas as turmas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Botão Voltar */}
          <button
            onClick={() => router.push('/matricula')}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            Voltar para todas as turmas
          </button>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Matrícula <span className="text-green-600">2025</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
              Complete sua matrícula na turma selecionada e garante sua vaga no melhor cursinho pré-vestibular de Manaus.
            </p>

            {/* Card da Turma Selecionada */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <div 
                className="rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden"
                style={{ backgroundColor: turma.cor }}
              >
                {turma.destaque && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                    DESTAQUE
                  </div>
                )}
                
                <h2 className="text-3xl font-bold mb-4">{turma.nome}</h2>
                <p className="text-lg opacity-90 mb-6">{turma.descricao}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-lg font-bold">Turno</div>
                    <div className="text-sm opacity-75 capitalize">{turma.turno}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold">Foco</div>
                    <div className="text-sm opacity-75">{turma.tipo.toUpperCase()}</div>
                  </div>
                  <div className="text-center col-span-2 md:col-span-1">
                    <div className="text-lg font-bold">Mensalidade</div>
                    <div className="text-2xl font-bold">R$ {turma.preco}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats de Aprovação */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {[
              { number: '850+', label: 'Aprovados', icon: Trophy },
              { number: '127', label: 'UEA 2024', icon: GraduationCap },
              { number: '92%', label: 'Satisfação', icon: Star },
              { number: '4', label: 'Anos', icon: Clock },
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-green-600" size={32} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Formulário de Matrícula */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Formulário de Matrícula
          </h3>

          {sucesso ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <CheckCircle className="text-green-600 w-16 h-16 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                Matrícula enviada com sucesso!
              </h4>
              <p className="text-gray-600 mb-4">
                Entraremos em contato em breve para finalizar sua matrícula na turma <strong>{turma.nome}</strong>.
              </p>
              <div className="bg-green-50 p-6 rounded-lg text-left max-w-md mx-auto">
                <h5 className="font-semibold text-green-800 mb-3">Próximos passos:</h5>
                <ul className="text-green-700 text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    Análise da sua solicitação
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    Contato via WhatsApp em até 24h
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    Agendamento de entrevista
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={16} />
                    Finalização da matrícula
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                  <strong className="text-green-800">Turma selecionada:</strong>
                  <div className="text-green-700">{turma.nome}</div>
                  <div className="text-green-600 text-sm">R$ {turma.preco}/mês</div>
                </div>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campos Hidden com dados da turma */}
              <input type="hidden" name="turma_id" value={formData.turma_id} />
              <input type="hidden" name="turma_nome" value={formData.turma_nome} />
              <input type="hidden" name="valor_mensalidade" value={formData.valor_mensalidade} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-mail *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="tel"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="(92) 99999-9999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Escolaridade *
                  </label>
                  <select
                    name="escolaridade"
                    value={formData.escolaridade}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    <option value="2ano">Cursando 2º ano</option>
                    <option value="3ano">Cursando 3º ano</option>
                    <option value="formado">Ensino médio completo</option>
                    <option value="superior">Ensino superior</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objetivo principal
                </label>
                <select
                  name="objetivo"
                  value={formData.objetivo}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  <option value="medicina">Medicina</option>
                  <option value="direito">Direito</option>
                  <option value="engenharia">Engenharia</option>
                  <option value="psicologia">Psicologia</option>
                  <option value="pedagogia">Pedagogia</option>
                  <option value="outros">Outros cursos</option>
                </select>
              </div>

              {/* Resumo da Matrícula */}
              <div className="bg-green-50 p-6 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-4">Resumo da Matrícula</h4>
                <div className="space-y-2 text-green-700">
                  <div className="flex justify-between">
                    <span>Turma:</span>
                    <span className="font-medium">{turma.nome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Turno:</span>
                    <span className="font-medium capitalize">{turma.turno}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Foco:</span>
                    <span className="font-medium">{turma.tipo.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
                    <span className="font-semibold">Mensalidade:</span>
                    <span className="font-bold text-lg">R$ {turma.preco}</span>
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={enviando}
                whileHover={{ scale: enviando ? 1 : 1.02 }}
                whileTap={{ scale: enviando ? 1 : 0.98 }}
                className={`w-full flex items-center justify-center gap-3 px-6 py-4 font-bold rounded-xl transition-colors ${
                  enviando 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {enviando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando matrícula...
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Confirmar matrícula
                  </>
                )}
              </motion.button>

              <p className="text-xs text-gray-500 text-center">
                * Campos obrigatórios.
              </p>
            </form>
          )}
        </motion.div>
      </div>

      {/* Preparação para Vestibulares */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Preparação para todos os vestibulares
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              No Entropia, você se prepara para todos os principais processos seletivos da região
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {processos.map((processo, index) => (
              <motion.div
                key={processo.nome}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="text-center"
              >
                <div className={`${processo.cor} rounded-2xl p-6 font-bold text-lg`}>
                  {processo.nome}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-green-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ainda tem dúvidas?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Nossa equipe está pronta para esclarecer todas as suas questões sobre matrícula, 
              valores e modalidades. Entre em contato agora mesmo!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/5592999999999?text=Olá! Tenho interesse em fazer matrícula no Entropia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-2xl hover:bg-green-700 transition-colors"
              >
                <Phone size={20} />
                WhatsApp
              </a>
              <a
                href="/contato"
                className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-green-600 font-bold text-lg rounded-2xl border-2 border-green-600 hover:bg-green-50 transition-colors"
              >
                <MapPin size={20} />
                Visite nossa sede
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
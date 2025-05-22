'use client'

import { useState } from 'react'
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
  MapPin
} from 'lucide-react'

export default function MatriculaPage() {
  const [modalidadeSelecionada, setModalidadeSelecionada] = useState('')
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    escolaridade: '',
    objetivo: '',
    modalidade: ''
  })
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const modalidades = [
    {
      id: 'extensivo',
      nome: 'Extensivo 2025',
      duracao: '10 meses',
      descricao: 'Preparação completa para todos os vestibulares com revisão intensiva',
      preco: 'R$ 350/mês',
      caracteristicas: [
        'Aulas de segunda a sexta',
        'Material didático completo',
        'Simulados semanais',
        'Plantão de dúvidas',
        'Acompanhamento pedagógico'
      ],
      popular: true
    },
    {
      id: 'intensivo',
      nome: 'Intensivo 2025',
      duracao: '6 meses',
      descricao: 'Preparação focada e intensiva para quem tem pressa',
      preco: 'R$ 420/mês',
      caracteristicas: [
        'Aulas diárias (seg-sáb)',
        'Foco nos principais vestibulares',
        'Revisão acelerada',
        'Simulados intensivos',
        'Aulões de véspera'
      ],
      popular: false
    },
    {
      id: 'online',
      nome: 'Online Premium',
      duracao: '12 meses',
      descricao: 'Estude de casa com qualidade Entropia',
      preco: 'R$ 250/mês',
      caracteristicas: [
        'Aulas ao vivo e gravadas',
        'Plataforma interativa',
        'Material digital',
        'Suporte online',
        'Fórum de dúvidas'
      ],
      popular: false
    }
  ]

  const processos = [
    { nome: 'PSC UFAM', cor: 'bg-blue-100 text-blue-800' },
    { nome: 'SIS UEA', cor: 'bg-green-100 text-green-800' },
    { nome: 'ENEM', cor: 'bg-purple-100 text-purple-800' },
    { nome: 'MACRO', cor: 'bg-orange-100 text-orange-800' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setEnviando(false)
    setSucesso(true)
    
    // Reset após 5 segundos
    setTimeout(() => {
      setSucesso(false)
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        escolaridade: '',
        objetivo: '',
        modalidade: ''
      })
      setModalidadeSelecionada('')
    }, 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Matrícula <span className="text-green-600">2025</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Dê o primeiro passo rumo à sua aprovação! Escolha a modalidade ideal e 
              garante sua vaga no melhor cursinho pré-vestibular de Manaus.
            </p>
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Modalidades */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Escolha sua modalidade
              </h2>

              <div className="space-y-6">
                {modalidades.map((modalidade, index) => (
                  <motion.div
                    key={modalidade.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all hover:shadow-xl ${
                      modalidadeSelecionada === modalidade.id
                        ? 'border-green-500 ring-2 ring-green-500/20'
                        : 'border-gray-200'
                    }`}
                  >
                    {modalidade.popular && (
                      <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Mais Popular
                      </div>
                    )}

                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {modalidade.nome}
                          </h3>
                          <p className="text-gray-600 mb-4">{modalidade.descricao}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock size={16} />
                              {modalidade.duracao}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign size={16} />
                              {modalidade.preco}
                            </div>
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-green-600">
                          {modalidade.preco}
                        </div>
                      </div>

                      <div className="space-y-3 mb-6">
                        {modalidade.caracteristicas.map((caracteristica, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                            <span className="text-gray-700">{caracteristica}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setModalidadeSelecionada(modalidade.id)
                          setFormData({ ...formData, modalidade: modalidade.nome })
                        }}
                        className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors ${
                          modalidadeSelecionada === modalidade.id
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {modalidadeSelecionada === modalidade.id ? 'Selecionado' : 'Selecionar'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Formulário de Pré-Matrícula */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-8 sticky top-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Pré-Matrícula
              </h3>

              {sucesso ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle className="text-green-600 w-16 h-16 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    Pré-matrícula enviada!
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Entraremos em contato em breve para finalizar sua matrícula.
                  </p>
                  <div className="bg-green-50 p-4 rounded-lg text-left">
                    <h5 className="font-semibold text-green-800 mb-2">Próximos passos:</h5>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>✓ Análise da sua solicitação</li>
                      <li>✓ Contato via WhatsApp</li>
                      <li>✓ Agendamento de entrevista</li>
                      <li>✓ Finalização da matrícula</li>
                    </ul>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
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

                  {modalidadeSelecionada && (
                    <div className="bg-green-50 p-4 rounded-xl">
                      <h4 className="font-semibold text-green-800 mb-2">Modalidade selecionada:</h4>
                      <p className="text-green-700">{formData.modalidade}</p>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={enviando || !modalidadeSelecionada}
                    whileHover={{ scale: enviando ? 1 : 1.02 }}
                    whileTap={{ scale: enviando ? 1 : 0.98 }}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviando ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Enviar pré-matrícula
                      </>
                    )}
                  </motion.button>

                  <p className="text-xs text-gray-500 text-center">
                    * Campos obrigatórios. Ao enviar, você autoriza o contato via WhatsApp.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
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
    </div>
  )
}
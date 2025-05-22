'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send,
  Instagram,
  Facebook,
  Youtube,
  CheckCircle,
  User,
  FileText
} from 'lucide-react'

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    assunto: '',
    mensagem: ''
  })
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setEnviando(false)
    setSucesso(true)
    
    // Reset após 3 segundos
    setTimeout(() => {
      setSucesso(false)
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        assunto: '',
        mensagem: ''
      })
    }, 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contatos = [
    {
      titulo: 'WhatsApp',
      info: '(92) 99999-9999',
      descricao: 'Atendimento rápido e personalizado',
      icon: MessageCircle,
      link: 'https://wa.me/5592999999999',
      cor: 'bg-green-100 text-green-600'
    },
    {
      titulo: 'Telefone',
      info: '(92) 3234-5678',
      descricao: 'Horário comercial: 8h às 18h',
      icon: Phone,
      link: 'tel:+559232345678',
      cor: 'bg-blue-100 text-blue-600'
    },
    {
      titulo: 'E-mail',
      info: 'contato@entropia.edu.br',
      descricao: 'Resposta em até 24 horas',
      icon: Mail,
      link: 'mailto:contato@entropia.edu.br',
      cor: 'bg-purple-100 text-purple-600'
    },
    {
      titulo: 'Endereço',
      info: 'Rua Exemplo, 123 - Centro',
      descricao: 'Manaus - AM, CEP: 69000-000',
      icon: MapPin,
      link: 'https://maps.google.com/?q=Manaus,AM',
      cor: 'bg-orange-100 text-orange-600'
    }
  ]

  const horarios = [
    { dia: 'Segunda a Sexta', horario: '8h às 18h' },
    { dia: 'Sábado', horario: '8h às 12h' },
    { dia: 'Domingo', horario: 'Fechado' }
  ]

  const redesSociais = [
    { nome: 'Instagram', icon: Instagram, link: 'https://instagram.com/entropiacursinho', cor: 'bg-pink-500' },
    { nome: 'Facebook', icon: Facebook, link: 'https://facebook.com/entropiacursinho', cor: 'bg-blue-600' },
    { nome: 'YouTube', icon: Youtube, link: 'https://youtube.com/entropiacursinho', cor: 'bg-red-500' }
  ]

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
              Entre em <span className="text-green-600">Contato</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Tem dúvidas? Quer saber mais sobre nossos cursos? Entre em contato conosco! 
              Estamos aqui para ajudar você a conquistar sua aprovação.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Informações de Contato */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Como podemos ajudar?
              </h2>
              
              <div className="space-y-4">
                {contatos.map((contato, index) => {
                  const Icon = contato.icon
                  return (
                    <motion.a
                      key={contato.titulo}
                      href={contato.link}
                      target={contato.link.startsWith('http') ? '_blank' : '_self'}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-105"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${contato.cor}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{contato.titulo}</h3>
                        <p className="text-gray-900 font-medium">{contato.info}</p>
                        <p className="text-gray-600 text-sm">{contato.descricao}</p>
                      </div>
                    </motion.a>
                  )
                })}
              </div>
            </motion.div>

            {/* Horários de Funcionamento */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-green-600" size={24} />
                <h3 className="text-lg font-bold text-gray-900">Horários de Atendimento</h3>
              </div>
              <div className="space-y-3">
                {horarios.map((horario, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600">{horario.dia}</span>
                    <span className="font-semibold text-gray-900">{horario.horario}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Redes Sociais */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Siga-nos nas redes sociais</h3>
              <div className="flex gap-3">
                {redesSociais.map((rede, index) => {
                  const Icon = rede.icon
                  return (
                    <a
                      key={rede.nome}
                      href={rede.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-12 h-12 ${rede.cor} text-white rounded-xl flex items-center justify-center hover:scale-110 transition-transform`}
                    >
                      <Icon size={20} />
                    </a>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Formulário de Contato */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Envie sua mensagem
              </h2>

              {sucesso ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="text-green-600 w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Mensagem enviada com sucesso!
                  </h3>
                  <p className="text-gray-600">
                    Entraremos em contato em breve. Obrigado!
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        Telefone/WhatsApp
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="tel"
                          name="telefone"
                          value={formData.telefone}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="(92) 99999-9999"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assunto *
                      </label>
                      <select
                        name="assunto"
                        value={formData.assunto}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Selecione um assunto</option>
                        <option value="matricula">Informações sobre matrícula</option>
                        <option value="cursos">Dúvidas sobre cursos</option>
                        <option value="valores">Valores e formas de pagamento</option>
                        <option value="horarios">Horários das aulas</option>
                        <option value="material">Material didático</option>
                        <option value="outros">Outros assuntos</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem *
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 text-gray-400" size={20} />
                      <textarea
                        name="mensagem"
                        value={formData.mensagem}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        placeholder="Digite sua mensagem aqui..."
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={enviando}
                    whileHover={{ scale: enviando ? 1 : 1.02 }}
                    whileTap={{ scale: enviando ? 1 : 0.98 }}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviando ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Enviando mensagem...
                      </>
                    ) : (
                      <>
                        <Send size={20} />
                        Enviar mensagem
                      </>
                    )}
                  </motion.button>

                  <p className="text-sm text-gray-500 text-center">
                    * Campos obrigatórios. Seus dados estão protegidos e não serão compartilhados.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nossa Localização
            </h2>
            <p className="text-gray-600">
              Estamos localizados no centro de Manaus, com fácil acesso por transporte público
            </p>
          </motion.div>

          <div className="bg-gray-100 rounded-2xl h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="text-green-600 w-16 h-16 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Mapa em desenvolvimento
              </h3>
              <p className="text-gray-600">
                Em breve você poderá visualizar nossa localização exata
              </p>
              <p className="text-gray-900 font-medium mt-4">
                Rua Exemplo, 123 - Centro<br />
                Manaus - AM, CEP: 69000-000
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Rápido */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-gray-600">
              Algumas das dúvidas mais comuns de nossos futuros alunos
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                pergunta: 'Quando começam as aulas?',
                resposta: 'As turmas começam em fevereiro e agosto. Entre em contato para saber sobre matrículas.'
              },
              {
                pergunta: 'Qual o valor do curso?',
                resposta: 'Temos diferentes modalidades e formas de pagamento. Consulte-nos para um orçamento personalizado.'
              },
              {
                pergunta: 'Vocês têm ensino online?',
                resposta: 'Sim! Oferecemos aulas presenciais, online e híbridas para melhor atender nossos alunos.'
              },
              {
                pergunta: 'Como funciona o material didático?',
                resposta: 'Material próprio e exclusivo, desenvolvido por nossa equipe pedagógica especializada.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white rounded-xl p-6 shadow-md"
              >
                <h3 className="font-bold text-gray-900 mb-3">{faq.pergunta}</h3>
                <p className="text-gray-600">{faq.resposta}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
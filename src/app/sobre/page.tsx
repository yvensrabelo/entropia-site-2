'use client'

import { motion } from 'framer-motion'
import { 
  GraduationCap, 
  Trophy, 
  Users, 
  Heart,
  Award,
  MapPin,
  Phone,
  Mail,
  Clock,
  Star,
  CheckCircle
} from 'lucide-react'

export default function SobrePage() {
  const stats = [
    { number: '850+', label: 'Aprovados', icon: Trophy },
    { number: '127', label: 'UEA 2024', icon: GraduationCap },
    { number: '4', label: 'Anos de História', icon: Clock },
    { number: '9/10', label: 'Medicina PPI', icon: Award },
  ]

  const valores = [
    {
      title: 'Excelência Acadêmica',
      description: 'Metodologia comprovada com foco nos vestibulares regionais',
      icon: GraduationCap
    },
    {
      title: 'Turmas Reduzidas',
      description: 'Atendimento personalizado com máximo de 40 alunos por turma',
      icon: Users
    },
    {
      title: 'Compromisso Social',
      description: 'Democratizando o acesso ao ensino superior de qualidade',
      icon: Heart
    },
    {
      title: 'Resultados Comprovados',
      description: 'Mais de 850 aprovações em universidades renomadas',
      icon: Star
    }
  ]

  const diferenciais = [
    'Metodologia exclusiva focada nos vestibulares da região',
    'Professores especialistas e mestres',
    'Material didático atualizado e personalizado',
    'Simulados semanais com correção TRI',
    'Acompanhamento psicopedagógico',
    'Plantão de dúvidas ilimitado',
    'Ambiente moderno e climatizado',
    'Localização estratégica em Manaus'
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Sobre o <span className="text-green-600">Entropia</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Há 4 anos transformando sonhos em realidade. O melhor cursinho pré-vestibular de Manaus, 
              com metodologia exclusiva e resultados que falam por si só.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => {
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
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Nossa História
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  O Entropia nasceu em 2020 com uma missão clara: democratizar o acesso ao ensino superior 
                  de qualidade em Manaus. Fundado por professores experientes e apaixonados pela educação, 
                  nosso cursinho rapidamente se tornou referência na preparação para vestibulares.
                </p>
                <p>
                  Com uma metodologia inovadora e foco nos processos seletivos regionais (PSC UFAM, SIS UEA, MACRO), 
                  conquistamos a confiança de centenas de famílias amazonenses. Nossos resultados falam por si só: 
                  mais de 850 aprovações em apenas 4 anos de história.
                </p>
                <p>
                  Hoje, somos reconhecidos como o cursinho #1 em aprovações no Amazonas, mantendo sempre 
                  nossos valores de excelência, compromisso e responsabilidade social.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-3xl p-8 h-96 flex items-center justify-center border-2 border-green-200">
                <div className="text-center">
                  <GraduationCap className="text-green-600 w-24 h-24 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-green-800 mb-4">
                    4 Anos de Excelência
                  </h3>
                  <p className="text-green-700 text-lg">
                    Transformando vidas através da educação
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Nossos Valores
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Os pilares que guiam nossa missão educacional e nos tornam únicos em Manaus
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {valores.map((valor, index) => {
              const Icon = valor.icon
              return (
                <motion.div
                  key={valor.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                    <Icon className="text-green-600" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{valor.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{valor.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20 bg-green-50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Por que escolher o Entropia?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Conheça os diferenciais que nos tornam o cursinho #1 em aprovações do Amazonas
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {diferenciais.map((diferencial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="flex items-center gap-4 bg-white rounded-xl p-6 shadow-md"
              >
                <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                <span className="text-gray-900 font-medium">{diferencial}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Localização e Contato */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Venha nos conhecer
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Estamos localizados no coração de Manaus, com fácil acesso e infraestrutura completa
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-center bg-gray-50 rounded-2xl p-8"
            >
              <MapPin className="text-green-600 w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Endereço</h3>
              <p className="text-gray-600">
                Rua Exemplo, 123<br />
                Centro, Manaus - AM<br />
                CEP: 69000-000
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center bg-gray-50 rounded-2xl p-8"
            >
              <Phone className="text-green-600 w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Telefone</h3>
              <p className="text-gray-600">
                (92) 99999-9999<br />
                WhatsApp disponível<br />
                Seg-Sex: 8h às 18h
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-center bg-gray-50 rounded-2xl p-8"
            >
              <Mail className="text-green-600 w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">E-mail</h3>
              <p className="text-gray-600">
                contato@entropia.edu.br<br />
                Resposta em até 24h<br />
                Atendimento personalizado
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
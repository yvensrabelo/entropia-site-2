'use client'

import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target, 
  Calendar,
  PlayCircle,
  FileText,
  Users,
  LogOut,
  Settings,
  Bell
} from 'lucide-react'

export default function DashboardPage() {
  const { usuario, logout } = useAuth()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 w-10 h-10 rounded-xl flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Entropia <span className="text-green-600">Cursinho</span>
              </h1>
              <p className="text-sm text-gray-600">Área do Aluno</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell size={20} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Settings size={20} className="text-gray-600" />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Boas-vindas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Olá, <span className="text-green-600">{usuario?.nome}</span>! 👋
          </h2>
          <p className="text-lg text-gray-600">
            Bem-vindo à sua área de estudos. Turma: {usuario?.turma}
          </p>
        </motion.div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border-2 border-gray-200 p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <Clock className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Horas de Estudo</p>
                <p className="text-2xl font-bold text-gray-900">24h</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border-2 border-gray-200 p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-2xl">
                <Trophy className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Simulados</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl border-2 border-gray-200 p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-2xl">
                <Target className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Desempenho</p>
                <p className="text-2xl font-bold text-gray-900">85%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl border-2 border-gray-200 p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 p-3 rounded-2xl">
                <Calendar className="text-orange-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Dias até ENEM</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Seções Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Acesso Rápido */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Acesso <span className="text-green-600">Rápido</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-green-50 hover:border-green-200 border-2 border-gray-200 rounded-2xl transition-all hover:scale-105">
                <PlayCircle className="text-green-600" size={32} />
                <span className="font-medium text-gray-900">Videoaulas</span>
              </button>
              
              <button className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border-2 border-gray-200 rounded-2xl transition-all hover:scale-105">
                <FileText className="text-blue-600" size={32} />
                <span className="font-medium text-gray-900">Simulados</span>
              </button>
              
              <button className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-purple-50 hover:border-purple-200 border-2 border-gray-200 rounded-2xl transition-all hover:scale-105">
                <BookOpen className="text-purple-600" size={32} />
                <span className="font-medium text-gray-900">Materiais</span>
              </button>
              
              <button className="flex flex-col items-center gap-3 p-4 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 border-2 border-gray-200 rounded-2xl transition-all hover:scale-105">
                <Users className="text-orange-600" size={32} />
                <span className="font-medium text-gray-900">Fórum</span>
              </button>
            </div>
          </motion.div>

          {/* Cronograma de Hoje */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-lg"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Cronograma de <span className="text-green-600">Hoje</span>
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 border-2 border-green-200 rounded-2xl">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Matemática</h4>
                  <p className="text-sm text-gray-600">Função Quadrática</p>
                </div>
                <span className="text-sm text-green-600 font-medium">08:00</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Português</h4>
                  <p className="text-sm text-gray-600">Interpretação de Texto</p>
                </div>
                <span className="text-sm text-gray-600 font-medium">10:00</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-2xl">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Física</h4>
                  <p className="text-sm text-gray-600">Cinemática</p>
                </div>
                <span className="text-sm text-gray-600 font-medium">14:00</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progresso Semanal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-white rounded-3xl border-2 border-gray-200 p-8 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Progresso <span className="text-green-600">Semanal</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-green-600"
                    strokeDasharray={`${(75 * 251.2) / 100} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">75%</span>
                </div>
              </div>
              <p className="font-medium text-gray-900">Matemática</p>
            </div>
            
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-blue-600"
                    strokeDasharray={`${(60 * 251.2) / 100} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">60%</span>
                </div>
              </div>
              <p className="font-medium text-gray-900">Português</p>
            </div>
            
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-purple-600"
                    strokeDasharray={`${(85 * 251.2) / 100} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">85%</span>
                </div>
              </div>
              <p className="font-medium text-gray-900">Física</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
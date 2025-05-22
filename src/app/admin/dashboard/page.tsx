'use client'

import { useState } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { motion } from 'framer-motion'
import RelatorioAulas from '@/components/RelatorioAulas'
import RegistrosRelatorios from '@/components/RegistrosRelatorios'
import { 
  Shield, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings,
  LogOut,
  Bell,
  Database,
  Webhook,
  Activity,
  Calendar,
  FileText,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react'

export default function AdminDashboardPage() {
  const { admin, logoutAdmin } = useAdminAuth()
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [webhookMessage, setWebhookMessage] = useState('')

  const handleLogout = () => {
    logoutAdmin()
    window.location.href = '/admin/login'
  }

  // Função para disparar o webhook
  const dispararWebhook = async () => {
    setWebhookStatus('loading')
    setWebhookMessage('')

    try {
      const response = await fetch('https://n8n.cursoentropia.com/webhook-test/9a2ee02e-f9f3-4b79-951b-f7eeb0714b59', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          admin: admin?.nome,
          action: 'webhook_test',
          source: 'admin_panel',
          data: {
            cpf: admin?.cpf,
            email: admin?.email,
            message: 'Webhook disparado do painel administrativo'
          }
        })
      })

      if (response.ok) {
        setWebhookStatus('success')
        setWebhookMessage('Webhook enviado com sucesso!')
      } else {
        throw new Error(`Erro HTTP: ${response.status}`)
      }
    } catch (error) {
      setWebhookStatus('error')
      setWebhookMessage(error instanceof Error ? error.message : 'Erro desconhecido')
    }

    // Reset após 3 segundos
    setTimeout(() => {
      setWebhookStatus('idle')
      setWebhookMessage('')
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Efeitos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-400/3 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gray-800/50 backdrop-blur-xl border-b border-green-500/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-green-500 to-green-400 w-10 h-10 rounded-xl flex items-center justify-center">
              <Shield className="text-black" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Entropia <span className="text-green-400">Admin</span>
              </h1>
              <p className="text-sm text-gray-400">Painel Administrativo</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors">
              <Bell size={20} className="text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-700/50 rounded-xl transition-colors">
              <Settings size={20} className="text-gray-400" />
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-xl transition-colors"
            >
              <LogOut size={18} />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Boas-vindas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            Olá, <span className="text-green-400">{admin?.nome}</span>! 🔧
          </h2>
          <p className="text-lg text-gray-400">
            Bem-vindo ao painel de controle do sistema Entropia
          </p>
        </motion.div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-green-500/30 p-6 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-3 rounded-2xl">
                <Users className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total de Alunos</p>
                <p className="text-2xl font-bold text-white">1,247</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-green-500/30 p-6 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-500/20 p-3 rounded-2xl">
                <BookOpen className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Cursos Ativos</p>
                <p className="text-2xl font-bold text-white">23</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-green-500/30 p-6 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 p-3 rounded-2xl">
                <BarChart3 className="text-purple-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Taxa de Aprovação</p>
                <p className="text-2xl font-bold text-white">87%</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-green-500/30 p-6 shadow-2xl"
          >
            <div className="flex items-center gap-4">
              <div className="bg-orange-500/20 p-3 rounded-2xl">
                <Activity className="text-orange-400" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400">Sistema Online</p>
                <p className="text-2xl font-bold text-white">99.8%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Seções Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ações Rápidas */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-green-500/30 p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              Ações <span className="text-green-400">Rápidas</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center gap-3 p-4 bg-gray-700/30 hover:bg-green-500/20 hover:border-green-400/50 border border-gray-600 rounded-2xl transition-all hover:scale-105 group">
                <Database className="text-blue-400 group-hover:text-blue-300" size={32} />
                <span className="font-medium text-gray-300 group-hover:text-white">Gerenciar BD</span>
              </button>
              
              <button className="flex flex-col items-center gap-3 p-4 bg-gray-700/30 hover:bg-green-500/20 hover:border-green-400/50 border border-gray-600 rounded-2xl transition-all hover:scale-105 group">
                <Users className="text-purple-400 group-hover:text-purple-300" size={32} />
                <span className="font-medium text-gray-300 group-hover:text-white">Usuários</span>
              </button>
              
              <button className="flex flex-col items-center gap-3 p-4 bg-gray-700/30 hover:bg-green-500/20 hover:border-green-400/50 border border-gray-600 rounded-2xl transition-all hover:scale-105 group">
                <FileText className="text-orange-400 group-hover:text-orange-300" size={32} />
                <span className="font-medium text-gray-300 group-hover:text-white">Relatórios</span>
              </button>
              
              <button className="flex flex-col items-center gap-3 p-4 bg-gray-700/30 hover:bg-green-500/20 hover:border-green-400/50 border border-gray-600 rounded-2xl transition-all hover:scale-105 group">
                <Settings className="text-green-400 group-hover:text-green-300" size={32} />
                <span className="font-medium text-gray-300 group-hover:text-white">Configurações</span>
              </button>
            </div>
          </motion.div>

          {/* Webhook e Sistema */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-green-500/30 p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              Sistema & <span className="text-green-400">Integrações</span>
            </h3>
            
            {/* Botão Webhook */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Webhook className="text-green-400" size={20} />
                <h4 className="text-lg font-semibold text-white">Webhook N8N</h4>
              </div>
              
              <button
                onClick={dispararWebhook}
                disabled={webhookStatus === 'loading'}
                className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 disabled:from-gray-600 disabled:to-gray-500 text-black font-bold rounded-2xl transition-all hover:scale-105 disabled:scale-100 shadow-lg"
              >
                {webhookStatus === 'loading' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Disparar Webhook
                  </>
                )}
              </button>
              
              {/* Status do Webhook */}
              {webhookMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 p-3 rounded-xl flex items-center gap-2 ${
                    webhookStatus === 'success' 
                      ? 'bg-green-900/50 border border-green-500/50 text-green-300'
                      : 'bg-red-900/50 border border-red-500/50 text-red-300'
                  }`}
                >
                  {webhookStatus === 'success' ? (
                    <CheckCircle size={18} />
                  ) : (
                    <AlertCircle size={18} />
                  )}
                  <span className="text-sm">{webhookMessage}</span>
                </motion.div>
              )}
            </div>

            {/* Status do Sistema */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400" size={16} />
                  <span className="text-gray-300 text-sm">API N8N</span>
                </div>
                <span className="text-green-400 text-sm font-medium">Online</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400" size={16} />
                  <span className="text-gray-300 text-sm">Banco de Dados</span>
                </div>
                <span className="text-green-400 text-sm font-medium">Conectado</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <Clock className="text-orange-400" size={16} />
                  <span className="text-gray-300 text-sm">Último Backup</span>
                </div>
                <span className="text-orange-400 text-sm font-medium">2h atrás</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Atividade Recente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8 bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-green-500/30 p-8 shadow-2xl"
        >
          <h3 className="text-2xl font-bold text-white mb-6">
            Atividade <span className="text-green-400">Recente</span>
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-2xl">
              <div className="bg-green-500/20 p-2 rounded-xl">
                <Users className="text-green-400" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">Novo aluno matriculado</h4>
                <p className="text-sm text-gray-400">Maria Silva se inscreveu no curso Extensivo 2025</p>
              </div>
              <span className="text-sm text-gray-500">2min atrás</span>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-2xl">
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <BookOpen className="text-blue-400" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">Simulado concluído</h4>
                <p className="text-sm text-gray-400">João Santos finalizou o Simulado ENEM #12</p>
              </div>
              <span className="text-sm text-gray-500">15min atrás</span>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-2xl">
              <div className="bg-purple-500/20 p-2 rounded-xl">
                <BarChart3 className="text-purple-400" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">Relatório gerado</h4>
                <p className="text-sm text-gray-400">Relatório mensal de desempenho foi criado</p>
              </div>
              <span className="text-sm text-gray-500">1h atrás</span>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-2xl">
              <div className="bg-orange-500/20 p-2 rounded-xl">
                <Calendar className="text-orange-400" size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">Evento agendado</h4>
                <p className="text-sm text-gray-400">Palestra sobre Redação ENEM marcada para amanhã</p>
              </div>
              <span className="text-sm text-gray-500">3h atrás</span>
            </div>
          </div>
        </motion.div>

        {/* Relatório de Aulas */}
        <RelatorioAulas />

        {/* Registros de Relatórios */}
        <RegistrosRelatorios />

        {/* Informações do Sistema */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 bg-gradient-to-r from-gray-800/50 to-gray-700/30 backdrop-blur-xl rounded-3xl border border-green-500/30 p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">Sistema Entropia v2.1.0</h4>
              <p className="text-gray-400 text-sm">Última atualização: 22/05/2025 às 14:30</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Operacional</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
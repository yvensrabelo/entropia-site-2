'use client'

import { useState, lazy, Suspense } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { motion } from 'framer-motion'
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

// Lazy loading dos componentes pesados
const RelatorioAulas = lazy(() => import('@/components/RelatorioAulas'))
const RegistrosRelatorios = lazy(() => import('@/components/RegistrosRelatorios'))

// Componente de loading
const ComponentLoading = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex items-center gap-3">
      <div className="w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-gray-400">Carregando componente...</span>
    </div>
  </div>
)

export default function AdminDashboardPage() {
  const { admin, logoutAdmin } = useAdminAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [webhookMessage, setWebhookMessage] = useState('')

  // Simular teste de webhook N8N
  const testarWebhook = async () => {
    setWebhookStatus('loading')
    setWebhookMessage('')
    
    try {
      // Simular chamada para webhook N8N
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simular resposta aleatória
      const sucesso = Math.random() > 0.3
      
      if (sucesso) {
        setWebhookStatus('success')
        setWebhookMessage('Webhook N8N respondeu com sucesso! Sistema integrado.')
      } else {
        setWebhookStatus('error')
        setWebhookMessage('Falha na conexão com N8N. Verifique a configuração.')
      }
    } catch (error) {
      setWebhookStatus('error')
      setWebhookMessage('Erro interno no teste de webhook.')
    }
    
    // Reset após 3 segundos
    setTimeout(() => {
      setWebhookStatus('idle')
      setWebhookMessage('')
    }, 3000)
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
    { id: 'registros', label: 'Registros', icon: Database },
    { id: 'configuracoes', label: 'Config', icon: Settings },
  ]

  const stats = [
    { label: 'Alunos Ativos', value: '1,247', change: '+12%', color: 'text-green-400', bg: 'bg-green-900/20' },
    { label: 'Aulas Hoje', value: '23', change: '+5%', color: 'text-blue-400', bg: 'bg-blue-900/20' },
    { label: 'Simulados', value: '8', change: '+2%', color: 'text-purple-400', bg: 'bg-purple-900/20' },
    { label: 'Aprovações', value: '850+', change: 'Meta', color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-xl border-b border-green-500/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-500 rounded-xl flex items-center justify-center">
              <Shield className="text-black" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
              <p className="text-gray-400">Bem-vindo, {admin?.nome}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 bg-gray-700/50 rounded-xl hover:bg-gray-600/50 transition-colors">
              <Bell className="text-gray-300" size={20} />
            </button>
            <button 
              onClick={logoutAdmin}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bg} border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-gray-500 text-sm">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <Activity className={stat.color} size={24} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 mb-8">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-green-400 text-green-400 bg-green-900/20'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-700/30'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/50 p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Dashboard Principal</h2>
                <p className="text-gray-400">Visão geral do sistema e métricas importantes.</p>
              </div>

              {/* Webhook Test */}
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Webhook className="text-green-400" size={24} />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Integração N8N</h3>
                      <p className="text-gray-400 text-sm">Teste de conectividade com webhooks</p>
                    </div>
                  </div>
                  <button
                    onClick={testarWebhook}
                    disabled={webhookStatus === 'loading'}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                  >
                    {webhookStatus === 'loading' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                        Testando...
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        Testar Webhook
                      </>
                    )}
                  </button>
                </div>
                
                {webhookMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 p-3 rounded-lg ${
                      webhookStatus === 'success'
                        ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                        : 'bg-red-900/30 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {webhookStatus === 'success' ? (
                      <CheckCircle size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    {webhookMessage}
                  </motion.div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { title: 'Gerenciar Usuários', desc: 'Adicionar, editar ou remover alunos', icon: Users, color: 'blue' },
                  { title: 'Relatórios', desc: 'Visualizar dados e estatísticas', icon: BarChart3, color: 'purple' },
                  { title: 'Configurações', desc: 'Ajustar parâmetros do sistema', icon: Settings, color: 'green' },
                ].map((action, index) => {
                  const Icon = action.icon
                  return (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer group"
                    >
                      <div className={`w-12 h-12 bg-${action.color}-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className={`text-${action.color}-400`} size={24} />
                      </div>
                      <h3 className="text-white font-semibold mb-2">{action.title}</h3>
                      <p className="text-gray-400 text-sm">{action.desc}</p>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Gerenciamento de Usuários</h2>
                <p className="text-gray-400">Administre alunos, professores e colaboradores.</p>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50">
                <p className="text-gray-400 text-center py-8">
                  Módulo de usuários em desenvolvimento. Em breve você poderá gerenciar todos os usuários do sistema aqui.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'relatorios' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Relatórios de Aulas</h2>
                <p className="text-gray-400">Visualize dados detalhados sobre as aulas e desempenho.</p>
              </div>
              
              <Suspense fallback={<ComponentLoading />}>
                <RelatorioAulas />
              </Suspense>
            </div>
          )}

          {activeTab === 'registros' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Registros do Sistema</h2>
                <p className="text-gray-400">Logs e atividades do sistema para auditoria.</p>
              </div>
              
              <Suspense fallback={<ComponentLoading />}>
                <RegistrosRelatorios />
              </Suspense>
            </div>
          )}

          {activeTab === 'configuracoes' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Configurações do Sistema</h2>
                <p className="text-gray-400">Ajuste parâmetros e configurações globais.</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  { title: 'Configurações Gerais', desc: 'Nome da instituição, logo, informações básicas' },
                  { title: 'Configurações de Email', desc: 'SMTP, templates de email, notificações' },
                  { title: 'Configurações de Backup', desc: 'Agenda de backups, local de armazenamento' },
                  { title: 'Configurações de Segurança', desc: 'Políticas de senha, 2FA, logs de acesso' },
                ].map((config, index) => (
                  <motion.div
                    key={config.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-900/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-colors cursor-pointer"
                  >
                    <h3 className="text-white font-semibold mb-2">{config.title}</h3>
                    <p className="text-gray-400 text-sm">{config.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
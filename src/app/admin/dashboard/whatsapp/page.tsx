'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, 
  Settings, 
  Send, 
  FileText, 
  History, 
  Bot,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';
import { supabase } from '@/lib/supabase-singleton';

interface WhatsAppConfig {
  id: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  server_url: string;
  instance_name: string;
}

interface WhatsAppStats {
  totalMessages: number;
  sentToday: number;
  pendingMessages: number;
  failedMessages: number;
}

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  stats?: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'config',
    title: 'Configuração',
    description: 'Configure a conexão com Evolution API e gerencie instâncias',
    icon: Settings,
    href: '/admin/dashboard/whatsapp/configuracao',
    color: 'from-blue-500 to-blue-600',
    stats: 'Status da conexão'
  },
  {
    id: 'send',
    title: 'Enviar Mensagens',
    description: 'Envie mensagens individuais ou em massa',
    icon: Send,
    href: '/admin/dashboard/whatsapp/enviar',
    color: 'from-green-500 to-green-600',
    stats: 'Envio rápido'
  },
  {
    id: 'templates',
    title: 'Templates',
    description: 'Gerencie templates de mensagens reutilizáveis',
    icon: FileText,
    href: '/admin/dashboard/whatsapp/templates',
    color: 'from-purple-500 to-purple-600',
    stats: '3 templates ativos'
  },
  {
    id: 'history',
    title: 'Histórico',
    description: 'Visualize o histórico completo de mensagens enviadas',
    icon: History,
    href: '/admin/dashboard/whatsapp/historico',
    color: 'from-yellow-500 to-yellow-600',
    stats: 'Últimas 24h'
  },
  {
    id: 'automations',
    title: 'Automações',
    description: 'Configure notificações automáticas e lembretes',
    icon: Bot,
    href: '/admin/dashboard/whatsapp/automacoes',
    color: 'from-red-500 to-red-600',
    stats: 'Notificações ativas'
  }
];

export default function WhatsAppPage() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [stats, setStats] = useState<WhatsAppStats>({
    totalMessages: 0,
    sentToday: 0,
    pendingMessages: 0,
    failedMessages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
    loadStats();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar configuração:', error);
      }
      
      setConfig(data);
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Total de mensagens
      const { count: totalMessages } = await supabase
        .from('whatsapp_messages')
        .select('*', { count: 'exact', head: true });

      // Mensagens de hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: sentToday } = await supabase
        .from('whatsapp_messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
        .eq('status', 'sent');

      // Mensagens pendentes
      const { count: pendingMessages } = await supabase
        .from('whatsapp_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Mensagens com falha
      const { count: failedMessages } = await supabase
        .from('whatsapp_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');

      setStats({
        totalMessages: totalMessages || 0,
        sentToday: sentToday || 0,
        pendingMessages: pendingMessages || 0,
        failedMessages: failedMessages || 0
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!config) return <AlertCircle className="w-6 h-6 text-gray-400" />;
    
    switch (config.status) {
      case 'connected':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'connecting':
        return <AlertCircle className="w-6 h-6 text-yellow-500 animate-pulse" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (!config) return 'Não configurado';
    
    switch (config.status) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'connecting':
        return 'Conectando...';
      case 'error':
        return 'Erro na conexão';
      default:
        return 'Status desconhecido';
    }
  };

  const getStatusColor = () => {
    if (!config) return 'text-gray-600';
    
    switch (config.status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-red-600';
      case 'connecting':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <AuthGuard>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">WhatsApp</h1>
                <p className="text-gray-600">
                  Gerencie comunicações via WhatsApp com Evolution API v2
                </p>
              </div>
            </div>
            
            {/* Status da Conexão */}
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm">
              {getStatusIcon()}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className={`font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Enviadas</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalMessages}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-gray-800">{stats.sentToday}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingMessages}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Falhas</p>
                <p className="text-2xl font-bold text-gray-800">{stats.failedMessages}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Menu de Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${item.color} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {item.stats && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {item.stats}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Ações Rápidas */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/dashboard/whatsapp/enviar"
              className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Send className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-700">Enviar Mensagem</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Envie uma mensagem rápida</p>
            </Link>
            
            <Link
              href="/admin/dashboard/presencas"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-700">Notificar Ausências</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Enviar notificações de falta</p>
            </Link>
            
            <Link
              href="/admin/dashboard/whatsapp/historico"
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-gray-700">Ver Histórico</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Mensagens recentes</p>
            </Link>
          </div>
        </div>

        {/* Aviso se não configurado */}
        {!config && !loading && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">
                  WhatsApp não configurado
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  Configure a conexão com Evolution API para começar a enviar mensagens.
                  {' '}
                  <Link href="/admin/dashboard/whatsapp/configuracao" className="underline font-medium">
                    Configurar agora
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
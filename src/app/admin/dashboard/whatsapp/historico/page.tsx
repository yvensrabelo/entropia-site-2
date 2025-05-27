'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  History, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Calendar,
  User,
  Download
} from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';
import { supabase } from '@/lib/supabase-singleton';
import { formatCPF } from '@/lib/utils/cpf';

interface WhatsAppMessage {
  id: string;
  to_number: string;
  message: string;
  type: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  error_message?: string;
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
  aluno?: {
    id: string;
    nome: string;
    cpf: string;
  };
}

export default function HistoricoMensagensPage() {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });

  useEffect(() => {
    loadMessages();
  }, [statusFilter, typeFilter, dateFilter]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('whatsapp_messages')
        .select(`
          *,
          aluno:aluno_id(
            id,
            nome,
            cpf
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      if (typeFilter) {
        query = query.eq('type', typeFilter);
      }

      if (dateFilter) {
        query = query.gte('created_at', dateFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
      case 'read':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviada';
      case 'delivered': return 'Entregue';
      case 'read': return 'Lida';
      case 'pending': return 'Pendente';
      case 'failed': return 'Falha';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
      case 'read':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'text': return 'Manual';
      case 'notification': return 'Notificação';
      case 'reminder': return 'Lembrete';
      case 'arrival': return 'Chegada';
      default: return type;
    }
  };

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length <= 12) {
      // Formato: +55 (XX) XXXX-XXXX
      return cleaned.replace(/(\d{2})(\d{2})(\d{4})(\d{4})/, '+$1 ($2) $3-$4');
    } else {
      // Formato: +55 (XX) XXXXX-XXXX
      return cleaned.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '+$1 ($2) $3-$4');
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return (
      msg.to_number.includes(search) ||
      msg.message.toLowerCase().includes(search) ||
      msg.aluno?.nome.toLowerCase().includes(search) ||
      msg.aluno?.cpf.includes(search)
    );
  });

  const exportCSV = () => {
    const headers = ['Data/Hora', 'Destinatário', 'Número', 'Mensagem', 'Tipo', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredMessages.map(msg => [
        new Date(msg.created_at).toLocaleString('pt-BR'),
        `"${msg.aluno?.nome || 'Não identificado'}"`,
        formatPhone(msg.to_number),
        `"${msg.message.replace(/"/g, '""')}"`,
        getTypeText(msg.type),
        getStatusText(msg.status)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historico-whatsapp-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <AuthGuard>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard/whatsapp"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <History className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Histórico de Mensagens</h1>
                <p className="text-gray-600 mt-1">Visualize todas as mensagens enviadas</p>
              </div>
            </div>
            
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Nome, CPF, número..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Todos</option>
                <option value="sent">Enviada</option>
                <option value="delivered">Entregue</option>
                <option value="read">Lida</option>
                <option value="pending">Pendente</option>
                <option value="failed">Falha</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Todos</option>
                <option value="text">Manual</option>
                <option value="notification">Notificação</option>
                <option value="reminder">Lembrete</option>
                <option value="arrival">Chegada</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                A partir de
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Lista de Mensagens */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando mensagens...</p>
            </div>
          ) : filteredMessages.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <div key={message.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(message.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(message.status)}`}>
                            {getStatusText(message.status)}
                          </span>
                        </div>
                        
                        <span className="text-sm text-gray-500">
                          {getTypeText(message.type)}
                        </span>
                        
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          {new Date(message.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        {message.aluno ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {message.aluno.nome}
                            </span>
                            <span className="text-sm text-gray-500">
                              CPF: {formatCPF(message.aluno.cpf)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-500">Destinatário não identificado</span>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          {formatPhone(message.to_number)}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {message.message}
                        </p>
                      </div>
                      
                      {message.error_message && (
                        <div className="mt-2 text-sm text-red-600">
                          Erro: {message.error_message}
                        </div>
                      )}
                      
                      {message.sent_at && (
                        <div className="mt-2 text-xs text-gray-500">
                          Enviada em: {new Date(message.sent_at).toLocaleString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma mensagem encontrada</p>
              <p className="text-sm text-gray-400 mt-1">
                Ajuste os filtros ou envie sua primeira mensagem
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
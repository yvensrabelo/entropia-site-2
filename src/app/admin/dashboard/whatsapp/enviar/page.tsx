'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Send, 
  Search, 
  Phone,
  User,
  Users,
  Loader2,
  CheckCircle,
  FileText,
  MessageSquare
} from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';
import { supabase } from '@/lib/supabase-singleton';
import { Toast } from '@/components/Toast';
import { formatCPF } from '@/lib/utils/cpf';
import { validateAndFormatPhone, formatPhoneForWhatsApp, formatPhoneForDisplay } from '@/lib/utils/phone';

interface Aluno {
  id: string;
  nome: string;
  cpf: string;
  telefone?: string;
  nome_responsavel?: string;
  telefone_responsavel?: string;
  turma?: string;
}

interface Template {
  id: string;
  name: string;
  template: string;
  variables: string[];
}

export default function EnviarMensagemPage() {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Aluno[]>([]);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [useResponsavel, setUseResponsavel] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkConnection();
    loadTemplates();
    // Verificar status a cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 3) {
      searchAlunos();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/whatsapp/status');
      const data = await response.json();
      console.log('Status WhatsApp:', data);
      setIsConnected(data.connected);
      
      // Se houver erro de configuração, mostrar mensagem
      if (data.error && !data.connected) {
        console.error('Erro de status:', data.error);
        setToast({ 
          message: data.error || 'Falha ao obter status do WhatsApp', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Erro ao verificar conexão:', error);
      setIsConnected(false);
      setToast({ 
        message: 'Erro ao verificar conexão com WhatsApp', 
        type: 'error' 
      });
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const searchAlunos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          id,
          nome,
          cpf,
          telefone,
          nome_responsavel,
          telefone_responsavel,
          matriculas!inner(
            turmas_config!inner(nome)
          )
        `)
        .or(`nome.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      const alunosFormatados = (data || []).map((aluno: any) => ({
        ...aluno,
        turma: aluno.matriculas?.[0]?.turmas_config?.nome || ''
      }));

      setSearchResults(alunosFormatados);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectAluno = (aluno: Aluno) => {
    setSelectedAluno(aluno);
    setSearchTerm('');
    setSearchResults([]);
    
    // Define o número de telefone padrão (sempre limpo, sem formatação)
    if (aluno.telefone) {
      setPhoneNumber(aluno.telefone.replace(/\D/g, ''));
      setUseResponsavel(false);
    } else if (aluno.telefone_responsavel) {
      setPhoneNumber(aluno.telefone_responsavel.replace(/\D/g, ''));
      setUseResponsavel(true);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    const template = templates.find(t => t.id === templateId);
    if (template && selectedAluno) {
      let processedMessage = template.template;
      
      // Substituir variáveis
      processedMessage = processedMessage.replace(/{nome_aluno}/g, selectedAluno.nome);
      processedMessage = processedMessage.replace(/{nome_responsavel}/g, selectedAluno.nome_responsavel || 'Responsável');
      processedMessage = processedMessage.replace(/{data}/g, new Date().toLocaleDateString('pt-BR'));
      processedMessage = processedMessage.replace(/{hora}/g, new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      
      setMessage(processedMessage);
    }
  };

  const validatePhoneNumber = (number: string): boolean => {
    const validation = validateAndFormatPhone(number);
    return validation.isValid;
  };

  const handleSend = async () => {
    if (!phoneNumber || !message) {
      setToast({ message: 'Preencha todos os campos', type: 'error' });
      return;
    }

    const phoneValidation = validateAndFormatPhone(phoneNumber);
    if (!phoneValidation.isValid) {
      setToast({ message: phoneValidation.error || 'Número inválido. Verifique o DDD e o número.', type: 'error' });
      return;
    }

    if (!isConnected) {
      setToast({ message: 'WhatsApp não está conectado', type: 'error' });
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: phoneNumber, // Enviar número como está, a API fará a formatação
          message: message,
          type: 'text',
          aluno_id: selectedAluno?.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar mensagem');
      }

      setToast({ message: 'Mensagem enviada com sucesso!', type: 'success' });
      
      // Limpar formulário
      setMessage('');
      setSelectedAluno(null);
      setPhoneNumber('');
      setSelectedTemplate('');
      
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      setToast({ 
        message: error.message || 'Erro ao enviar mensagem', 
        type: 'error' 
      });
    } finally {
      setSending(false);
    }
  };

  const formatPhone = (phone: string) => {
    return formatPhoneForDisplay(phone);
  };

  return (
    <AuthGuard>
      <div className="p-6 max-w-4xl mx-auto">
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
              <Send className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Enviar Mensagem</h1>
                <p className="text-gray-600 mt-1">Envie mensagens individuais via WhatsApp</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
          </div>
        </div>

        {/* Busca de Aluno */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Selecionar Destinatário</h3>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar aluno por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            )}
          </div>

          {/* Resultados da busca */}
          {searchResults.length > 0 && (
            <div className="border rounded-lg mb-4 max-h-48 overflow-y-auto">
              {searchResults.map(aluno => (
                <button
                  key={aluno.id}
                  onClick={() => selectAluno(aluno)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{aluno.nome}</p>
                    <p className="text-sm text-gray-500">
                      CPF: {formatCPF(aluno.cpf)} | Turma: {aluno.turma || 'Não informada'}
                    </p>
                  </div>
                  <User className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {/* Aluno selecionado */}
          {selectedAluno && (
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{selectedAluno.nome}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    CPF: {formatCPF(selectedAluno.cpf)}
                  </p>
                  {selectedAluno.turma && (
                    <p className="text-sm text-gray-600">
                      Turma: {selectedAluno.turma}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedAluno(null);
                    setPhoneNumber('');
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remover
                </button>
              </div>

              {/* Seleção de número */}
              <div className="mt-4 space-y-2">
                {selectedAluno.telefone && (
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={!useResponsavel}
                      onChange={() => {
                        setUseResponsavel(false);
                        setPhoneNumber(selectedAluno.telefone!.replace(/\D/g, ''));
                      }}
                      className="text-green-500"
                    />
                    <span className="text-sm">
                      Aluno: {formatPhone(selectedAluno.telefone)}
                    </span>
                  </label>
                )}
                {selectedAluno.telefone_responsavel && (
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={useResponsavel}
                      onChange={() => {
                        setUseResponsavel(true);
                        setPhoneNumber(selectedAluno.telefone_responsavel!.replace(/\D/g, ''));
                      }}
                      className="text-green-500"
                    />
                    <span className="text-sm">
                      {selectedAluno.nome_responsavel || 'Responsável'}: {formatPhone(selectedAluno.telefone_responsavel)}
                    </span>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Número manual */}
          {!selectedAluno && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ou digite o número manualmente
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  placeholder="92981662806"
                  value={phoneNumber}
                  onChange={(e) => {
                    // Permitir apenas números
                    const cleanValue = e.target.value.replace(/\D/g, '');
                    // Limitar a 13 dígitos (55 + DDD + 9 dígitos)
                    if (cleanValue.length <= 13) {
                      setPhoneNumber(cleanValue);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Digite o número sem traços ou parênteses. Ex.: 92981662806
              </p>
            </div>
          )}
        </div>

        {/* Mensagem */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mensagem</h3>
          
          {/* Templates */}
          {templates.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usar template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Selecione um template...</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto da mensagem
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Digite sua mensagem aqui..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500">
                {message.length} caracteres
              </p>
              {message.length > 1000 && (
                <p className="text-sm text-yellow-600">
                  Mensagens longas podem ser divididas
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/dashboard/whatsapp"
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          
          <button
            onClick={handleSend}
            disabled={sending || !phoneNumber || !message || !isConnected}
            className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Enviar Mensagem
              </>
            )}
          </button>
        </div>


        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </AuthGuard>
  );
}
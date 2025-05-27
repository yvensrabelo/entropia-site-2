'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Settings, 
  Save, 
  Loader2, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';
import { supabase } from '@/lib/supabase-client';
import { Toast } from '@/components/Toast';

export default function ConfiguracaoWhatsAppPage() {
  // Estados simples
  const [serverUrl, setServerUrl] = useState('https://evolutionapi.cursoentropia.com');
  const [apiKey, setApiKey] = useState('');
  const [realApiKey, setRealApiKey] = useState(''); // API Key real para chamadas
  const [instanceName, setInstanceName] = useState('5592991144473');
  const [configId, setConfigId] = useState<string | null>(null);
  
  // Estados de UI
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Carregar configuração ao iniciar
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      console.log('=== CARREGANDO CONFIGURAÇÃO DO BANCO ===');
      
      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .single();
      
      console.log('Dados carregados:', data);
      console.log('Erro:', error);
      
      if (data) {
        console.log('API Key no banco:', data.api_key ? `${data.api_key.substring(0, 10)}...` : 'VAZIA');
        
        setConfigId(data.id);
        setServerUrl(data.server_url || 'https://evolutionapi.cursoentropia.com');
        setInstanceName(data.instance_name || '5592991144473');
        
        // Se tem API key no banco
        if (data.api_key && data.api_key.length > 0) {
          console.log('API Key encontrada! Marcando como conectado.');
          setRealApiKey(data.api_key); // Guarda a API key real
          setApiKey('••••••••••••••••••••'); // Mostra asteriscos
          setHasApiKey(true);
          setIsConnected(true);
        } else {
          console.log('Sem API Key no banco');
          setApiKey('');
          setHasApiKey(false);
        }
      } else {
        console.log('Nenhuma configuração encontrada no banco');
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    // Usar a API key real ou a nova digitada
    const apiKeyToSave = hasApiKey && apiKey === '••••••••••••••••••••' ? realApiKey : apiKey;
    
    if (!serverUrl || !apiKeyToSave || !instanceName) {
      setToast({ 
        message: 'Por favor, preencha todos os campos', 
        type: 'error' 
      });
      return;
    }

    setIsSaving(true);
    console.log('=== SALVANDO CONFIGURAÇÃO ===');
    
    try {
      const configData = {
        server_url: serverUrl.trim(),
        api_key: apiKeyToSave.trim(),
        instance_name: instanceName.trim(),
        status: 'connected'
      };
      
      console.log('Dados a salvar:', {
        ...configData,
        api_key: configData.api_key.substring(0, 10) + '...'
      });

      if (configId) {
        // Atualizar
        console.log('Atualizando configuração existente, ID:', configId);
        const { error } = await supabase
          .from('whatsapp_config')
          .update(configData)
          .eq('id', configId);
          
        if (error) throw error;
      } else {
        // Criar novo
        console.log('Criando nova configuração');
        const { data, error } = await supabase
          .from('whatsapp_config')
          .insert(configData)
          .select()
          .single();
        
        if (error) throw error;
        if (data) {
          console.log('Nova configuração criada, ID:', data.id);
          setConfigId(data.id);
        }
      }

      // Após salvar com sucesso
      setRealApiKey(apiKeyToSave);
      setApiKey('••••••••••••••••••••');
      setHasApiKey(true);
      setIsConnected(true);
      
      setToast({ 
        message: 'Configuração salva com sucesso!', 
        type: 'success' 
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setToast({ 
        message: 'Erro ao salvar configuração', 
        type: 'error' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST'
      });

      const data = await response.json();

      if (data.success) {
        setIsConnected(true);
        
        // Salvar status no banco
        if (configId) {
          await supabase
            .from('whatsapp_config')
            .update({ status: 'connected' })
            .eq('id', configId);
        }
        
        setToast({ 
          message: '✅ WhatsApp conectado! Mensagem de teste enviada.', 
          type: 'success' 
        });
      } else {
        setToast({ 
          message: data.error || 'Erro ao testar conexão', 
          type: 'error' 
        });
      }
    } catch (error) {
      setToast({ 
        message: 'Erro ao testar conexão', 
        type: 'error' 
      });
    } finally {
      setIsTesting(false);
    }
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
              <Settings className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Configuração WhatsApp</h1>
                <p className="text-gray-600 mt-1">Configure a integração com Evolution API</p>
              </div>
            </div>
            
            {/* Status Visual */}
            <div className={`flex items-center gap-3 px-4 py-2 rounded-lg shadow-sm ${
              isConnected 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-white border border-gray-200'
            }`}>
              {isConnected ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="font-medium text-green-700">Conectado</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-red-500" />
                  <span className="font-medium text-gray-700">Desconectado</span>
                </>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          </div>
        ) : (
          <>
            {/* Formulário */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Dados da API</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL do Servidor
                  </label>
                  <input
                    type="text"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                    placeholder="https://evolutionapi.cursoentropia.com"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        // Se está editando, não é mais a API key salva
                        if (e.target.value !== '••••••••••••••••••••') {
                          setHasApiKey(false);
                        }
                      }}
                      placeholder={hasApiKey ? "API Key salva (clique para editar)" : "Sua chave de API"}
                      className="w-full pr-12 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (hasApiKey && !showApiKey) {
                          // Mostrar a API key real quando clicar no olho
                          setApiKey(realApiKey);
                        } else if (hasApiKey && showApiKey) {
                          // Voltar aos asteriscos
                          setApiKey('••••••••••••••••••••');
                        }
                        setShowApiKey(!showApiKey);
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {hasApiKey && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ API Key salva no banco de dados
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Instância
                  </label>
                  <input
                    type="text"
                    value={instanceName}
                    onChange={(e) => setInstanceName(e.target.value)}
                    placeholder="5592991144473"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <button
                  onClick={saveConfig}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Configuração
                    </>
                  )}
                </button>
                
                <button
                  onClick={testConnection}
                  disabled={!apiKey || isTesting}
                  className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Testar Conexão
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Instruções */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Como usar
              </h3>
              <ol className="space-y-2 text-blue-700">
                <li className="flex gap-2">
                  <span className="font-medium">1.</span>
                  Insira sua API Key da Evolution API
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">2.</span>
                  Clique em "Salvar Configuração"
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">3.</span>
                  Use "Testar Conexão" para enviar uma mensagem de teste
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">4.</span>
                  Pronto! O WhatsApp está integrado
                </li>
              </ol>
            </div>
          </>
        )}

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
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
  AlertCircle,
  QrCode,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';
import { supabase } from '@/lib/supabase-client';
import { Toast } from '@/components/Toast';
import { QRCodeDisplay } from '@/components/admin/QRCodeDisplay';
import { EXISTING_INSTANCE, getCorrectInstanceName } from '@/lib/whatsapp-config';

interface WhatsAppConfig {
  id?: string;
  server_url: string;
  api_key: string;
  instance_name: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  qr_code?: string;
}

export default function ConfiguracaoWhatsAppPage() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    server_url: EXISTING_INSTANCE.server_url,
    api_key: '',
    instance_name: EXISTING_INSTANCE.name,
    status: 'disconnected'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .single();
      
      if (data) {
        setConfig(data);
        if (data.qr_code && data.status === 'connecting') {
          setShowQRCode(true);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const configData = {
        server_url: config.server_url,
        api_key: config.api_key,
        instance_name: config.instance_name,
        status: config.status
      };

      if (config.id) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from('whatsapp_config')
          .update(configData)
          .eq('id', config.id);
        
        if (error) throw error;
      } else {
        // Criar nova configuração
        const { data, error } = await supabase
          .from('whatsapp_config')
          .insert(configData)
          .select()
          .single();
        
        if (error) throw error;
        if (data) setConfig({ ...config, id: data.id });
      }

      setToast({ message: 'Configuração salva com sucesso!', type: 'success' });
    } catch (error: any) {
      console.error('Erro ao salvar configuração:', error);
      setToast({ 
        message: error.message || 'Erro ao salvar configuração', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const connectOrCreateInstance = async () => {
    if (!config.server_url || !config.api_key) {
      setToast({ message: 'Preencha todos os campos obrigatórios', type: 'error' });
      return;
    }

    setConnecting(true);
    try {
      // Primeiro verificar se a instância já existe
      const checkResponse = await fetch('/api/whatsapp/instance/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server_url: config.server_url,
          api_key: config.api_key,
          instance_name: config.instance_name
        })
      });

      const checkData = await checkResponse.json();

      if (checkData.exists && checkData.connected) {
        // Instância já existe e está conectada
        setConfig({ ...config, status: 'connected' });
        await saveConfig();
        setToast({ message: 'WhatsApp já está conectado!', type: 'success' });
        return;
      }

      if (!checkData.exists) {
        // Instância não existe, criar nova
        const createResponse = await fetch('/api/whatsapp/instance/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            server_url: config.server_url,
            api_key: config.api_key,
            instance_name: config.instance_name
          })
        });

        const createData = await createResponse.json();

        if (!createResponse.ok) {
          throw new Error(createData.error || 'Erro ao criar instância');
        }
      }

      // Obter QR Code (seja para instância nova ou existente desconectada)
      setShowQRCode(true);
      setConfig({ ...config, status: 'connecting' });
      await saveConfig();
      
      // Iniciar verificação de status
      checkConnectionStatus();

      setToast({ 
        message: checkData.exists ? 'Conecte-se escaneando o QR Code' : 'Instância criada! Escaneie o QR Code', 
        type: 'success' 
      });
    } catch (error: any) {
      console.error('Erro ao conectar/criar instância:', error);
      setToast({ 
        message: error.message || 'Erro ao conectar', 
        type: 'error' 
      });
    } finally {
      setConnecting(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server_url: config.server_url,
          api_key: config.api_key,
          instance_name: config.instance_name
        })
      });

      const data = await response.json();

      if (data.connected) {
        setConfig({ ...config, status: 'connected', qr_code: undefined });
        setShowQRCode(false);
        await saveConfig();
        setToast({ message: 'WhatsApp conectado com sucesso!', type: 'success' });
      } else {
        // Verificar novamente em 5 segundos
        setTimeout(checkConnectionStatus, 5000);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  const disconnect = async () => {
    setConnecting(true);
    try {
      const response = await fetch('/api/whatsapp/instance/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instance_name: config.instance_name
        })
      });

      if (response.ok) {
        setConfig({ ...config, status: 'disconnected', qr_code: undefined });
        setShowQRCode(false);
        await saveConfig();
        setToast({ message: 'WhatsApp desconectado', type: 'success' });
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      setToast({ message: 'Erro ao desconectar', type: 'error' });
    } finally {
      setConnecting(false);
    }
  };

  const getStatusIcon = () => {
    switch (config.status) {
      case 'connected':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'connecting':
        return <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusText = () => {
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
                <p className="text-gray-600 mt-1">Configure a integração com Evolution API v2</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm">
              {getStatusIcon()}
              <span className="font-medium text-gray-700">{getStatusText()}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          </div>
        ) : (
          <>
            {/* Formulário de Configuração */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Dados da API</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL do Servidor Evolution API
                  </label>
                  <input
                    type="text"
                    value={config.server_url}
                    onChange={(e) => setConfig({ ...config, server_url: e.target.value })}
                    placeholder="https://api.evolution.com.br"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL base da sua instância Evolution API
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={config.api_key}
                      onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                      placeholder="Sua chave de API"
                      className="w-full pr-12 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Chave de autenticação para acessar a API
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Instância
                  </label>
                  <input
                    type="text"
                    value={config.instance_name}
                    onChange={(e) => setConfig({ ...config, instance_name: e.target.value })}
                    placeholder="entropia-cursinho"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Identificador único para esta instância do WhatsApp
                  </p>
                  {config.instance_name === EXISTING_INSTANCE.name && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      ✓ Usando instância existente "{EXISTING_INSTANCE.displayName}"
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex gap-4">
                <button
                  onClick={saveConfig}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
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
                
                {config.status === 'disconnected' && (
                  <button
                    onClick={connectOrCreateInstance}
                    disabled={connecting || !config.server_url || !config.api_key}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        Conectar WhatsApp
                      </>
                    )}
                  </button>
                )}
                
                {config.status === 'connected' && (
                  <button
                    onClick={disconnect}
                    disabled={connecting}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Desconectando...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Desconectar
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* QR Code Display */}
            {showQRCode && config.server_url && config.api_key && (
              <QRCodeDisplay
                instanceName={config.instance_name}
                serverUrl={config.server_url}
                apiKey={config.api_key}
                onConnected={async () => {
                  setConfig({ ...config, status: 'connected', qr_code: undefined });
                  setShowQRCode(false);
                  await saveConfig();
                  setToast({ message: 'WhatsApp conectado com sucesso!', type: 'success' });
                }}
              />
            )}

            {/* Instruções */}
            <div className="bg-blue-50 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Como configurar
              </h3>
              <ol className="space-y-2 text-blue-700">
                <li className="flex gap-2">
                  <span className="font-medium">1.</span>
                  Obtenha as credenciais da Evolution API v2
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">2.</span>
                  Preencha os campos acima e salve a configuração
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">3.</span>
                  Clique em "Conectar WhatsApp" para gerar o QR Code
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">4.</span>
                  Escaneie o código com o WhatsApp que será usado
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">5.</span>
                  Aguarde a confirmação da conexão
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
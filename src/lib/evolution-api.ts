import { createClient } from '@supabase/supabase-js';
import { getCorrectInstanceName } from './whatsapp-config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface EvolutionConfig {
  server_url: string;
  api_key: string;
  instance_name: string;
}

export interface SendMessageParams {
  number: string;
  text: string;
  delay?: number;
  linkPreview?: boolean;
}

export interface CreateInstanceParams {
  instanceName: string;
  token?: string;
  qrcode?: boolean;
  number?: string;
}

export class EvolutionAPIClient {
  private config: EvolutionConfig;

  constructor(config: EvolutionConfig) {
    this.config = {
      ...config,
      instance_name: getCorrectInstanceName(config.instance_name)
    };
  }

  static async fromDatabase(): Promise<EvolutionAPIClient | null> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .single();

      if (error || !data) {
        return null;
      }

      return new EvolutionAPIClient({
        server_url: data.server_url,
        api_key: data.api_key,
        instance_name: data.instance_name
      });
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      return null;
    }
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'apikey': this.config.api_key
    };
  }

  private getUrl(path: string): string {
    const baseUrl = this.config.server_url.replace(/\/$/, '');
    return `${baseUrl}${path}`;
  }

  // Criar instância
  async createInstance(params?: Partial<CreateInstanceParams>) {
    const url = this.getUrl('/instance/create');
    
    const body = {
      instanceName: params?.instanceName || this.config.instance_name,
      token: params?.token,
      qrcode: params?.qrcode !== false,
      number: params?.number
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao criar instância: ${error}`);
    }

    return response.json();
  }

  // Obter QR Code
  async getQRCode() {
    const url = this.getUrl(`/instance/connect/${this.config.instance_name}`);
    
    console.log('Getting QR Code from:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    const responseText = await response.text();
    console.log('QR Code response:', {
      ok: response.ok,
      status: response.status,
      text: responseText.substring(0, 200) + '...' // Log parcial
    });

    if (!response.ok) {
      throw new Error(`Erro ao obter QR Code: ${responseText}`);
    }

    try {
      const data = JSON.parse(responseText);
      console.log('QR Code data structure:', {
        hasQrcode: !!data.qrcode,
        hasBase64: !!data.base64,
        hasCode: !!data.code,
        hasPairingCode: !!data.pairingCode,
        keys: Object.keys(data)
      });
      return data;
    } catch (e) {
      // Se não for JSON, pode ser o QR code direto
      console.log('Response is not JSON, might be direct QR code');
      return { qrcode: responseText };
    }
  }

  // Verificar status da conexão
  async checkStatus() {
    const url = this.getUrl(`/instance/connectionState/${this.config.instance_name}`);
    
    console.log('Checking status at:', url);
    console.log('Headers:', this.getHeaders());
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    const responseText = await response.text();
    console.log('Status response:', {
      ok: response.ok,
      status: response.status,
      text: responseText
    });

    if (!response.ok) {
      throw new Error(`Erro ao verificar status: ${responseText}`);
    }

    try {
      const data = JSON.parse(responseText);
      console.log('Status data:', data);
      
      // 'open' significa que a instância existe mas NÃO está conectada ao WhatsApp
      // 'connected' significa que está conectada
      return {
        connected: data.state === 'connected',
        state: data.state
      };
    } catch (e) {
      console.error('Error parsing status response:', e);
      throw new Error(`Resposta inválida da API: ${responseText}`);
    }
  }

  // Enviar mensagem de texto
  async sendText(params: SendMessageParams) {
    const url = this.getUrl(`/message/sendText/${this.config.instance_name}`);
    
    const body = {
      number: this.formatPhoneNumber(params.number),
      text: params.text,
      delay: params.delay || 1200,
      linkPreview: params.linkPreview || false
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao enviar mensagem: ${error}`);
    }

    return response.json();
  }

  // Desconectar instância
  async logout() {
    const url = this.getUrl(`/instance/logout/${this.config.instance_name}`);
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro ao desconectar: ${error}`);
    }

    return response.json();
  }

  // Formatar número de telefone brasileiro
  private formatPhoneNumber(number: string): string {
    // Remove todos os caracteres não numéricos
    let cleaned = number.replace(/\D/g, '');
    
    // Se não tem código do país, adiciona 55 (Brasil)
    if (!cleaned.startsWith('55')) {
      cleaned = '55' + cleaned;
    }
    
    // Se tem 8 dígitos após o DDD, adiciona o 9
    const withoutCountry = cleaned.substring(2);
    if (withoutCountry.length === 10) {
      const ddd = withoutCountry.substring(0, 2);
      const number = withoutCountry.substring(2);
      if (!number.startsWith('9')) {
        cleaned = '55' + ddd + '9' + number;
      }
    }
    
    return cleaned;
  }

  // Validar número de telefone
  static isValidPhoneNumber(number: string): boolean {
    const cleaned = number.replace(/\D/g, '');
    
    // Deve ter 10 ou 11 dígitos (sem código do país)
    // ou 12 ou 13 dígitos (com código do país 55)
    if (cleaned.startsWith('55')) {
      return cleaned.length === 12 || cleaned.length === 13;
    } else {
      return cleaned.length === 10 || cleaned.length === 11;
    }
  }
}

// Função helper para salvar mensagem no banco
export async function saveMessage(data: {
  aluno_id?: string;
  to_number: string;
  message: string;
  type: 'text' | 'notification' | 'reminder' | 'arrival';
  status: 'pending' | 'sent' | 'failed';
  error_message?: string;
  sent_at?: string;
}) {
  try {
    const { error } = await supabase
      .from('whatsapp_messages')
      .insert(data);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao salvar mensagem:', error);
    throw error;
  }
}

// Função para verificar horário permitido
export function isAllowedTime(): boolean {
  const now = new Date();
  const hour = now.getHours();
  
  // Permitir apenas entre 8h e 20h
  return hour >= 8 && hour < 20;
}

// Rate limiter simples
const messageCount = new Map<string, { count: number; resetTime: Date }>();

export function checkRateLimit(identifier: string, maxMessages: number = 100): boolean {
  const now = new Date();
  const userLimit = messageCount.get(identifier);
  
  if (!userLimit || userLimit.resetTime < now) {
    // Reset do contador
    messageCount.set(identifier, {
      count: 1,
      resetTime: new Date(now.getTime() + 60 * 60 * 1000) // 1 hora
    });
    return true;
  }
  
  if (userLimit.count >= maxMessages) {
    return false;
  }
  
  userLimit.count++;
  return true;
}
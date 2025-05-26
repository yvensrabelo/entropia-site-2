import { NextRequest, NextResponse } from 'next/server';
import { EvolutionAPIClient } from '@/lib/evolution-api';

export async function GET(request: NextRequest) {
  try {
    const client = await EvolutionAPIClient.fromDatabase();
    
    if (!client) {
      return NextResponse.json({
        connected: false,
        status: 'not_configured',
        message: 'WhatsApp não configurado'
      });
    }

    const status = await client.checkStatus();
    
    return NextResponse.json({
      connected: status.connected,
      status: status.state,
      message: status.connected ? 'WhatsApp conectado' : 'WhatsApp desconectado'
    });

  } catch (error: any) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json({
      connected: false,
      status: 'error',
      message: error.message || 'Erro ao verificar status'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { server_url, api_key, instance_name } = body;

    if (!server_url || !api_key || !instance_name) {
      // Tentar buscar do banco se não foram fornecidos
      const client = await EvolutionAPIClient.fromDatabase();
      
      if (!client) {
        return NextResponse.json({
          connected: false,
          status: 'not_configured',
          message: 'WhatsApp não configurado'
        });
      }

      const status = await client.checkStatus();
      
      return NextResponse.json({
        connected: status.connected,
        status: status.state,
        message: status.connected ? 'WhatsApp conectado' : 'WhatsApp desconectado'
      });
    }

    // Criar cliente com as configurações fornecidas
    const client = new EvolutionAPIClient({
      server_url,
      api_key,
      instance_name
    });

    const status = await client.checkStatus();
    
    return NextResponse.json({
      connected: status.connected,
      status: status.state,
      message: status.connected ? 'WhatsApp conectado' : 'WhatsApp desconectado'
    });

  } catch (error: any) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json({
      connected: false,
      status: 'error',
      message: error.message || 'Erro ao verificar status'
    });
  }
}
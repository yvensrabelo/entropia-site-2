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

    console.log('Status check request:', {
      server_url,
      instance_name,
      has_api_key: !!api_key
    });

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

    console.log('Checking status for instance:', instance_name);
    const status = await client.checkStatus();
    console.log('Status result:', status);
    
    return NextResponse.json({
      connected: status.connected,
      status: status.state,
      message: status.connected ? 'WhatsApp conectado' : 'WhatsApp desconectado',
      debug: {
        instance_name,
        state: status.state
      }
    });

  } catch (error: any) {
    console.error('Erro ao verificar status:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({
      connected: false,
      status: 'error',
      message: error.message || 'Erro ao verificar status',
      debug: {
        error: error.message
      }
    });
  }
}
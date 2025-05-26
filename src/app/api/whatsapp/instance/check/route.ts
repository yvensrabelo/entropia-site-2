import { NextRequest, NextResponse } from 'next/server';
import { EvolutionAPIClient } from '@/lib/evolution-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { server_url, api_key, instance_name } = body;

    if (!server_url || !api_key || !instance_name) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Criar cliente com as configurações fornecidas
    const client = new EvolutionAPIClient({
      server_url,
      api_key,
      instance_name
    });

    // Verificar se a instância existe e está conectada
    try {
      const status = await client.checkStatus();
      
      return NextResponse.json({
        exists: true,
        connected: status.connected,
        state: status.state
      });
    } catch (error: any) {
      // Se der erro 404, a instância não existe
      if (error.message.includes('404') || error.message.includes('not found')) {
        return NextResponse.json({
          exists: false,
          connected: false,
          state: 'not_found'
        });
      }
      
      // Outros erros
      throw error;
    }

  } catch (error: any) {
    console.error('Erro ao verificar instância:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao verificar instância' },
      { status: 500 }
    );
  }
}
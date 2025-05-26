import { NextRequest, NextResponse } from 'next/server';
import { EvolutionAPIClient } from '@/lib/evolution-api';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    // Tentar criar a instância
    const result = await client.createInstance({
      instanceName: instance_name,
      qrcode: true
    });

    // Atualizar status no banco
    await supabase
      .from('whatsapp_config')
      .update({ status: 'connecting' })
      .eq('instance_name', instance_name);

    return NextResponse.json({
      success: true,
      instance: result.instance,
      message: 'Instância criada com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao criar instância:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar instância' },
      { status: 500 }
    );
  }
}
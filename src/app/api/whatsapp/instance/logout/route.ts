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
    const { instance_name } = body;

    const client = await EvolutionAPIClient.fromDatabase();
    
    if (!client) {
      return NextResponse.json(
        { error: 'WhatsApp não configurado' },
        { status: 500 }
      );
    }

    // Desconectar
    await client.logout();

    // Atualizar status no banco
    await supabase
      .from('whatsapp_config')
      .update({ 
        status: 'disconnected',
        qr_code: null 
      })
      .eq('instance_name', instance_name);

    return NextResponse.json({
      success: true,
      message: 'WhatsApp desconectado com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao desconectar:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao desconectar' },
      { status: 500 }
    );
  }
}
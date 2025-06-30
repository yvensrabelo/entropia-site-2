import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cpf = searchParams.get('cpf');

  console.log('🔍 [API MINUTOS] Requisição recebida para CPF:', cpf);

  if (!cpf) {
    return NextResponse.json({ error: 'CPF não fornecido.' }, { status: 400 });
  }

  try {
    // Chamar função SQL
    const { data, error } = await supabase
      .rpc('minutos_do_mes', { cpf_input: cpf });

    if (error) {
      console.error('❌ [API MINUTOS] Erro na RPC:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ [API MINUTOS] Resultado da RPC:', data);

    // Retornar resultado completo
    return NextResponse.json({ 
      minutos: data || 0,
      horas_estimada: Math.round(((data || 0) / 60) * 100) / 100,
      cpf_consultado: cpf,
      mes_referencia: new Date().toISOString().substring(0, 7) // YYYY-MM
    });

  } catch (error) {
    console.error('💥 [API MINUTOS] Erro interno:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

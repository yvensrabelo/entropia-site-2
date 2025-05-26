import { NextRequest, NextResponse } from 'next/server';
import { EvolutionAPIClient, saveMessage, isAllowedTime, checkRateLimit } from '@/lib/evolution-api';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, type = 'text', aluno_id } = body;

    // Validações
    if (!to || !message) {
      return NextResponse.json(
        { error: 'Número e mensagem são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar horário permitido
    if (!isAllowedTime()) {
      return NextResponse.json(
        { error: 'Envio permitido apenas entre 8h e 20h' },
        { status: 403 }
      );
    }

    // Verificar rate limit
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Limite de mensagens excedido. Tente novamente em 1 hora.' },
        { status: 429 }
      );
    }

    // Validar número
    if (!EvolutionAPIClient.isValidPhoneNumber(to)) {
      return NextResponse.json(
        { error: 'Número de telefone inválido' },
        { status: 400 }
      );
    }

    // Obter cliente da API
    const client = await EvolutionAPIClient.fromDatabase();
    if (!client) {
      return NextResponse.json(
        { error: 'WhatsApp não configurado' },
        { status: 500 }
      );
    }

    // Verificar se está conectado
    const status = await client.checkStatus();
    if (!status.connected) {
      return NextResponse.json(
        { error: 'WhatsApp não está conectado' },
        { status: 503 }
      );
    }

    // Salvar mensagem como pendente
    await saveMessage({
      aluno_id,
      to_number: to,
      message,
      type,
      status: 'pending'
    });

    // Enviar mensagem
    try {
      const result = await client.sendText({
        number: to,
        text: message
      });

      // Atualizar status para enviada
      await saveMessage({
        aluno_id,
        to_number: to,
        message,
        type,
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      return NextResponse.json({
        success: true,
        messageId: result.key?.id || result.id,
        message: 'Mensagem enviada com sucesso'
      });

    } catch (sendError: any) {
      // Salvar erro
      await saveMessage({
        aluno_id,
        to_number: to,
        message,
        type,
        status: 'failed',
        error_message: sendError.message
      });

      throw sendError;
    }

  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar mensagem' },
      { status: 500 }
    );
  }
}
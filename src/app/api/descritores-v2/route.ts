import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase com service role para operações administrativas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rate limiting simples
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string, maxRequests = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  return 'unknown';
}

// ====================================================================
// GET - Buscar descritores (para professores e admin)
// ====================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const professorCpf = searchParams.get('professor_cpf');
    const data = searchParams.get('data');
    const turmaId = searchParams.get('turma_id');
    const isAdmin = searchParams.get('admin') === 'true';

    let query = supabase
      .from('vw_descritores_completos')
      .select('*')
      .order('data', { ascending: false })
      .order('tempo', { ascending: true });

    // Filtros baseados nos parâmetros
    if (data) {
      query = query.eq('data', data);
    }

    if (turmaId) {
      query = query.eq('turma_id', turmaId);
    }

    // Se não for admin, filtrar apenas pelo professor
    if (!isAdmin && professorCpf) {
      query = query.eq('professor_cpf', professorCpf);
    }

    const { data: descritores, error } = await query;

    if (error) {
      console.error('Erro ao buscar descritores:', error);
      return NextResponse.json({ error: 'Erro ao buscar descritores' }, { status: 500 });
    }

    return NextResponse.json({ descritores });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ====================================================================
// POST - Criar/atualizar descritor
// ====================================================================
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    // Rate limiting
    if (!checkRateLimit(clientIP, 30, 60000)) {
      return NextResponse.json({ error: 'Rate limit excedido' }, { status: 429 });
    }

    const body = await request.json();
    const {
      horario_id,
      professor_cpf,
      data,
      topico_id,
      descricao_livre,
      is_admin = false
    } = body;

    // Validações básicas
    if (!horario_id || !professor_cpf || !data || !descricao_livre) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios: horario_id, professor_cpf, data, descricao_livre' 
      }, { status: 400 });
    }

    if (descricao_livre.length < 10) {
      return NextResponse.json({ 
        error: 'Descrição deve ter pelo menos 10 caracteres' 
      }, { status: 400 });
    }

    // Buscar professor pelo CPF
    const { data: professor, error: professorError } = await supabase
      .from('professores')
      .select('id, nome, ativo')
      .eq('cpf', professor_cpf)
      .single();

    if (professorError || !professor) {
      return NextResponse.json({ error: 'Professor não encontrado' }, { status: 404 });
    }

    if (!professor.ativo) {
      return NextResponse.json({ error: 'Professor inativo' }, { status: 403 });
    }

    // Verificar se pode preencher o descritor (apenas se não for admin)
    if (!is_admin) {
      const { data: podePreencherResult, error: validacaoError } = await supabase
        .rpc('fn_pode_preencher_descritor', {
          p_horario_id: horario_id,
          p_data: data,
          p_professor_id: professor.id
        });

      if (validacaoError) {
        console.error('Erro na validação:', validacaoError);
        return NextResponse.json({ error: 'Erro na validação' }, { status: 500 });
      }

      if (!podePreencherResult) {
        return NextResponse.json({ 
          error: 'Descritor só pode ser preenchido após o horário da aula' 
        }, { status: 403 });
      }
    }

    // Buscar se já existe descritor
    const { data: descritorExistente } = await supabase
      .from('descritores')
      .select('id, editavel, editado_admin')
      .eq('horario_id', horario_id)
      .eq('data', data)
      .single();

    const userAgent = request.headers.get('user-agent') || '';
    
    let resultado;

    if (descritorExistente) {
      // Atualizar descritor existente
      if (!descritorExistente.editavel && !is_admin) {
        return NextResponse.json({ 
          error: 'Descritor não pode mais ser editado' 
        }, { status: 403 });
      }

      const { data: descritorAtualizado, error: updateError } = await supabase
        .from('descritores')
        .update({
          topico_id,
          descricao_livre,
          editado_admin: is_admin,
          admin_que_editou: is_admin ? 'admin' : null,
          ip_submissao: clientIP,
          user_agent: userAgent,
          updated_at: new Date().toISOString()
        })
        .eq('id', descritorExistente.id)
        .select()
        .single();

      if (updateError) {
        console.error('Erro ao atualizar:', updateError);
        return NextResponse.json({ error: 'Erro ao atualizar descritor' }, { status: 500 });
      }

      resultado = descritorAtualizado;
    } else {
      // Criar novo descritor
      const { data: novoDescritor, error: insertError } = await supabase
        .from('descritores')
        .insert({
          horario_id,
          professor_id: professor.id,
          data,
          topico_id,
          descricao_livre,
          editado_admin: is_admin,
          admin_que_editou: is_admin ? 'admin' : null,
          ip_submissao: clientIP,
          user_agent: userAgent
        })
        .select()
        .single();

      if (insertError) {
        console.error('Erro ao criar:', insertError);
        return NextResponse.json({ error: 'Erro ao criar descritor' }, { status: 500 });
      }

      resultado = novoDescritor;
    }

    // Buscar dados completos para retorno
    const { data: descritorCompleto } = await supabase
      .from('vw_descritores_completos')
      .select('*')
      .eq('id', resultado.id)
      .single();

    return NextResponse.json({ 
      success: true, 
      descritor: descritorCompleto,
      action: descritorExistente ? 'updated' : 'created'
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ====================================================================
// PATCH - Operações administrativas (bloquear edição, enviar, etc.)
// ====================================================================
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, descritor_ids, turma_id, data } = body;

    switch (action) {
      case 'bloquear_edicao':
        if (!descritor_ids || !Array.isArray(descritor_ids)) {
          return NextResponse.json({ error: 'descritor_ids deve ser um array' }, { status: 400 });
        }

        const { error: bloqueioError } = await supabase
          .from('descritores')
          .update({ editavel: false })
          .in('id', descritor_ids);

        if (bloqueioError) {
          return NextResponse.json({ error: 'Erro ao bloquear edição' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Edição bloqueada com sucesso' });

      case 'preparar_envio':
        if (!turma_id || !data) {
          return NextResponse.json({ error: 'turma_id e data são obrigatórios' }, { status: 400 });
        }

        const { data: descritoresEnvio, error: preparacaoError } = await supabase
          .rpc('fn_preparar_envio_turma', {
            p_turma_id: turma_id,
            p_data: data
          });

        if (preparacaoError) {
          return NextResponse.json({ error: 'Erro ao preparar envio' }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          descritores: descritoresEnvio,
          total: descritoresEnvio.length
        });

      case 'confirmar_envio':
        if (!descritor_ids || !Array.isArray(descritor_ids)) {
          return NextResponse.json({ error: 'descritor_ids deve ser um array' }, { status: 400 });
        }

        // Marcar como enviado e bloquear edição
        const { error: envioError } = await supabase
          .from('descritores')
          .update({
            enviado: true,
            status_envio: 'sucesso',
            data_envio: new Date().toISOString(),
            editavel: false
          })
          .in('id', descritor_ids);

        if (envioError) {
          return NextResponse.json({ error: 'Erro ao confirmar envio' }, { status: 500 });
        }

        // Aqui você pode adicionar a integração com webhook/N8N
        // const webhookUrl = process.env.WEBHOOK_PAIS_URL;
        // if (webhookUrl) {
        //   try {
        //     await fetch(webhookUrl, {
        //       method: 'POST',
        //       headers: { 'Content-Type': 'application/json' },
        //       body: JSON.stringify({ descritor_ids, turma_id, data })
        //     });
        //   } catch (webhookError) {
        //     console.error('Erro no webhook:', webhookError);
        //   }
        // }

        return NextResponse.json({ 
          success: true, 
          message: 'Descritores enviados com sucesso',
          enviados: descritor_ids.length
        });

      default:
        return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ====================================================================
// DELETE - Remover descritor (apenas admin)
// ====================================================================
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const descritorId = searchParams.get('id');

    if (!descritorId) {
      return NextResponse.json({ error: 'ID do descritor é obrigatório' }, { status: 400 });
    }

    // Verificar se o descritor existe e não foi enviado
    const { data: descritor, error: buscaError } = await supabase
      .from('descritores')
      .select('id, enviado')
      .eq('id', descritorId)
      .single();

    if (buscaError || !descritor) {
      return NextResponse.json({ error: 'Descritor não encontrado' }, { status: 404 });
    }

    if (descritor.enviado) {
      return NextResponse.json({ 
        error: 'Não é possível remover descritor já enviado' 
      }, { status: 403 });
    }

    // Remover descritor
    const { error: deleteError } = await supabase
      .from('descritores')
      .delete()
      .eq('id', descritorId);

    if (deleteError) {
      return NextResponse.json({ error: 'Erro ao remover descritor' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Descritor removido com sucesso' });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
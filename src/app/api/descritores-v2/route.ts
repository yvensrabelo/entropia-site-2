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

    console.log('🔍 [DESCRITORES API] Parâmetros recebidos:', {
      professorCpf,
      data,
      turmaId,
      isAdmin
    });

    // Validações básicas
    if (!isAdmin && !professorCpf) {
      return NextResponse.json({ 
        error: 'professor_cpf é obrigatório para consultas não-admin' 
      }, { status: 400 });
    }

    // Se nenhum filtro específico foi fornecido, usar últimos 7 dias
    let dataInicio = data;
    let dataFim = data;
    
    if (!data) {
      const agora = new Date();
      const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
      dataInicio = seteDiasAtras.toISOString().split('T')[0];
      dataFim = agora.toISOString().split('T')[0];
      
      console.log('📅 [DESCRITORES API] Usando fallback últimos 7 dias:', { dataInicio, dataFim });
    }

    // Query principal usando tabelas diretas em vez de view
    let query = supabase
      .from('descritores')
      .select(`
        id,
        data,
        descricao_livre,
        topico_id,
        minutos_aula,
        editavel,
        enviado,
        created_at,
        updated_at,
        horario_id,
        professor_id,
        topico:topicos(id, nome),
        professores(id, nome, cpf),
        horarios_aulas(
          id,
          tempo,
          hora_inicio,
          hora_fim,
          dia_semana,
          turma_id,
          materia_id,
          materias(id, nome, cor_hex),
          turmas_sistema(id, codigo, nome)
        )
      `)
      .order('data', { ascending: false })
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (data) {
      query = query.eq('data', data);
    } else {
      query = query.gte('data', dataInicio).lte('data', dataFim);
    }

    if (turmaId) {
      // Filtrar por turma através do relacionamento
      query = query.eq('horarios_aulas.turma_id', turmaId);
    }

    // Se não for admin, filtrar por professor
    if (!isAdmin && professorCpf) {
      // Buscar primeiro o ID do professor pelo CPF
      const { data: professor, error: profError } = await supabase
        .from('professores')
        .select('id')
        .eq('cpf', professorCpf.replace(/\D/g, ''))
        .single();

      if (profError || !professor) {
        console.error('❌ [DESCRITORES API] Professor não encontrado:', profError);
        return NextResponse.json({ error: 'Professor não encontrado' }, { status: 404 });
      }

      query = query.eq('professor_id', professor.id);
    }

    const { data: descritores, error } = await query;

    if (error) {
      console.error('❌ [DESCRITORES API] Erro na query:', error);
      return NextResponse.json({ 
        error: 'Erro ao buscar descritores',
        details: error.message 
      }, { status: 500 });
    }

    console.log('✅ [DESCRITORES API] Descritores encontrados:', descritores?.length || 0);

    return NextResponse.json({ 
      descritores: descritores || [],
      filtros_aplicados: {
        data: data || `${dataInicio} até ${dataFim}`,
        turma_id: turmaId,
        is_admin: isAdmin,
        professor_cpf: professorCpf
      }
    });

  } catch (error) {
    console.error('💥 [DESCRITORES API] Erro interno:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
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
      // Buscar informações do horário para validar
      const { data: horarioInfo, error: horarioError } = await supabase
        .from('horarios_aulas')
        .select('hora_fim')
        .eq('id', horario_id)
        .single();

      if (horarioError || !horarioInfo) {
        return NextResponse.json({ error: 'Horário não encontrado' }, { status: 404 });
      }

      // Verificar se já passou do horário de fim da aula
      const agora = new Date();
      const horarioFim = new Date(`${data}T${horarioInfo.hora_fim}`);
      
      if (agora < horarioFim) {
        return NextResponse.json({ 
          error: 'A aula ainda não terminou' 
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
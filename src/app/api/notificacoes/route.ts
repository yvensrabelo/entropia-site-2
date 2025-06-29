import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ====================================================================
// GET - Verificar professores que precisam de notificação
// ====================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const antecedencia = Number(searchParams.get('antecedencia')) || 60; // minutos
    const dataHoje = new Date().toISOString().split('T')[0];
    const agora = new Date();
    const horaLimite = new Date(agora.getTime() + (antecedencia * 60 * 1000));

    // Buscar horários que começam na próxima hora
    const { data: horariosProximos, error } = await supabase
      .from('vw_grade_completa')
      .select('*')
      .eq('ativo', true)
      .gte('hora_inicio', agora.toTimeString().split(' ')[0])
      .lte('hora_inicio', horaLimite.toTimeString().split(' ')[0]);

    if (error) {
      console.error('Erro ao buscar horários:', error);
      return NextResponse.json({ error: 'Erro ao buscar horários' }, { status: 500 });
    }

    // Filtrar apenas os horários de hoje (considerando dia da semana)
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const diaHoje = diasSemana[agora.getDay()];

    const horariosHoje = horariosProximos.filter(h => h.dia_semana === diaHoje);

    // Verificar quais professores ainda não foram notificados
    const professoresParaNotificar = [];

    for (const horario of horariosHoje) {
      if (!horario.professor_cpf) continue;

      // Verificar se já foi notificado hoje para este horário
      const { data: notificacaoExistente } = await supabase
        .from('notificacoes_professores')
        .select('id')
        .eq('professor_cpf', horario.professor_cpf)
        .eq('horario_id', horario.horario_id)
        .eq('data', dataHoje)
        .eq('tipo', 'lembrete_aula')
        .single();

      if (!notificacaoExistente) {
        professoresParaNotificar.push({
          professor_nome: horario.professor_nome,
          professor_cpf: horario.professor_cpf,
          materia_nome: horario.materia_nome,
          turma_nome: horario.turma_nome,
          hora_inicio: horario.hora_inicio,
          hora_fim: horario.hora_fim,
          horario_id: horario.horario_id,
          telefone: horario.professor_telefone
        });
      }
    }

    return NextResponse.json({
      total: professoresParaNotificar.length,
      professores: professoresParaNotificar,
      data: dataHoje,
      hora_verificacao: agora.toISOString()
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ====================================================================
// POST - Enviar notificações
// ====================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, professor_cpf, horario_id, telefone, mensagem_personalizada } = body;

    switch (action) {
      case 'enviar_lembrete':
        if (!professor_cpf || !horario_id) {
          return NextResponse.json({ 
            error: 'professor_cpf e horario_id são obrigatórios' 
          }, { status: 400 });
        }

        // Buscar dados do horário
        const { data: horario, error: horarioError } = await supabase
          .from('vw_grade_completa')
          .select('*')
          .eq('horario_id', horario_id)
          .eq('professor_cpf', professor_cpf)
          .single();

        if (horarioError || !horario) {
          return NextResponse.json({ error: 'Horário não encontrado' }, { status: 404 });
        }

        // Gerar mensagem
        const mensagem = mensagem_personalizada || 
          `🎓 Olá, Professor ${horario.professor_nome}!\n\n` +
          `📚 Lembrete: Sua aula de *${horario.materia_nome}* com a turma *${horario.turma_nome}* ` +
          `está programada para iniciar às *${horario.hora_inicio}*.\n\n` +
          `⏰ Duração: ${horario.hora_inicio} - ${horario.hora_fim}\n` +
          `📍 Local: ${horario.sala || 'A definir'}\n\n` +
          `Tenha uma excelente aula! 📖✨\n\n` +
          `_Entropia Cursinho_`;

        // Tentar enviar via WhatsApp (usando Evolution API existente)
        let statusEnvio = 'falha';
        let erroEnvio = null;

        try {
          const whatsappResponse = await fetch('/api/whatsapp/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telefone: telefone || horario.professor_telefone,
              mensagem: mensagem
            })
          });

          if (whatsappResponse.ok) {
            statusEnvio = 'sucesso';
          } else {
            const whatsappError = await whatsappResponse.json();
            erroEnvio = whatsappError.error || 'Erro no envio WhatsApp';
          }
        } catch (whatsappError) {
          erroEnvio = 'Erro de conexão com WhatsApp';
        }

        // Registrar notificação no banco
        const { data: notificacao, error: notificacaoError } = await supabase
          .from('notificacoes_professores')
          .insert({
            professor_cpf,
            horario_id,
            data: new Date().toISOString().split('T')[0],
            tipo: 'lembrete_aula',
            mensagem,
            telefone_usado: telefone || horario.professor_telefone,
            status_envio: statusEnvio,
            erro_envio: erroEnvio,
            enviado_em: new Date().toISOString()
          })
          .select()
          .single();

        if (notificacaoError) {
          console.error('Erro ao registrar notificação:', notificacaoError);
        }

        return NextResponse.json({
          success: statusEnvio === 'sucesso',
          status_envio: statusEnvio,
          erro_envio: erroEnvio,
          notificacao_id: notificacao?.id,
          professor: horario.professor_nome,
          mensagem_enviada: mensagem
        });

      case 'enviar_lote':
        const { professores } = body;
        
        if (!Array.isArray(professores) || professores.length === 0) {
          return NextResponse.json({ 
            error: 'Lista de professores é obrigatória' 
          }, { status: 400 });
        }

        const resultados = [];

        for (const prof of professores) {
          try {
            // Fazer chamada recursiva para cada professor
            const resultado = await fetch(request.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'enviar_lembrete',
                professor_cpf: prof.professor_cpf,
                horario_id: prof.horario_id,
                telefone: prof.telefone
              })
            });

            const data = await resultado.json();
            resultados.push({
              professor: prof.professor_nome,
              success: data.success,
              erro: data.erro_envio
            });

            // Delay entre envios para não sobrecarregar
            await new Promise(resolve => setTimeout(resolve, 1000));

          } catch (error) {
            resultados.push({
              professor: prof.professor_nome,
              success: false,
              erro: 'Erro interno'
            });
          }
        }

        const sucessos = resultados.filter(r => r.success).length;
        const falhas = resultados.filter(r => !r.success).length;

        return NextResponse.json({
          total_enviados: professores.length,
          sucessos,
          falhas,
          detalhes: resultados
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
// PATCH - Configurações de notificação
// ====================================================================
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'atualizar_configuracao':
        const { chave, valor } = body;
        
        if (!chave || valor === undefined) {
          return NextResponse.json({ 
            error: 'chave e valor são obrigatórios' 
          }, { status: 400 });
        }

        const { error } = await supabase
          .from('configuracoes_sistema')
          .update({ 
            valor: valor.toString(),
            updated_at: new Date().toISOString()
          })
          .eq('chave', chave);

        if (error) {
          return NextResponse.json({ error: 'Erro ao atualizar configuração' }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          message: `Configuração ${chave} atualizada para ${valor}` 
        });

      case 'obter_configuracoes':
        const { data: configs, error: configError } = await supabase
          .from('configuracoes_sistema')
          .select('chave, valor, descricao')
          .in('chave', [
            'notificacao_antecedencia',
            'notificacao_ativa',
            'webhook_pais_url',
            'whatsapp_ativo'
          ]);

        if (configError) {
          return NextResponse.json({ error: 'Erro ao buscar configurações' }, { status: 500 });
        }

        const configuracoes = configs.reduce((acc, config) => {
          acc[config.chave] = config.valor;
          return acc;
        }, {} as Record<string, string>);

        return NextResponse.json({ configuracoes });

      case 'historico_notificacoes':
        const { professor_cpf, data_inicio, data_fim } = body;
        
        let query = supabase
          .from('notificacoes_professores')
          .select(`
            *,
            professores(nome, telefone)
          `)
          .order('enviado_em', { ascending: false })
          .limit(100);

        if (professor_cpf) {
          query = query.eq('professor_cpf', professor_cpf);
        }

        if (data_inicio) {
          query = query.gte('data', data_inicio);
        }

        if (data_fim) {
          query = query.lte('data', data_fim);
        }

        const { data: historico, error: historicoError } = await query;

        if (historicoError) {
          return NextResponse.json({ error: 'Erro ao buscar histórico' }, { status: 500 });
        }

        return NextResponse.json({ historico });

      default:
        return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
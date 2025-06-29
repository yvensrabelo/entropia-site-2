import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ====================================================================
// GET - Dados do professor (grade, descritores, pagamentos)
// ====================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get('cpf');
    const endpoint = searchParams.get('endpoint'); // 'perfil', 'grade', 'descritores', 'pagamentos'
    const data = searchParams.get('data');
    const mes = searchParams.get('mes');

    if (!cpf) {
      return NextResponse.json({ error: 'CPF é obrigatório' }, { status: 400 });
    }

    // Buscar professor
    const { data: professor, error: professorError } = await supabase
      .from('professores')
      .select(`
        id, 
        nome, 
        cpf, 
        telefone, 
        email, 
        valor_por_minuto, 
        ativo,
        materias(id, nome, cor_hex)
      `)
      .eq('cpf', cpf)
      .single();

    if (professorError || !professor) {
      return NextResponse.json({ error: 'Professor não encontrado' }, { status: 404 });
    }

    if (!professor.ativo) {
      return NextResponse.json({ error: 'Professor inativo' }, { status: 403 });
    }

    switch (endpoint) {
      case 'perfil':
        return NextResponse.json({ professor });

      case 'grade':
        // Buscar grade semanal do professor
        const { data: grade, error: gradeError } = await supabase
          .from('vw_grade_completa')
          .select('*')
          .eq('professor_cpf', cpf)
          .eq('ativo', true)
          .order('dia_semana')
          .order('tempo');

        if (gradeError) {
          return NextResponse.json({ error: 'Erro ao buscar grade' }, { status: 500 });
        }

        // Agrupar por dia da semana
        const gradePorDia = grade.reduce((acc, aula) => {
          if (!acc[aula.dia_semana]) {
            acc[aula.dia_semana] = [];
          }
          acc[aula.dia_semana].push(aula);
          return acc;
        }, {} as Record<string, any[]>);

        return NextResponse.json({ 
          professor,
          grade: gradePorDia,
          total_aulas_semana: grade.length
        });

      case 'descritores':
        if (!data) {
          return NextResponse.json({ error: 'Data é obrigatória para descritores' }, { status: 400 });
        }

        // Buscar descritores do professor para uma data específica
        const { data: descritores, error: descritoresError } = await supabase
          .from('descritores')
          .select(`
            id,
            data,
            descricao_livre,
            topico_id,
            minutos_aula,
            editavel,
            enviado,
            horario_id,
            topicos(nome),
            horarios_aulas(
              tempo,
              hora_inicio,
              hora_fim,
              materia_id,
              materias(nome, cor_hex),
              turmas_sistema(codigo, nome)
            )
          `)
          .eq('professor_id', professor.id)
          .eq('data', data)
          .order('created_at');

        if (descritoresError) {
          return NextResponse.json({ error: 'Erro ao buscar descritores' }, { status: 500 });
        }

        // Buscar grade do dia para comparar
        const diaSemana = new Date(data).toLocaleDateString('pt-BR', { weekday: 'long' })
          .toLowerCase().replace('-feira', '').replace('á', 'a').replace('ç', 'c');

        const { data: gradeData, error: gradeDiaError } = await supabase
          .from('vw_grade_completa')
          .select('*')
          .eq('professor_cpf', cpf)
          .eq('dia_semana', diaSemana)
          .order('tempo');

        if (gradeDiaError) {
          return NextResponse.json({ error: 'Erro ao buscar grade do dia' }, { status: 500 });
        }

        // Combinar grade com descritores
        const aulasDoDia = gradeData.map(aula => {
          const descritor = descritores.find(d => d.horario_id === aula.horario_id);
          return {
            ...aula,
            descritor_preenchido: !!descritor,
            descritor: descritor || null,
            pode_preencher: new Date(data + 'T' + aula.hora_inicio) <= new Date()
          };
        });

        return NextResponse.json({ 
          professor,
          data,
          aulas: aulasDoDia,
          total_aulas: aulasDoDia.length,
          descritores_preenchidos: descritores.length
        });

      case 'pagamentos':
        const mesReferencia = mes || new Date().toISOString().slice(0, 7) + '-01';

        // Buscar dados de pagamento do mês
        const { data: pagamento, error: pagamentoError } = await supabase
          .rpc('fn_calcular_pagamento_professor', {
            p_professor_id: professor.id,
            p_mes_ano: mesReferencia
          });

        if (pagamentoError) {
          return NextResponse.json({ error: 'Erro ao calcular pagamento' }, { status: 500 });
        }

        // Buscar detalhes dos descritores do mês
        const { data: detalhesDescritores, error: detalhesError } = await supabase
          .from('minutos_professores')
          .select(`
            data,
            minutos,
            valor_total,
            descritores(
              id,
              turma_id,
              horarios_aulas(
                tempo,
                hora_inicio,
                hora_fim,
                turmas_sistema(nome),
                materias(nome)
              )
            )
          `)
          .eq('professor_id', professor.id)
          .gte('data', mesReferencia)
          .lt('data', new Date(new Date(mesReferencia).getFullYear(), new Date(mesReferencia).getMonth() + 1, 1).toISOString().slice(0, 10))
          .order('data', { ascending: false });

        if (detalhesError) {
          console.error('Erro ao buscar detalhes:', detalhesError);
        }

        return NextResponse.json({ 
          professor,
          mes_referencia: mesReferencia,
          resumo: pagamento[0] || { total_aulas: 0, total_minutos: 0, valor_total: 0 },
          detalhes: detalhesDescritores || [],
          valor_por_minuto: professor.valor_por_minuto
        });

      default:
        return NextResponse.json({ error: 'Endpoint não reconhecido' }, { status: 400 });
    }

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ====================================================================
// POST - Login do professor
// ====================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpf, action = 'login' } = body;

    if (action === 'login') {
      if (!cpf) {
        return NextResponse.json({ error: 'CPF é obrigatório' }, { status: 400 });
      }

      // Validar formato do CPF (11 dígitos)
      const cpfLimpo = cpf.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        return NextResponse.json({ error: 'CPF deve ter 11 dígitos' }, { status: 400 });
      }

      // Buscar professor
      const { data: professor, error } = await supabase
        .from('professores')
        .select(`
          id, 
          nome, 
          cpf, 
          ativo,
          materias(id, nome, cor_hex)
        `)
        .eq('cpf', cpfLimpo)
        .single();

      if (error || !professor) {
        return NextResponse.json({ error: 'Professor não encontrado' }, { status: 404 });
      }

      if (!professor.ativo) {
        return NextResponse.json({ error: 'Professor inativo' }, { status: 403 });
      }

      // Log do acesso
      await supabase
        .from('descritor_logs')
        .insert({
          usuario_id: professor.cpf,
          usuario_tipo: 'professor',
          acao: 'login',
          ip_address: getClientIP(request),
          user_agent: request.headers.get('user-agent'),
          observacoes: 'Login via painel do professor'
        });

      return NextResponse.json({ 
        success: true,
        professor: {
          id: professor.id,
          nome: professor.nome,
          cpf: professor.cpf,
          materia: professor.materias?.[0]?.nome || 'Não definida',
          materia_id: professor.materias?.[0]?.id || null,
          cor_materia: professor.materias?.[0]?.cor_hex || '#3B82F6'
        },
        message: `Bem-vindo, ${professor.nome}!`
      });
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ====================================================================
// PATCH - Buscar tópicos por matéria
// ====================================================================
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, materia_id } = body;

    if (action === 'buscar_topicos') {
      if (!materia_id) {
        return NextResponse.json({ error: 'materia_id é obrigatório' }, { status: 400 });
      }

      const { data: topicos, error } = await supabase
        .from('topicos')
        .select('id, nome, descricao, ordem')
        .eq('materia_id', materia_id)
        .eq('ativo', true)
        .order('ordem')
        .order('nome');

      if (error) {
        return NextResponse.json({ error: 'Erro ao buscar tópicos' }, { status: 500 });
      }

      return NextResponse.json({ topicos });
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ====================================================================
// Função auxiliar para obter IP do cliente
// ====================================================================
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  return 'unknown';
}
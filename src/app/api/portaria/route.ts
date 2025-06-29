import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ====================================================================
// GET - Status da portaria (professores esperados por turno)
// ====================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const turno = searchParams.get('turno'); // manha, tarde, noite
    const data = searchParams.get('data') || new Date().toISOString().split('T')[0];

    let query = supabase
      .from('vw_status_portaria')
      .select('*')
      .eq('data', data)
      .order('tempo', { ascending: true })
      .order('hora_inicio', { ascending: true });

    if (turno) {
      query = query.eq('turno', turno);
    }

    const { data: statusPortaria, error } = await query;

    if (error) {
      console.error('Erro ao buscar status da portaria:', error);
      return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    }

    // Agrupar por turno
    const porTurno = statusPortaria.reduce((acc, item) => {
      if (!acc[item.turno]) {
        acc[item.turno] = [];
      }
      acc[item.turno].push(item);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({ 
      data,
      turnos: porTurno,
      total: statusPortaria.length,
      ultima_atualizacao: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ====================================================================
// POST - Registrar presença/atraso do professor
// ====================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      professor_id,
      horario_id,
      status_presenca, // 'presente', 'atrasado', 'ausente'
      data,
      minutos_atraso = 0,
      observacoes = '',
      registrado_por = 'portaria'
    } = body;

    // Validações
    if (!professor_id || !horario_id || !status_presenca) {
      return NextResponse.json({ 
        error: 'Campos obrigatórios: professor_id, horario_id, status_presenca' 
      }, { status: 400 });
    }

    if (!['presente', 'atrasado', 'ausente'].includes(status_presenca)) {
      return NextResponse.json({ 
        error: 'status_presenca deve ser: presente, atrasado ou ausente' 
      }, { status: 400 });
    }

    const dataRegistro = data || new Date().toISOString().split('T')[0];
    const horaChegada = status_presenca !== 'ausente' ? 
      new Date().toTimeString().split(' ')[0] : null;

    // Inserir ou atualizar presença
    const { data: presenca, error } = await supabase
      .from('professor_presencas')
      .upsert({
        professor_id,
        data: dataRegistro,
        horario_id,
        status_presenca,
        hora_chegada: horaChegada,
        minutos_atraso: status_presenca === 'atrasado' ? minutos_atraso : 0,
        observacoes,
        registrado_por,
        ip_registro: getClientIP(request),
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'professor_id,data,horario_id' 
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao registrar presença:', error);
      return NextResponse.json({ error: 'Erro ao registrar presença' }, { status: 500 });
    }

    // Buscar dados completos do professor para retorno
    const { data: professorInfo } = await supabase
      .from('vw_status_portaria')
      .select('*')
      .eq('professor_id', professor_id)
      .eq('horario_id', horario_id)
      .eq('data', dataRegistro)
      .single();

    return NextResponse.json({ 
      success: true, 
      presenca,
      professor_info: professorInfo,
      message: `Presença registrada: ${status_presenca}`
    });

  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// ====================================================================
// PATCH - Operações administrativas da portaria
// ====================================================================
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'verificar_senha':
        const { senha } = body;
        
        if (!senha) {
          return NextResponse.json({ error: 'Senha é obrigatória' }, { status: 400 });
        }

        // Buscar senha configurada
        const { data: config, error: configError } = await supabase
          .from('configuracoes_sistema')
          .select('valor')
          .eq('chave', 'portaria_senha')
          .single();

        if (configError) {
          console.error('Erro ao buscar configuração:', configError);
          return NextResponse.json({ error: 'Erro na configuração' }, { status: 500 });
        }

        const senhaCorreta = senha === config.valor;

        return NextResponse.json({ 
          success: senhaCorreta,
          message: senhaCorreta ? 'Senha correta' : 'Senha incorreta'
        });

      case 'atualizar_configuracao':
        const { chave, valor } = body;
        
        if (!chave || valor === undefined) {
          return NextResponse.json({ error: 'Chave e valor são obrigatórios' }, { status: 400 });
        }

        const { error: updateError } = await supabase
          .from('configuracoes_sistema')
          .update({ 
            valor: valor.toString(),
            updated_at: new Date().toISOString()
          })
          .eq('chave', chave);

        if (updateError) {
          return NextResponse.json({ error: 'Erro ao atualizar configuração' }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Configuração atualizada com sucesso' 
        });

      case 'resetar_presencas_dia':
        const { data: dataReset } = body;
        const dataParaResetar = dataReset || new Date().toISOString().split('T')[0];

        // Resetar todas as presenças do dia para 'ausente'
        const { error: resetError } = await supabase
          .from('professor_presencas')
          .update({ 
            status_presenca: 'ausente',
            hora_chegada: null,
            minutos_atraso: 0,
            updated_at: new Date().toISOString()
          })
          .eq('data', dataParaResetar);

        if (resetError) {
          return NextResponse.json({ error: 'Erro ao resetar presenças' }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          message: `Presenças do dia ${dataParaResetar} resetadas` 
        });

      case 'inicializar_presencas':
        // Executar função de inicialização diária
        const { error: initError } = await supabase
          .rpc('fn_inicializacao_diaria');

        if (initError) {
          console.error('Erro na inicialização:', initError);
          return NextResponse.json({ error: 'Erro na inicialização' }, { status: 500 });
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Presenças inicializadas com sucesso' 
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
// Função auxiliar para obter IP do cliente
// ====================================================================
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) return forwarded.split(',')[0].trim();
  if (realIP) return realIP;
  return 'unknown';
}
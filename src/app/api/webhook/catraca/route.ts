import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EvolutionAPIClient, saveMessage } from '@/lib/evolution-api';

// Em API routes, as variáveis de ambiente devem ser acessadas diretamente
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://unwfeasvyeqyddlamjwo.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVud2ZlYXN2eWVxeWRkbGFtandvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MjYzMzQsImV4cCI6MjA2MzUwMjMzNH0.oUFUKH9QiW6MAottuB1U0FZ1L7fWQKZL9uRjfbg4zx4';
  
  return createClient(supabaseUrl, supabaseKey);
}

interface CatracaWebhook {
  enrollid: number;
  nome: string;
  time: string;
  access: number;
  message: string;
}

// Log para debug
function logWebhook(data: CatracaWebhook, status: string, details?: string) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] CATRACA WEBHOOK - ${status}`);
  console.log(`  Nome: ${data.nome}`);
  console.log(`  EnrollID: ${data.enrollid}`);
  console.log(`  Time: ${data.time}`);
  console.log(`  Access: ${data.access}`);
  console.log(`  Message: ${data.message}`);
  if (details) {
    console.log(`  Detalhes: ${details}`);
  }
  console.log('---');
}

// Função para verificar e enviar notificação de chegada
async function verificarNotificacaoChegada(alunoId: string, horaChegada: string) {
  try {
    const supabase = getSupabaseClient();
    
    // Verificar se o aluno tem notificação de chegada ativa
    const { data: preferencias } = await supabase
      .from('whatsapp_preferences')
      .select('notify_arrival, whatsapp_number')
      .eq('aluno_id', alunoId)
      .single();
    
    if (!preferencias?.notify_arrival) {
      console.log('   Notificação de chegada desativada para este aluno');
      return;
    }
    
    // Verificar se há automação ativa para chegada
    const { data: automacao } = await supabase
      .from('whatsapp_automations')
      .select(`
        *,
        template:template_id(
          template,
          variables
        )
      `)
      .eq('type', 'arrival_notification')
      .eq('is_active', true)
      .single();
    
    if (!automacao) {
      console.log('   Nenhuma automação de chegada ativa');
      return;
    }
    
    // Buscar dados do aluno e responsável
    const { data: aluno } = await supabase
      .from('alunos')
      .select('nome, telefone, nome_responsavel, telefone_responsavel')
      .eq('id', alunoId)
      .single();
    
    if (!aluno) {
      console.log('   Dados do aluno não encontrados');
      return;
    }
    
    // Determinar número para envio
    const numeroDestino = preferencias.whatsapp_number || 
                          aluno.telefone_responsavel || 
                          aluno.telefone;
    
    if (!numeroDestino) {
      console.log('   Nenhum número de telefone disponível');
      return;
    }
    
    // Processar template
    let mensagem = automacao.template.template;
    mensagem = mensagem.replace(/{nome_aluno}/g, aluno.nome);
    mensagem = mensagem.replace(/{hora}/g, horaChegada.substring(0, 5));
    mensagem = mensagem.replace(/{nome_responsavel}/g, aluno.nome_responsavel || 'Responsável');
    
    console.log(`   Enviando notificação para: ${numeroDestino}`);
    
    // Enviar mensagem
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: numeroDestino,
        message: mensagem,
        type: 'arrival',
        aluno_id: alunoId
      })
    });
    
    if (response.ok) {
      console.log('   ✅ Notificação de chegada enviada com sucesso');
    } else {
      const error = await response.text();
      console.log(`   ❌ Erro ao enviar notificação: ${error}`);
    }
    
  } catch (error) {
    console.error('   Erro ao processar notificação de chegada:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('\n========== WEBHOOK CATRACA - INÍCIO ==========');
    
    // Cria cliente Supabase para esta requisição
    const supabase = getSupabaseClient();
    
    // Parse do body
    const data: CatracaWebhook = await request.json();
    console.log('1. Dados recebidos:', JSON.stringify(data, null, 2));
    
    // Log da requisição recebida
    logWebhook(data, 'RECEBIDO');
    
    // Validação básica
    if (!data.nome || !data.time) {
      console.log('2. ❌ Dados obrigatórios faltando');
      logWebhook(data, 'ERRO', 'Dados obrigatórios faltando');
      return NextResponse.json({ 
        success: true, 
        message: 'Dados incompletos mas processado' 
      });
    }
    
    // Se não foi liberado, apenas registra e retorna
    if (data.access !== 1) {
      console.log('2. ❌ Acesso bloqueado (access != 1)');
      logWebhook(data, 'BLOQUEADO', `Access = ${data.access}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Acesso bloqueado registrado' 
      });
    }
    
    console.log('2. ✅ Validação OK, access = 1');
    
    // Procura o aluno pelo nome
    console.log(`3. Buscando aluno: "${data.nome}"`);
    const { data: alunos, error: searchError } = await supabase
      .from('alunos')
      .select('id, nome')
      .ilike('nome', `%${data.nome}%`);
    
    if (searchError) {
      console.log('4. ❌ Erro ao buscar aluno:', searchError);
      logWebhook(data, 'ERRO', `Erro ao buscar aluno: ${searchError.message}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Erro ao buscar aluno mas processado' 
      });
    }
    
    console.log(`4. Resultado da busca: ${alunos?.length || 0} aluno(s) encontrado(s)`);
    if (alunos && alunos.length > 0) {
      console.log('   Alunos encontrados:', alunos.map(a => ({ id: a.id, nome: a.nome })));
    }
    
    if (!alunos || alunos.length === 0) {
      console.log('5. ❌ Nenhum aluno encontrado');
      logWebhook(data, 'ALUNO_NAO_ENCONTRADO');
      return NextResponse.json({ 
        success: true, 
        message: 'Aluno não encontrado mas processado' 
      });
    }
    
    // Se encontrou múltiplos, tenta match exato
    let aluno = alunos[0];
    if (alunos.length > 1) {
      console.log('5. Múltiplos alunos encontrados, tentando match exato...');
      const exactMatch = alunos.find(a => 
        a.nome.toUpperCase() === data.nome.toUpperCase()
      );
      if (exactMatch) {
        aluno = exactMatch;
        console.log('   ✅ Match exato encontrado');
      } else {
        console.log('   ⚠️  Usando primeiro resultado');
      }
    }
    
    console.log(`5. Aluno selecionado: ID=${aluno.id}, Nome="${aluno.nome}"`);
    
    // Extrai data e hora do timestamp
    // O formato esperado é "2025-05-24 12:14:56"
    let dataPresenca: string;
    let horaEntrada: string;
    
    try {
      // Tenta criar Date object do formato recebido
      const datetime = new Date(data.time.replace(' ', 'T'));
      
      if (isNaN(datetime.getTime())) {
        // Se falhar, tenta parsear manualmente
        const [datePart, timePart] = data.time.split(' ');
        dataPresenca = datePart;
        horaEntrada = timePart;
      } else {
        // Se sucesso, formata corretamente
        dataPresenca = datetime.toISOString().split('T')[0];
        horaEntrada = datetime.toTimeString().split(' ')[0];
      }
    } catch (err) {
      console.log('6. ⚠️  Erro ao processar data/hora, usando fallback');
      // Fallback: separa manualmente
      const [datePart, timePart] = data.time.split(' ');
      dataPresenca = datePart;
      horaEntrada = timePart || '00:00:00';
    }
    
    console.log(`6. Data/Hora processados: Data=${dataPresenca}, Hora=${horaEntrada}`);
    
    // Verifica se já existe presença nesta data
    console.log('7. Verificando presença existente...');
    const { data: presencaExistente, error: checkError } = await supabase
      .from('presencas')
      .select('id')
      .eq('aluno_id', aluno.id)
      .eq('data', dataPresenca)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.log('8. ❌ Erro ao verificar presença:', checkError);
      logWebhook(data, 'ERRO', `Erro ao verificar presença: ${checkError.message}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Erro ao verificar presença mas processado' 
      });
    }
    
    if (presencaExistente) {
      console.log('8. ⚠️  Presença já existe para hoje');
      logWebhook(data, 'PRESENCA_DUPLICADA', `Aluno ${aluno.nome} já registrou entrada hoje`);
      return NextResponse.json({ 
        success: true, 
        message: 'Presença já registrada hoje' 
      });
    }
    
    console.log('8. ✅ Nenhuma presença encontrada para hoje');
    
    // Prepara dados para inserir
    const presencaData = {
      aluno_id: aluno.id,
      data: dataPresenca,
      hora_entrada: horaEntrada,
      tipo: 'catraca',
      enrollid_catraca: data.enrollid,
      observacoes: `Catraca: ${data.message}` // Adiciona prefixo para identificar origem
    };
    
    console.log('9. Dados para inserir:', JSON.stringify(presencaData, null, 2));
    
    // Registra a presença
    console.log('10. Inserindo presença...');
    const { data: insertResult, error: insertError } = await supabase
      .from('presencas')
      .insert(presencaData)
      .select();
    
    if (insertError) {
      console.log('11. ❌ ERRO ao inserir presença:');
      console.log('    Erro:', insertError);
      console.log('    Mensagem:', insertError.message);
      console.log('    Detalhes:', insertError.details);
      console.log('    Hint:', insertError.hint);
      console.log('    Code:', insertError.code);
      
      logWebhook(data, 'ERRO', `Erro ao inserir presença: ${insertError.message}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Erro ao registrar presença mas processado' 
      });
    }
    
    console.log('11. ✅ SUCESSO! Presença inserida:', insertResult);
    console.log(`    Mensagem da catraca salva: "${data.message}"`);
    logWebhook(data, 'SUCESSO', `Presença registrada para ${aluno.nome} - Mensagem: ${data.message}`);
    
    // Verificar se deve enviar notificação de chegada
    console.log('12. Verificando notificação de chegada...');
    await verificarNotificacaoChegada(aluno.id, horaEntrada);
    
    console.log('========== WEBHOOK CATRACA - FIM ==========\n');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Presença registrada com sucesso',
      aluno: aluno.nome,
      data: dataPresenca,
      hora: horaEntrada
    });
    
  } catch (error) {
    console.error('[CATRACA] Erro não tratado:', error);
    console.log('========== WEBHOOK CATRACA - ERRO FATAL ==========\n');
    // SEMPRE retorna sucesso para não travar a catraca
    return NextResponse.json({ 
      success: true, 
      message: 'Erro processado' 
    });
  }
}

// Endpoint GET para verificar se está funcionando
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    endpoint: '/api/webhook/catraca',
    method: 'POST',
    expectedData: {
      enrollid: 'number',
      nome: 'string',
      time: 'datetime string',
      access: '1 = liberado, 0 = bloqueado',
      message: 'string'
    }
  });
}
// Script simplificado para criar matrículas
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Primeiro, vamos descobrir exatamente quais colunas existem
async function discoverMatriculasColumns() {
  console.log('🔍 Descobrindo estrutura real da tabela matriculas...\n');
  
  try {
    // Busca uma matrícula existente ou tenta criar uma mínima
    const { data: existing } = await supabase
      .from('matriculas')
      .select('*')
      .limit(1);
    
    if (existing && existing.length > 0) {
      console.log('Colunas encontradas:');
      Object.keys(existing[0]).forEach(col => {
        console.log(`  - ${col}`);
      });
      return Object.keys(existing[0]);
    }
    
    // Se não tem registros, tenta o mínimo possível
    console.log('Tentando descobrir estrutura mínima...');
    const minimalData = {
      aluno_id: (await supabase.from('alunos').select('id').limit(1).single()).data?.id,
      turma_id: (await supabase.from('turmas_config').select('id').limit(1).single()).data?.id,
      status: 'ativa'
    };
    
    const { error } = await supabase
      .from('matriculas')
      .insert(minimalData);
    
    console.log('Resultado:', error ? error.message : 'Sucesso');
    if (error && error.details) {
      console.log('Detalhes:', error.details);
    }
    
  } catch (err) {
    console.error('Erro:', err);
  }
}

// Função para detectar turma
async function detectTurmaId(turmaName) {
  if (!turmaName || turmaName.trim() === '') return null;

  const normalized = turmaName.trim().toUpperCase();
  
  let turno = null;
  if (normalized.includes('MATUTINO')) turno = 'MATUTINO';
  else if (normalized.includes('NOTURNO')) turno = 'NOTURNO';
  else if (normalized.includes('VESPERTINO')) turno = 'VESPERTINO';
  
  // Mapeamentos específicos
  if (normalized.includes('T1') && !normalized.includes('PREVEST')) {
    const { data } = await supabase
      .from('turmas_config')
      .select('id')
      .ilike('nome', '%PRIMEIRO ANO%')
      .single();
    return data?.id || null;
  }
  
  if (normalized.includes('T2') && !normalized.includes('PREVEST')) {
    const { data } = await supabase
      .from('turmas_config')
      .select('id')
      .ilike('nome', '%SEGUNDO ANO%')
      .single();
    return data?.id || null;
  }
  
  if (normalized.includes('PREVEST') && turno) {
    const { data } = await supabase
      .from('turmas_config')
      .select('id')
      .eq('nome', 'PREVEST')
      .eq('turno', turno)
      .limit(1);
    
    if (data && data.length > 0) {
      return data[0].id;
    }
  }
  
  return null;
}

// Criar matrículas com estrutura mínima
async function createMatriculasMinimal() {
  console.log('\n\n🎓 Criando matrículas com estrutura mínima...\n');
  
  const csvPath = path.join(process.cwd(), 'SUPER REGISTRO - CLIENTES.csv');
  const stats = {
    total: 0,
    created: 0,
    skipped: 0,
    errors: 0
  };
  
  try {
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });
    
    // Cache
    const turmaCache = new Map();
    const processedAlunos = new Set();
    
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const nomeAluno = row['NOME ALUNO']?.trim();
      const cpfAluno = row['CPF ALUNO']?.toString().replace(/\D/g, '');
      const turmaNome = row['TURMA']?.trim();
      
      if (!nomeAluno || !turmaNome) continue;
      
      stats.total++;
      
      // Busca aluno
      let query = supabase.from('alunos').select('id, nome');
      if (cpfAluno && cpfAluno.length === 11) {
        query = query.eq('cpf', cpfAluno);
      } else {
        query = query.eq('nome', nomeAluno);
      }
      
      const { data: alunos } = await query;
      if (!alunos || alunos.length === 0) {
        console.log(`❌ Aluno não encontrado: ${nomeAluno}`);
        continue;
      }
      
      const alunoId = alunos[0].id;
      
      // Evita duplicatas
      if (processedAlunos.has(alunoId)) {
        stats.skipped++;
        continue;
      }
      processedAlunos.add(alunoId);
      
      // Verifica se já tem matrícula
      const { data: matriculaExistente } = await supabase
        .from('matriculas')
        .select('id')
        .eq('aluno_id', alunoId);
      
      if (matriculaExistente && matriculaExistente.length > 0) {
        stats.skipped++;
        continue;
      }
      
      // Detecta turma
      let turmaId = null;
      if (turmaCache.has(turmaNome)) {
        turmaId = turmaCache.get(turmaNome);
      } else {
        turmaId = await detectTurmaId(turmaNome);
        turmaCache.set(turmaNome, turmaId);
      }
      
      if (!turmaId) {
        console.log(`⚠️  Turma não encontrada: "${turmaNome}" para ${nomeAluno}`);
        stats.errors++;
        continue;
      }
      
      // Cria matrícula MÍNIMA
      const matriculaData = {
        aluno_id: alunoId,
        turma_id: turmaId,
        status: 'ativa'
      };
      
      const { error } = await supabase
        .from('matriculas')
        .insert(matriculaData);
      
      if (error) {
        console.log(`❌ Erro ao criar matrícula para ${alunos[0].nome}:`, error.message);
        stats.errors++;
      } else {
        stats.created++;
        if (stats.created % 10 === 0) {
          console.log(`✅ ${stats.created} matrículas criadas...`);
        }
      }
    }
    
    console.log('\n📊 Resumo Final:');
    console.log(`   Total processado: ${stats.total}`);
    console.log(`   ✅ Matrículas criadas: ${stats.created}`);
    console.log(`   ⏭️  Ignoradas (já existentes): ${stats.skipped}`);
    console.log(`   ❌ Erros: ${stats.errors}`);
    
  } catch (err) {
    console.error('Erro:', err);
  }
}

// Mostrar estatísticas finais
async function showFinalStats() {
  console.log('\n\n📊 ESTATÍSTICAS FINAIS POR TURMA');
  console.log('════════════════════════════════\n');
  
  try {
    // Busca todas as turmas
    const { data: turmas } = await supabase
      .from('turmas_config')
      .select('id, nome, turno')
      .order('nome, turno');
    
    if (!turmas) return;
    
    let totalGeral = 0;
    
    for (const turma of turmas) {
      const { count } = await supabase
        .from('matriculas')
        .select('*', { count: 'exact', head: true })
        .eq('turma_id', turma.id)
        .eq('status', 'ativa');
      
      if (count > 0) {
        console.log(`${turma.nome} (${turma.turno || 'N/A'}): ${count} alunos`);
        totalGeral += count;
      }
    }
    
    console.log(`\n════════════════════════════════`);
    console.log(`TOTAL GERAL: ${totalGeral} alunos matriculados`);
    
    // Verifica alunos sem matrícula
    const { data: todoAlunos } = await supabase
      .from('alunos')
      .select('id');
    
    const { data: alunosComMatricula } = await supabase
      .from('matriculas')
      .select('aluno_id');
    
    const idsComMatricula = new Set(alunosComMatricula?.map(m => m.aluno_id) || []);
    const semMatricula = todoAlunos?.filter(a => !idsComMatricula.has(a.id)).length || 0;
    
    if (semMatricula > 0) {
      console.log(`\n⚠️  ${semMatricula} alunos ainda sem matrícula`);
    }
    
  } catch (err) {
    console.error('Erro:', err);
  }
}

// Main
async function main() {
  console.log('🚀 CRIAÇÃO DE MATRÍCULAS - VERSÃO SIMPLIFICADA');
  console.log('==============================================\n');
  
  await discoverMatriculasColumns();
  await createMatriculasMinimal();
  await showFinalStats();
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Erro fatal:', err);
    process.exit(1);
  });
// Script para criar matrículas e verificar dados importados
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ETAPA 1: Verificar estrutura da tabela matriculas
async function checkMatriculasStructure() {
  console.log('📊 Verificando estrutura da tabela matriculas...\n');
  
  try {
    // Tenta inserir um registro teste
    const testData = {
      aluno_id: '00000000-0000-0000-0000-000000000000',
      turma_id: '00000000-0000-0000-0000-000000000000',
      status: 'ativa'
    };
    
    const { data, error } = await supabase
      .from('matriculas')
      .insert(testData)
      .select();
    
    if (error) {
      console.log('Erro no teste:', error.message);
      console.log('Detalhes:', error.details);
      console.log('Hint:', error.hint);
      
      // Tenta buscar uma matrícula existente
      const { data: existing } = await supabase
        .from('matriculas')
        .select('*')
        .limit(1);
        
      if (existing && existing.length > 0) {
        console.log('\nColunas encontradas em matriculas:');
        Object.keys(existing[0]).forEach(col => {
          console.log(`  - ${col}`);
        });
      }
    }
    
    // Limpa teste se inseriu
    if (data) {
      await supabase
        .from('matriculas')
        .delete()
        .eq('aluno_id', '00000000-0000-0000-0000-000000000000');
    }
    
  } catch (err) {
    console.error('Erro:', err);
  }
}

// ETAPA 2: Verificar alunos faltantes no CSV
async function checkMissingStudents() {
  console.log('\n\n📋 Verificando alunos sem nome no CSV...\n');
  
  const csvPath = path.join(process.cwd(), 'SUPER REGISTRO - CLIENTES.csv');
  
  try {
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });
    
    // Linhas específicas (ajustando para índice 0-based)
    const linesToCheck = [113, 117, 181]; // linha 114, 118, 182 no arquivo
    
    linesToCheck.forEach(index => {
      if (records[index]) {
        const row = records[index];
        console.log(`\nLinha ${index + 2} (arquivo linha ${index + 2}):`);
        console.log('────────────────────────────────');
        Object.entries(row).forEach(([key, value]) => {
          if (value && value.trim() !== '') {
            console.log(`  ${key}: "${value}"`);
          }
        });
      }
    });
    
  } catch (err) {
    console.error('Erro ao ler CSV:', err);
  }
}

// ETAPA 3: Criar matrículas faltantes
async function createMissingMatriculas() {
  console.log('\n\n🎓 Criando matrículas faltantes...\n');
  
  const stats = {
    totalAlunos: 0,
    alunosSemMatricula: 0,
    matriculasCriadas: 0,
    erros: 0
  };
  
  try {
    // Busca todos os alunos
    const { data: alunos, error: alunosError } = await supabase
      .from('alunos')
      .select('id, nome, cpf');
    
    if (alunosError) {
      console.error('Erro ao buscar alunos:', alunosError);
      return stats;
    }
    
    stats.totalAlunos = alunos.length;
    console.log(`Total de alunos: ${stats.totalAlunos}`);
    
    // Para cada aluno, verifica se tem matrícula
    for (const aluno of alunos) {
      const { data: matriculas } = await supabase
        .from('matriculas')
        .select('id')
        .eq('aluno_id', aluno.id);
      
      if (!matriculas || matriculas.length === 0) {
        stats.alunosSemMatricula++;
        
        // Tenta detectar turma pelo nome do aluno ou criar matrícula sem turma
        console.log(`\n⚠️  Aluno sem matrícula: ${aluno.nome} (CPF: ${aluno.cpf})`);
        
        // Por enquanto, não cria matrícula sem turma_id
        // Se quiser criar, descomente abaixo:
        /*
        const { error: matriculaError } = await supabase
          .from('matriculas')
          .insert({
            aluno_id: aluno.id,
            status: 'pendente',
            observacoes: 'Matrícula criada automaticamente - TURMA PENDENTE'
          });
          
        if (matriculaError) {
          console.log(`   ❌ Erro ao criar matrícula: ${matriculaError.message}`);
          stats.erros++;
        } else {
          console.log(`   ✅ Matrícula criada (pendente de turma)`);
          stats.matriculasCriadas++;
        }
        */
      }
    }
    
  } catch (err) {
    console.error('Erro:', err);
  }
  
  return stats;
}

// ETAPA 4: Estatísticas por turma
async function getStatsByTurma() {
  console.log('\n\n📊 Estatísticas por turma...\n');
  
  try {
    // Busca todas as turmas com contagem de matrículas
    const { data: turmas } = await supabase
      .from('turmas_config')
      .select('id, nome, turno');
    
    if (!turmas) return;
    
    const stats = [];
    
    for (const turma of turmas) {
      const { count } = await supabase
        .from('matriculas')
        .select('*', { count: 'exact', head: true })
        .eq('turma_id', turma.id)
        .eq('status', 'ativa');
      
      if (count > 0) {
        stats.push({
          nome: turma.nome,
          turno: turma.turno,
          quantidade: count
        });
      }
    }
    
    // Ordena por quantidade
    stats.sort((a, b) => b.quantidade - a.quantidade);
    
    console.log('╔════════════════════════════════════════════════╗');
    console.log('║            ALUNOS POR TURMA                    ║');
    console.log('╠════════════════════════════════════════════════╣');
    
    let total = 0;
    stats.forEach(stat => {
      const nomeTurma = `${stat.nome} (${stat.turno})`.padEnd(35);
      const quantidade = String(stat.quantidade).padStart(10);
      console.log(`║ ${nomeTurma} ${quantidade} ║`);
      total += stat.quantidade;
    });
    
    console.log('╠════════════════════════════════════════════════╣');
    console.log(`║ TOTAL                              ${String(total).padStart(10)} ║`);
    console.log('╚════════════════════════════════════════════════╝');
    
    // Busca alunos sem matrícula
    const { data: alunosSemMatricula } = await supabase
      .from('alunos')
      .select('id, nome, cpf')
      .not('id', 'in', 
        `(SELECT aluno_id FROM matriculas)`
      );
    
    if (alunosSemMatricula && alunosSemMatricula.length > 0) {
      console.log(`\n⚠️  ${alunosSemMatricula.length} alunos sem matrícula:`);
      alunosSemMatricula.forEach((aluno, index) => {
        if (index < 5) {
          console.log(`   - ${aluno.nome} (CPF: ${aluno.cpf})`);
        }
      });
      if (alunosSemMatricula.length > 5) {
        console.log(`   ... e mais ${alunosSemMatricula.length - 5} alunos`);
      }
    }
    
  } catch (err) {
    console.error('Erro:', err);
  }
}

// ETAPA 5: Criar matrículas com mapeamento do CSV
async function createMatriculasFromCSV() {
  console.log('\n\n🔄 Criando matrículas baseadas no CSV...\n');
  
  const csvPath = path.join(process.cwd(), 'SUPER REGISTRO - CLIENTES.csv');
  const stats = {
    processados: 0,
    matriculasCriadas: 0,
    erros: 0
  };
  
  try {
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });
    
    // Cache de turmas
    const turmaCache = new Map();
    
    for (const row of records) {
      const nomeAluno = row['NOME ALUNO']?.trim();
      const cpfAluno = row['CPF ALUNO']?.toString().replace(/\D/g, '');
      const turmaNome = row['TURMA']?.trim();
      
      if (!nomeAluno || !turmaNome) continue;
      
      stats.processados++;
      
      // Busca o aluno pelo nome e CPF
      let query = supabase.from('alunos').select('id');
      
      if (cpfAluno && cpfAluno.length === 11) {
        query = query.eq('cpf', cpfAluno);
      } else {
        query = query.eq('nome', nomeAluno);
      }
      
      const { data: alunos } = await query;
      
      if (!alunos || alunos.length === 0) continue;
      
      const alunoId = alunos[0].id;
      
      // Verifica se já tem matrícula
      const { data: matriculaExistente } = await supabase
        .from('matriculas')
        .select('id')
        .eq('aluno_id', alunoId);
      
      if (matriculaExistente && matriculaExistente.length > 0) continue;
      
      // Detecta a turma
      let turmaId = null;
      if (turmaCache.has(turmaNome)) {
        turmaId = turmaCache.get(turmaNome);
      } else {
        turmaId = await detectTurmaId(turmaNome);
        turmaCache.set(turmaNome, turmaId);
      }
      
      if (!turmaId) {
        console.log(`⚠️  Turma não encontrada para: ${nomeAluno} - Turma: ${turmaNome}`);
        continue;
      }
      
      // Cria a matrícula (sem data_matricula)
      const { error } = await supabase
        .from('matriculas')
        .insert({
          aluno_id: alunoId,
          turma_id: turmaId,
          status: 'ativa',
          valor_mensalidade: 0,
          dia_vencimento: 10,
          observacoes: 'Matrícula criada via script de correção'
        });
      
      if (error) {
        console.log(`❌ Erro ao criar matrícula para ${nomeAluno}: ${error.message}`);
        stats.erros++;
      } else {
        stats.matriculasCriadas++;
      }
    }
    
    console.log(`\n✅ Processamento concluído:`);
    console.log(`   - Registros processados: ${stats.processados}`);
    console.log(`   - Matrículas criadas: ${stats.matriculasCriadas}`);
    console.log(`   - Erros: ${stats.erros}`);
    
  } catch (err) {
    console.error('Erro:', err);
  }
}

// Função auxiliar para detectar turma (mesma do script de migração)
async function detectTurmaId(turmaName) {
  if (!turmaName || turmaName.trim() === '') return null;

  const normalized = turmaName.trim().toUpperCase();
  
  let turno = null;
  if (normalized.includes('MATUTINO')) {
    turno = 'MATUTINO';
  } else if (normalized.includes('NOTURNO')) {
    turno = 'NOTURNO';
  } else if (normalized.includes('VESPERTINO')) {
    turno = 'VESPERTINO';
  }
  
  if (normalized.includes('T1') && !normalized.includes('PREVEST')) {
    const { data } = await supabase
      .from('turmas_config')
      .select('id')
      .ilike('nome', '%SIS/PSC 1%')
      .single();
    return data?.id || null;
  }
  
  if (normalized.includes('T2')) {
    const { data } = await supabase
      .from('turmas_config')
      .select('id')
      .ilike('nome', '%SIS/PSC 2%')
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

// Função principal
async function main() {
  console.log('🚀 CORREÇÃO DE MATRÍCULAS E VERIFICAÇÃO');
  console.log('========================================\n');
  
  // 1. Verifica estrutura
  await checkMatriculasStructure();
  
  // 2. Verifica alunos sem nome no CSV
  await checkMissingStudents();
  
  // 3. Mostra estatísticas atuais
  await getStatsByTurma();
  
  // 4. Pergunta se deve criar matrículas
  console.log('\n\n💡 Para criar as matrículas faltantes, execute:');
  console.log('   node scripts/fix-matriculas.js --create\n');
}

// Verifica argumentos
if (process.argv.includes('--create')) {
  createMatriculasFromCSV()
    .then(() => getStatsByTurma())
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Erro:', err);
      process.exit(1);
    });
} else {
  main()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Erro:', err);
      process.exit(1);
    });
}
// Carrega variáveis de ambiente
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

// Configuração do Supabase - usa as mesmas variáveis que o Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Configuração do Supabase:');
console.log(`   URL: ${supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NÃO CONFIGURADA'}`);
console.log(`   Key: ${supabaseAnonKey ? supabaseAnonKey.substring(0, 30) + '...' : 'NÃO CONFIGURADA'}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Variáveis de ambiente do Supabase não configuradas!');
  console.log('Certifique-se de ter no arquivo .env.local:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL=sua_url');
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave');
  process.exit(1);
}

// Cria cliente Supabase com a mesma configuração do projeto
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funções auxiliares
function cleanCPF(cpf) {
  if (!cpf) return null;
  const cleaned = cpf.toString().replace(/\D/g, '');
  return cleaned.length === 11 ? cleaned : null;
}

function cleanPhone(phone) {
  if (!phone) return null;
  const cleaned = phone.toString().replace(/\D/g, '');
  return cleaned.length >= 10 ? cleaned : null;
}

function generateTempCPF(index) {
  const timestamp = Date.now().toString().slice(-6);
  return `00000${String(index).padStart(3, '0')}${timestamp}`.slice(-11);
}

async function detectTurmaId(turmaName) {
  if (!turmaName || turmaName.trim() === '') return null;

  const normalized = turmaName.trim().toUpperCase();
  
  const { data, error } = await supabase
    .from('turmas_config')
    .select('id, nome')
    .ilike('nome', `%${normalized}%`)
    .single();

  if (error || !data) {
    return null;
  }

  return data.id;
}

// ETAPA 1: Limpeza
async function cleanupBadData() {
  console.log('\n🧹 ETAPA 1: Limpeza de dados mal importados...');
  
  try {
    // Busca registros problemáticos
    const { data: badStudents, error: fetchError } = await supabase
      .from('alunos')
      .select('id, nome, cpf')
      .or('nome.is.null,nome~^[0-9]+$,cpf.ilike.TEMP%');

    if (fetchError) {
      console.error('Erro ao buscar registros:', fetchError);
      return 0;
    }

    if (!badStudents || badStudents.length === 0) {
      console.log('✅ Nenhum registro mal importado encontrado.');
      return 0;
    }

    console.log(`📋 Encontrados ${badStudents.length} registros para deletar:`);
    badStudents.slice(0, 5).forEach(s => {
      console.log(`  - ID: ${s.id}, Nome: "${s.nome || 'NULL'}", CPF: ${s.cpf}`);
    });
    if (badStudents.length > 5) {
      console.log(`  ... e mais ${badStudents.length - 5} registros`);
    }

    const studentIds = badStudents.map(s => s.id);

    // Deleta matrículas primeiro
    const { error: deleteMatriculasError } = await supabase
      .from('matriculas')
      .delete()
      .in('aluno_id', studentIds);

    if (deleteMatriculasError) {
      console.error('Erro ao deletar matrículas:', deleteMatriculasError);
    }

    // Deleta alunos
    const { error: deleteError } = await supabase
      .from('alunos')
      .delete()
      .in('id', studentIds);

    if (deleteError) {
      console.error('Erro ao deletar alunos:', deleteError);
      return 0;
    }

    console.log(`✅ ${badStudents.length} registros deletados com sucesso!`);
    return badStudents.length;

  } catch (error) {
    console.error('Erro na limpeza:', error);
    return 0;
  }
}

// ETAPA 2: Importação
async function importCSVData(csvPath) {
  console.log('\n📥 ETAPA 2: Importação do CSV...');
  
  const stats = {
    total: 0,
    imported: 0,
    skipped: 0,
    errors: 0,
    tempCpfs: 0
  };

  try {
    // Lê o arquivo
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });

    stats.total = records.length;
    console.log(`📊 Total de registros no CSV: ${stats.total}`);

    // Cache de turmas
    const turmaCache = new Map();
    const errors = [];
    const warnings = [];

    // Processa em lotes
    const batchSize = 10;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const batchPromises = [];

      for (let j = 0; j < batch.length; j++) {
        const row = batch[j];
        const rowNum = i + j + 2;

        batchPromises.push(processStudent(row, rowNum, turmaCache, stats, errors, warnings));
      }

      await Promise.all(batchPromises);

      // Progresso
      const processed = Math.min(i + batchSize, records.length);
      process.stdout.write(`\r  Processados: ${processed}/${records.length} (${Math.round(processed/records.length*100)}%)`);
    }

    console.log('\n');

    // Mostra avisos importantes
    if (warnings.length > 0) {
      console.log(`\n⚠️  ${warnings.length} avisos:`);
      warnings.slice(0, 5).forEach(w => console.log(`  - ${w}`));
      if (warnings.length > 5) {
        console.log(`  ... e mais ${warnings.length - 5} avisos`);
      }
    }

    // Mostra erros
    if (errors.length > 0) {
      console.log(`\n❌ ${errors.length} erros:`);
      errors.slice(0, 5).forEach(e => console.log(`  - ${e}`));
      if (errors.length > 5) {
        console.log(`  ... e mais ${errors.length - 5} erros`);
      }
    }

    return stats;

  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    return stats;
  }
}

async function processStudent(row, rowNum, turmaCache, stats, errors, warnings) {
  try {
    // Validação do nome
    const nomeAluno = row['NOME ALUNO']?.trim();
    if (!nomeAluno || nomeAluno === '') {
      errors.push(`Linha ${rowNum}: Nome vazio`);
      stats.errors++;
      return;
    }

    // Prepara dados
    const cpfOriginal = row['CPF ALUNO'];
    let cpfAluno = cleanCPF(cpfOriginal);
    
    if (!cpfAluno) {
      cpfAluno = generateTempCPF(stats.tempCpfs + 1);
      stats.tempCpfs++;
      warnings.push(`Linha ${rowNum}: CPF temporário gerado para ${nomeAluno}`);
    }

    // Verifica duplicata
    if (!cpfAluno.startsWith('00000')) {
      const { data: existing } = await supabase
        .from('alunos')
        .select('id, nome')
        .eq('cpf', cpfAluno)
        .single();

      if (existing) {
        warnings.push(`Linha ${rowNum}: Aluno ${nomeAluno} já existe (CPF: ${cpfAluno})`);
        stats.skipped++;
        return;
      }
    }

    // Detecta turma
    let turmaId = null;
    const turmaNome = row['TURMA']?.trim();
    if (turmaNome) {
      if (turmaCache.has(turmaNome)) {
        turmaId = turmaCache.get(turmaNome);
      } else {
        turmaId = await detectTurmaId(turmaNome);
        turmaCache.set(turmaNome, turmaId);
      }
    }

    // Insere aluno (SEM created_at)
    const alunoData = {
      nome: nomeAluno,
      cpf: cpfAluno,
      telefone: cleanPhone(row['TELEFONE ALUNO']),
      responsavel: row['NOME RESPONSÁVEL']?.trim() || null,
      cpf_responsavel: cleanCPF(row['CPF RESPONSÁVEL']),
      telefone_responsavel: cleanPhone(row['TELEFONE RESPONSÁVEL'])
    };

    const { data: aluno, error: alunoError } = await supabase
      .from('alunos')
      .insert(alunoData)
      .select()
      .single();

    if (alunoError) {
      errors.push(`Linha ${rowNum}: ${alunoError.message}`);
      stats.errors++;
      return;
    }

    // Cria matrícula se tem turma
    if (turmaId && aluno) {
      const { error: matriculaError } = await supabase
        .from('matriculas')
        .insert({
          aluno_id: aluno.id,
          turma_id: turmaId,
          status: 'ativa',
          data_matricula: new Date().toISOString(),
          valor_mensalidade: 0,
          dia_vencimento: 10,
          observacoes: `Importado via migração em ${new Date().toLocaleDateString('pt-BR')}`
        });

      if (matriculaError) {
        warnings.push(`Linha ${rowNum}: Erro na matrícula - ${matriculaError.message}`);
      }
    }

    stats.imported++;

  } catch (error) {
    errors.push(`Linha ${rowNum}: ${error.message}`);
    stats.errors++;
  }
}

// Função principal
async function runMigration() {
  console.log('🚀 MIGRAÇÃO DEFINITIVA - SUPER REGISTRO CLIENTES');
  console.log('================================================');

  // Verifica arquivo CSV (com hífen no nome)
  const csvPath = path.join(process.cwd(), 'SUPER REGISTRO - CLIENTES.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('\n❌ Arquivo CSV não encontrado!');
    console.log('Por favor, coloque o arquivo "SUPER REGISTRO - CLIENTES.csv" na raiz do projeto:');
    console.log(`  ${csvPath}`);
    process.exit(1);
  }

  console.log(`\n📁 Arquivo encontrado: ${csvPath}`);

  // ETAPA 1: Limpeza
  const deletedCount = await cleanupBadData();

  // ETAPA 2: Importação
  const importStats = await importCSVData(csvPath);

  // RELATÓRIO FINAL
  console.log('\n');
  console.log('╔════════════════════════════════════════╗');
  console.log('║        RELATÓRIO FINAL DA MIGRAÇÃO     ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║ 🗑️  Registros deletados: ${String(deletedCount).padEnd(13)} ║`);
  console.log(`║ 📊 Total no CSV: ${String(importStats.total).padEnd(21)} ║`);
  console.log(`║ ✅ Importados com sucesso: ${String(importStats.imported).padEnd(11)} ║`);
  console.log(`║ ⏭️  Ignorados (duplicados): ${String(importStats.skipped).padEnd(10)} ║`);
  console.log(`║ ❌ Erros: ${String(importStats.errors).padEnd(28)} ║`);
  console.log(`║ 🔄 CPFs temporários gerados: ${String(importStats.tempCpfs).padEnd(9)} ║`);
  console.log('╚════════════════════════════════════════╝');

  console.log('\n✅ Migração concluída!');
  
  if (importStats.tempCpfs > 0) {
    console.log(`\n💡 Dica: ${importStats.tempCpfs} alunos foram importados com CPF temporário.`);
    console.log('   Atualize esses CPFs assim que tiver os dados corretos.');
  }
}

// Executa
runMigration()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
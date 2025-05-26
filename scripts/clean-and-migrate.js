// Script para limpar TODOS os dados e importar do zero
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Configuração do Supabase:');
console.log(`   URL: ${supabaseUrl ? 'OK' : 'NÃO CONFIGURADA'}`);
console.log(`   Key: ${supabaseAnonKey ? 'OK' : 'NÃO CONFIGURADA'}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\n❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

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
  
  // Mapeia nomes do CSV para turmas do banco
  let turno = null;
  if (normalized.includes('MATUTINO')) {
    turno = 'MATUTINO';
  } else if (normalized.includes('NOTURNO')) {
    turno = 'NOTURNO';
  } else if (normalized.includes('VESPERTINO')) {
    turno = 'VESPERTINO';
  }
  
  // Se for T1 ou T2, mapeia para TURMA PRIMEIRO/SEGUNDO ANO
  if (normalized.includes('T1') && !normalized.includes('PREVEST')) {
    const { data, error } = await supabase
      .from('turmas_config')
      .select('id, nome, turno')
      .ilike('nome', '%PRIMEIRO ANO%')
      .single();
    return data?.id || null;
  }
  
  if (normalized.includes('T2')) {
    const { data, error } = await supabase
      .from('turmas_config')
      .select('id, nome, turno')
      .ilike('nome', '%SEGUNDO ANO%')
      .single();
    return data?.id || null;
  }
  
  // Para PREVEST, busca pelo turno
  if (normalized.includes('PREVEST') && turno) {
    const { data, error } = await supabase
      .from('turmas_config')
      .select('id, nome, turno')
      .eq('nome', 'PREVEST')
      .eq('turno', turno)
      .limit(1);
    
    if (data && data.length > 0) {
      return data[0].id;
    }
  }
  
  // Busca genérica como fallback
  const { data, error } = await supabase
    .from('turmas_config')
    .select('id, nome, turno')
    .or(`nome.ilike.%${normalized}%,turno.ilike.%${normalized}%`)
    .limit(1);

  if (data && data.length > 0) {
    return data[0].id;
  }

  return null;
}

// ETAPA 1: Limpeza TOTAL
async function cleanAllData() {
  console.log('\n🧹 ETAPA 1: Limpeza TOTAL dos dados...');
  
  try {
    // Primeiro conta quantos registros existem
    const { count: alunosCount } = await supabase
      .from('alunos')
      .select('*', { count: 'exact', head: true });

    const { count: matriculasCount } = await supabase
      .from('matriculas')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Registros encontrados:`);
    console.log(`   - Alunos: ${alunosCount || 0}`);
    console.log(`   - Matrículas: ${matriculasCount || 0}`);

    if (alunosCount === 0 && matriculasCount === 0) {
      console.log('✅ Banco já está limpo!');
      return { alunos: 0, matriculas: 0 };
    }

    // Deleta TODAS as matrículas primeiro
    console.log('\n🗑️  Deletando TODAS as matrículas...');
    const { error: deleteMatriculasError } = await supabase
      .from('matriculas')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Deleta tudo

    if (deleteMatriculasError) {
      console.error('Erro ao deletar matrículas:', deleteMatriculasError);
    } else {
      console.log(`✅ ${matriculasCount} matrículas deletadas`);
    }

    // Depois deleta TODOS os alunos
    console.log('\n🗑️  Deletando TODOS os alunos...');
    const { error: deleteAlunosError } = await supabase
      .from('alunos')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Deleta tudo

    if (deleteAlunosError) {
      console.error('Erro ao deletar alunos:', deleteAlunosError);
    } else {
      console.log(`✅ ${alunosCount} alunos deletados`);
    }

    return { alunos: alunosCount || 0, matriculas: matriculasCount || 0 };

  } catch (error) {
    console.error('Erro na limpeza:', error);
    return { alunos: 0, matriculas: 0 };
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

    // Processa um por um (mais lento mas mais seguro)
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2;

      try {
        // Validação do nome
        const nomeAluno = row['NOME ALUNO']?.trim();
        if (!nomeAluno || nomeAluno === '') {
          errors.push(`Linha ${rowNum}: Nome vazio`);
          stats.errors++;
          continue;
        }

        // Prepara dados
        const cpfOriginal = row['CPF ALUNO'];
        let cpfAluno = cleanCPF(cpfOriginal);
        
        if (!cpfAluno) {
          cpfAluno = generateTempCPF(stats.tempCpfs + 1);
          stats.tempCpfs++;
          warnings.push(`Linha ${rowNum}: CPF temporário gerado para ${nomeAluno}`);
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
            if (!turmaId) {
              warnings.push(`Turma "${turmaNome}" não encontrada`);
            }
          }
        }

        // Insere aluno (com campos corretos)
        const alunoData = {
          nome: nomeAluno,
          cpf: cpfAluno,
          telefone: cleanPhone(row['TELEFONE ALUNO']),
          nome_responsavel: row['NOME RESPONSÁVEL']?.trim() || null, // Corrigido: nome_responsavel
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
          continue;
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

        // Progresso
        if ((i + 1) % 10 === 0) {
          process.stdout.write(`\r  Processados: ${i + 1}/${records.length} (${Math.round((i + 1)/records.length*100)}%)`);
        }

      } catch (error) {
        errors.push(`Linha ${rowNum}: ${error.message}`);
        stats.errors++;
      }
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

// Função principal
async function runCleanMigration() {
  console.log('🚀 LIMPEZA E MIGRAÇÃO COMPLETA - SUPER REGISTRO CLIENTES');
  console.log('========================================================');
  console.log('\n⚠️  ATENÇÃO: Este script vai DELETAR TODOS os alunos e matrículas atuais!');
  console.log('   Depois importará os dados do CSV do zero.\n');

  // Aguarda 3 segundos para dar chance de cancelar
  console.log('Iniciando em 3...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('2...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('1...');
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Verifica arquivo CSV
  const csvPath = path.join(process.cwd(), 'SUPER REGISTRO - CLIENTES.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('\n❌ Arquivo CSV não encontrado!');
    console.log('Por favor, coloque o arquivo "SUPER REGISTRO - CLIENTES.csv" na raiz do projeto:');
    console.log(`  ${csvPath}`);
    process.exit(1);
  }

  console.log(`\n📁 Arquivo encontrado: ${csvPath}`);

  // ETAPA 1: Limpeza TOTAL
  const cleanStats = await cleanAllData();

  // ETAPA 2: Importação
  const importStats = await importCSVData(csvPath);

  // RELATÓRIO FINAL
  console.log('\n');
  console.log('╔════════════════════════════════════════╗');
  console.log('║     RELATÓRIO FINAL - LIMPEZA TOTAL    ║');
  console.log('╠════════════════════════════════════════╣');
  console.log(`║ 🗑️  Alunos deletados: ${String(cleanStats.alunos).padEnd(16)} ║`);
  console.log(`║ 🗑️  Matrículas deletadas: ${String(cleanStats.matriculas).padEnd(12)} ║`);
  console.log(`║ ──────────────────────────────────────  ║`);
  console.log(`║ 📊 Total no CSV: ${String(importStats.total).padEnd(21)} ║`);
  console.log(`║ ✅ Importados com sucesso: ${String(importStats.imported).padEnd(11)} ║`);
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
runCleanMigration()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
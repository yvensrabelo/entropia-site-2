import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface CSVRow {
  'NOME ALUNO': string;
  'TELEFONE ALUNO': string;
  'CPF ALUNO': string;
  'NOME RESPONSÁVEL': string;
  'TELEFONE RESPONSÁVEL': string;
  'CPF RESPONSÁVEL': string;
  'TURMA': string;
  'ASAAS': string;
}

interface MigrationReport {
  deletedRecords: number;
  importedStudents: number;
  errors: Array<{ row: number; error: string; data?: any }>;
  warnings: Array<{ message: string; data?: any }>;
}

// Função para limpar CPF
function cleanCPF(cpf: string): string | null {
  if (!cpf) return null;
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.length === 11 ? cleaned : null;
}

// Função para limpar telefone
function cleanPhone(phone: string): string | null {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 ? cleaned : null;
}

// Função para gerar CPF temporário
function generateTempCPF(index: number): string {
  const timestamp = Date.now().toString().slice(-6);
  return `00000${String(index).padStart(3, '0')}${timestamp}`.slice(-11);
}

// Função para detectar turma baseado no nome
async function detectTurmaId(turmaName: string): Promise<string | null> {
  if (!turmaName || turmaName.trim() === '') return null;

  // Normaliza o nome da turma
  const normalized = turmaName.trim().toUpperCase();
  
  // Busca turma no banco
  const { data, error } = await supabase
    .from('turmas_config')
    .select('id, nome')
    .ilike('nome', `%${normalized}%`)
    .single();

  if (error || !data) {
    console.warn(`Turma não encontrada: ${turmaName}`);
    return null;
  }

  return data.id;
}

// ETAPA 1: Limpeza de dados mal importados
async function cleanupBadData(): Promise<number> {
  console.log('🧹 Iniciando limpeza de dados mal importados...');
  
  try {
    // Deleta alunos com nomes numéricos ou CPFs temporários
    const { data: badStudents, error: fetchError } = await supabase
      .from('alunos')
      .select('id, nome, cpf')
      .or('nome.eq.null,nome.match.^[0-9]+$,cpf.like.TEMP%');

    if (fetchError) {
      console.error('Erro ao buscar registros mal importados:', fetchError);
      return 0;
    }

    if (!badStudents || badStudents.length === 0) {
      console.log('✅ Nenhum registro mal importado encontrado.');
      return 0;
    }

    console.log(`📋 Encontrados ${badStudents.length} registros mal importados:`);
    badStudents.forEach(s => {
      console.log(`  - ID: ${s.id}, Nome: ${s.nome || 'NULL'}, CPF: ${s.cpf}`);
    });

    // Primeiro deleta as matrículas relacionadas
    const studentIds = badStudents.map(s => s.id);
    const { error: deleteMatriculasError } = await supabase
      .from('matriculas')
      .delete()
      .in('aluno_id', studentIds);

    if (deleteMatriculasError) {
      console.error('Erro ao deletar matrículas:', deleteMatriculasError);
      return 0;
    }

    // Depois deleta os alunos
    const { error: deleteError } = await supabase
      .from('alunos')
      .delete()
      .in('id', studentIds);

    if (deleteError) {
      console.error('Erro ao deletar alunos:', deleteError);
      return 0;
    }

    console.log(`✅ ${badStudents.length} registros deletados com sucesso.`);
    return badStudents.length;
  } catch (error) {
    console.error('Erro durante limpeza:', error);
    return 0;
  }
}

// ETAPA 2: Importação dos dados do CSV
async function importCSVData(csvPath: string): Promise<MigrationReport> {
  const report: MigrationReport = {
    deletedRecords: 0,
    importedStudents: 0,
    errors: [],
    warnings: []
  };

  console.log('\n📥 Iniciando importação do CSV...');

  try {
    // Lê o arquivo CSV
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records: CSVRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true
    });

    console.log(`📊 Total de registros no CSV: ${records.length}`);

    // Cache de turmas para evitar queries repetidas
    const turmaCache = new Map<string, string | null>();

    // Processa cada registro
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2; // +2 porque pula header e começa em 1

      try {
        // Validação básica
        if (!row['NOME ALUNO'] || row['NOME ALUNO'].trim() === '') {
          report.errors.push({
            row: rowNumber,
            error: 'Nome do aluno é obrigatório',
            data: row
          });
          continue;
        }

        // Limpa e prepara os dados
        const cpfAluno = cleanCPF(row['CPF ALUNO']) || generateTempCPF(i + 1);
        const telefoneAluno = cleanPhone(row['TELEFONE ALUNO']);
        const cpfResponsavel = cleanCPF(row['CPF RESPONSÁVEL']);
        const telefoneResponsavel = cleanPhone(row['TELEFONE RESPONSÁVEL']);

        // Detecta a turma
        let turmaId: string | null = null;
        if (row['TURMA']) {
          if (turmaCache.has(row['TURMA'])) {
            turmaId = turmaCache.get(row['TURMA'])!;
          } else {
            turmaId = await detectTurmaId(row['TURMA']);
            turmaCache.set(row['TURMA'], turmaId);
          }

          if (!turmaId) {
            report.warnings.push({
              message: `Turma "${row['TURMA']}" não encontrada para aluno ${row['NOME ALUNO']}`,
              data: { row: rowNumber, turma: row['TURMA'] }
            });
          }
        }

        // Verifica se o aluno já existe (pelo CPF real)
        if (!cpfAluno.startsWith('000')) {
          const { data: existing } = await supabase
            .from('alunos')
            .select('id')
            .eq('cpf', cpfAluno)
            .single();

          if (existing) {
            report.warnings.push({
              message: `Aluno com CPF ${cpfAluno} já existe, pulando...`,
              data: { row: rowNumber, nome: row['NOME ALUNO'] }
            });
            continue;
          }
        }

        // Insere o aluno
        const { data: aluno, error: alunoError } = await supabase
          .from('alunos')
          .insert({
            nome: row['NOME ALUNO'].trim(),
            cpf: cpfAluno,
            telefone: telefoneAluno,
            responsavel: row['NOME RESPONSÁVEL']?.trim() || null,
            cpf_responsavel: cpfResponsavel,
            telefone_responsavel: telefoneResponsavel,
            data_nascimento: null, // Não temos no CSV
            email: null, // Não temos no CSV
            endereco: null, // Não temos no CSV
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (alunoError) {
          report.errors.push({
            row: rowNumber,
            error: `Erro ao inserir aluno: ${alunoError.message}`,
            data: row
          });
          continue;
        }

        // Se tem turma, cria a matrícula
        if (turmaId && aluno) {
          const { error: matriculaError } = await supabase
            .from('matriculas')
            .insert({
              aluno_id: aluno.id,
              turma_id: turmaId,
              status: 'ativa',
              data_matricula: new Date().toISOString(),
              valor_mensalidade: 0, // Definir depois
              dia_vencimento: 10, // Padrão
              observacoes: `Importado do CSV em ${new Date().toLocaleDateString('pt-BR')}`
            });

          if (matriculaError) {
            report.warnings.push({
              message: `Erro ao criar matrícula: ${matriculaError.message}`,
              data: { row: rowNumber, aluno: aluno.nome }
            });
          }
        }

        report.importedStudents++;
        
        if (cpfAluno.startsWith('000')) {
          report.warnings.push({
            message: `CPF temporário gerado para ${row['NOME ALUNO']}: ${cpfAluno}`,
            data: { row: rowNumber }
          });
        }

        // Log de progresso
        if ((i + 1) % 10 === 0) {
          console.log(`  Processados: ${i + 1}/${records.length}`);
        }

      } catch (error) {
        report.errors.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          data: row
        });
      }
    }

    console.log('✅ Importação concluída!');
    return report;

  } catch (error) {
    console.error('Erro fatal durante importação:', error);
    report.errors.push({
      row: 0,
      error: error instanceof Error ? error.message : 'Erro ao ler arquivo CSV'
    });
    return report;
  }
}

// Função principal
async function runMigration() {
  console.log('🚀 MIGRAÇÃO DEFINITIVA - SUPER REGISTRO CLIENTES');
  console.log('================================================\n');

  const report: MigrationReport = {
    deletedRecords: 0,
    importedStudents: 0,
    errors: [],
    warnings: []
  };

  // ETAPA 1: Limpeza
  report.deletedRecords = await cleanupBadData();

  // ETAPA 2: Importação
  const csvPath = path.join(process.cwd(), 'SUPER REGISTRO CLIENTES.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Arquivo CSV não encontrado:', csvPath);
    console.log('Por favor, coloque o arquivo "SUPER REGISTRO CLIENTES.csv" na raiz do projeto.');
    return;
  }

  const importReport = await importCSVData(csvPath);
  report.importedStudents = importReport.importedStudents;
  report.errors = importReport.errors;
  report.warnings = importReport.warnings;

  // RELATÓRIO FINAL
  console.log('\n📊 RELATÓRIO FINAL DA MIGRAÇÃO');
  console.log('================================');
  console.log(`✅ Registros deletados: ${report.deletedRecords}`);
  console.log(`✅ Alunos importados: ${report.importedStudents}`);
  console.log(`⚠️  Avisos: ${report.warnings.length}`);
  console.log(`❌ Erros: ${report.errors.length}`);

  if (report.warnings.length > 0) {
    console.log('\n⚠️  AVISOS:');
    report.warnings.forEach((w, i) => {
      console.log(`${i + 1}. ${w.message}`);
      if (w.data) {
        console.log(`   Dados:`, w.data);
      }
    });
  }

  if (report.errors.length > 0) {
    console.log('\n❌ ERROS:');
    report.errors.forEach((e, i) => {
      console.log(`${i + 1}. Linha ${e.row}: ${e.error}`);
      if (e.data) {
        console.log(`   Dados:`, e.data);
      }
    });
  }

  console.log('\n✅ Migração concluída!');
}

// Executa a migração
runMigration().catch(console.error);
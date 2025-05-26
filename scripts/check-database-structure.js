// Script para verificar a estrutura das tabelas no Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTableStructure() {
  console.log('🔍 Verificando estrutura das tabelas no Supabase...\n');

  // 1. Verificar estrutura da tabela 'alunos'
  console.log('📊 Tabela: alunos');
  console.log('─────────────────');
  
  try {
    // Tenta buscar um registro para ver a estrutura
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Erro ao acessar tabela alunos:', error.message);
    } else {
      if (data && data.length > 0) {
        console.log('Colunas encontradas:');
        Object.keys(data[0]).forEach(col => {
          console.log(`  - ${col}: ${typeof data[0][col]}`);
        });
      } else {
        // Tenta inserir e deletar um registro teste para descobrir colunas
        console.log('Tabela vazia. Tentando descobrir colunas...');
        
        const testData = {
          nome: 'TESTE_TEMP',
          cpf: '00000000000'
        };
        
        const { data: inserted, error: insertError } = await supabase
          .from('alunos')
          .insert(testData)
          .select();
          
        if (insertError) {
          console.log('Erro no teste:', insertError.message);
          console.log('Detalhes:', insertError.details);
        } else if (inserted && inserted.length > 0) {
          console.log('Colunas encontradas:');
          Object.keys(inserted[0]).forEach(col => {
            console.log(`  - ${col}`);
          });
          
          // Deleta o registro teste
          await supabase
            .from('alunos')
            .delete()
            .eq('cpf', '00000000000');
        }
      }
    }
  } catch (err) {
    console.log('❌ Erro:', err.message);
  }

  // 2. Verificar turmas em turmas_config
  console.log('\n\n📊 Tabela: turmas_config');
  console.log('────────────────────────');
  
  try {
    const { data: turmas, error } = await supabase
      .from('turmas_config')
      .select('*')
      .order('nome');

    if (error) {
      console.log('❌ Erro ao acessar turmas_config:', error.message);
    } else if (turmas && turmas.length > 0) {
      console.log(`Total de turmas: ${turmas.length}\n`);
      console.log('Lista de turmas:');
      turmas.forEach((turma, index) => {
        console.log(`${index + 1}. ${turma.nome}`);
        console.log(`   ID: ${turma.id}`);
        console.log(`   Tipo: ${turma.tipo || 'N/A'}`);
        console.log(`   Turno: ${turma.turno || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('Nenhuma turma cadastrada.');
    }
  } catch (err) {
    console.log('❌ Erro:', err.message);
  }

  // 3. Verificar se existe coluna para responsável
  console.log('\n📊 Verificando colunas relacionadas a responsável...');
  console.log('─────────────────────────────────────────────────');
  
  const possibleColumns = [
    'responsavel',
    'nome_responsavel', 
    'responsavel_nome',
    'guardian',
    'guardian_name',
    'parent',
    'parent_name'
  ];

  for (const col of possibleColumns) {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select(col)
        .limit(1);
        
      if (!error) {
        console.log(`✅ Coluna '${col}' existe!`);
      }
    } catch (err) {
      // Coluna não existe
    }
  }

  console.log('\n✅ Verificação concluída!');
}

// Executa
checkTableStructure()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('\n❌ Erro fatal:', error);
    process.exit(1);
  });
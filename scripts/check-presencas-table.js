// Script para verificar a estrutura da tabela presencas
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPresencasTable() {
  console.log('🔍 Verificando tabela presencas...\n');
  
  try {
    // 1. Tenta fazer um select simples
    console.log('1. Testando SELECT na tabela presencas...');
    const { data, error } = await supabase
      .from('presencas')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro ao acessar tabela:', error.message);
      console.log('   Code:', error.code);
      console.log('   Details:', error.details);
      console.log('\n⚠️  A tabela presencas pode não existir ou ter problemas de permissão.\n');
      
      // Se a tabela não existe, mostra o SQL para criar
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('📋 Execute este SQL no Supabase para criar a tabela:\n');
        console.log(`-- Criar tabela de presenças
CREATE TABLE IF NOT EXISTS presencas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  hora_entrada TIME,
  hora_saida TIME,
  tipo VARCHAR(50) DEFAULT 'catraca',
  enrollid_catraca INTEGER,
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_presenca_dia UNIQUE (aluno_id, data)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_presencas_aluno_id ON presencas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_presencas_data ON presencas(data);
CREATE INDEX IF NOT EXISTS idx_presencas_aluno_data ON presencas(aluno_id, data);`);
      }
      return;
    }
    
    console.log('✅ Tabela presencas existe!');
    
    // 2. Se tem dados, mostra a estrutura
    if (data && data.length > 0) {
      console.log('\n2. Estrutura da tabela (baseada nos dados):');
      console.log('   Colunas encontradas:');
      Object.keys(data[0]).forEach(col => {
        console.log(`   - ${col}: ${typeof data[0][col]} (valor: ${data[0][col]})`);
      });
    } else {
      console.log('\n2. Tabela vazia. Tentando inserir registro teste...');
      
      // Busca um aluno para teste
      const { data: alunos } = await supabase
        .from('alunos')
        .select('id, nome')
        .limit(1)
        .single();
      
      if (!alunos) {
        console.log('❌ Nenhum aluno encontrado para teste');
        return;
      }
      
      // Tenta inserir
      const testData = {
        aluno_id: alunos.id,
        data: new Date().toISOString().split('T')[0],
        hora_entrada: '08:00:00',
        tipo: 'teste',
        observacoes: 'Registro de teste'
      };
      
      console.log('\n3. Tentando inserir:', testData);
      
      const { data: inserted, error: insertError } = await supabase
        .from('presencas')
        .insert(testData)
        .select();
      
      if (insertError) {
        console.log('\n❌ Erro ao inserir:', insertError.message);
        console.log('   Code:', insertError.code);
        console.log('   Details:', insertError.details);
        console.log('   Hint:', insertError.hint);
      } else {
        console.log('\n✅ Inserção bem sucedida!');
        console.log('   Dados inseridos:', inserted);
        
        // Deleta o registro teste
        await supabase
          .from('presencas')
          .delete()
          .eq('id', inserted[0].id);
        
        console.log('   (Registro teste deletado)');
      }
    }
    
    // 3. Verifica RLS
    console.log('\n4. Verificando RLS (Row Level Security)...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('presencas')
      .select('*')
      .limit(1);
    
    if (rlsError && rlsError.message.includes('row-level')) {
      console.log('⚠️  RLS está ativo e pode estar bloqueando inserts');
      console.log('   Execute este SQL para permitir inserts via API:');
      console.log(`
-- Permitir que qualquer um insira presenças (para a catraca)
CREATE POLICY "Permitir insert de presenças" ON presencas
  FOR INSERT WITH CHECK (true);

-- Permitir que qualquer um leia presenças (temporário para debug)
CREATE POLICY "Permitir select de presenças" ON presencas
  FOR SELECT USING (true);
`);
    } else {
      console.log('✅ RLS não está bloqueando ou está desativado');
    }
    
  } catch (err) {
    console.error('Erro geral:', err);
  }
  
  console.log('\n✅ Verificação concluída!');
}

// Executa
checkPresencasTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Erro:', err);
    process.exit(1);
  });
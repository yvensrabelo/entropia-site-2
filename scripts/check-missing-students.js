// Verifica se os 3 alunos específicos foram importados
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSpecificStudents() {
  console.log('🔍 Verificando os 3 alunos específicos...\n');
  
  const estudantes = [
    { nome: 'DAVI ALEXANDRE GARCIA OLIVEIRA', cpf: '01861673264' },
    { nome: 'SAULO PICANÇO SILVA', cpf: '02828775259' },
    { nome: 'LUANA LIMA DA COSTA', cpf: '06634641293' }
  ];
  
  for (const est of estudantes) {
    console.log(`\nBuscando: ${est.nome}`);
    console.log(`CPF: ${est.cpf}`);
    
    // Busca por CPF
    const { data: porCpf } = await supabase
      .from('alunos')
      .select('id, nome, cpf')
      .eq('cpf', est.cpf);
    
    // Busca por nome
    const { data: porNome } = await supabase
      .from('alunos')
      .select('id, nome, cpf')
      .eq('nome', est.nome);
    
    if (porCpf && porCpf.length > 0) {
      console.log(`✅ Encontrado por CPF: ID ${porCpf[0].id}`);
    } else if (porNome && porNome.length > 0) {
      console.log(`✅ Encontrado por nome: ID ${porNome[0].id}`);
    } else {
      console.log(`❌ NÃO ENCONTRADO no banco`);
    }
  }
  
  // Conta total de alunos
  const { count } = await supabase
    .from('alunos')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n\n📊 Total de alunos no banco: ${count}`);
}

checkSpecificStudents()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Erro:', err);
    process.exit(1);
  });
// Script para migrar dados existentes para turmas reais
// Execute no console do navegador em localhost:3000/admin/dashboard

console.log('🔄 Iniciando migração para turmas reais...');

// Mapeamento de turmas antigas para novas
const mapeamentoTurmas = {
  // Mapeamento direto
  '1ª Série A': 'EXTENSIVA MATUTINA 1',
  '1ª Série B': 'EXTENSIVA VESPERTINA 1', 
  '1ª Série C': 'EXTENSIVA NOTURNA 1',
  '2ª Série A': 'EXTENSIVA MATUTINA 2',
  '2ª Série B': 'EXTENSIVA VESPERTINA 2',
  '2ª Série C': 'TURMA SIS/PSC 1',
  '3ª Série A': 'TURMA SIS/PSC 2',
  '3ª Série B': 'INTENSIVA',
  '3ª Série C': 'EXTENSIVA MATUTINA 1',
  
  // Variações comuns
  'Medicina': 'INTENSIVA',
  'Intensivo': 'INTENSIVA',
  'Turma Intensiva': 'INTENSIVA',
  'Turma Fundamentos': 'TURMA SIS/PSC 1',
  
  // Já no formato correto (mantém igual)
  'INTENSIVA': 'INTENSIVA',
  'EXTENSIVA MATUTINA 1': 'EXTENSIVA MATUTINA 1',
  'EXTENSIVA NOTURNA 1': 'EXTENSIVA NOTURNA 1',
  'EXTENSIVA VESPERTINA 1': 'EXTENSIVA VESPERTINA 1',
  'TURMA SIS/PSC 1': 'TURMA SIS/PSC 1',
  'TURMA SIS/PSC 2': 'TURMA SIS/PSC 2',
  'EXTENSIVA MATUTINA 2': 'EXTENSIVA MATUTINA 2',
  'EXTENSIVA VESPERTINA 2': 'EXTENSIVA VESPERTINA 2'
};

// 1. Migrar horários
console.log('\n📅 Migrando horários...');
const horarios = JSON.parse(localStorage.getItem('horarios') || '[]');
const horariosOriginais = horarios.length;
const horariosAtualizados = horarios.map(h => {
  const novaTurma = mapeamentoTurmas[h.turma];
  if (novaTurma && novaTurma !== h.turma) {
    console.log(`  - ${h.turma} → ${novaTurma}`);
    return { ...h, turma: novaTurma };
  }
  return h;
});
localStorage.setItem('horarios', JSON.stringify(horariosAtualizados));
const horariosAlterados = horariosAtualizados.filter((h, i) => h.turma !== horarios[i]?.turma).length;
console.log(`✅ Horários migrados: ${horariosAlterados}/${horariosOriginais}`);

// 2. Migrar descritores
console.log('\n📝 Migrando descritores...');
const descritores = JSON.parse(localStorage.getItem('descritores') || '{}');
const descritoresOriginais = Object.keys(descritores).length;
const descritoresAtualizados = {};
let descritoresAlterados = 0;

Object.entries(descritores).forEach(([key, value]) => {
  if (value && typeof value === 'object' && value.turma) {
    const novaTurma = mapeamentoTurmas[value.turma];
    if (novaTurma && novaTurma !== value.turma) {
      console.log(`  - ${value.turma} → ${novaTurma}`);
      descritoresAtualizados[key] = { ...value, turma: novaTurma };
      descritoresAlterados++;
    } else {
      descritoresAtualizados[key] = value;
    }
  } else {
    descritoresAtualizados[key] = value;
  }
});
localStorage.setItem('descritores', JSON.stringify(descritoresAtualizados));
console.log(`✅ Descritores migrados: ${descritoresAlterados}/${descritoresOriginais}`);

// 3. Listar turmas únicas após migração
console.log('\n📊 Turmas após migração:');
const turmasUnicas = [...new Set(horariosAtualizados.map(h => h.turma))].sort();
turmasUnicas.forEach(turma => {
  const count = horariosAtualizados.filter(h => h.turma === turma).length;
  console.log(`  - ${turma}: ${count} aulas`);
});

// 4. Verificar dados não migrados
console.log('\n⚠️  Verificando dados não migrados...');
const turmasNaoMapeadas = [...new Set(horarios.map(h => h.turma))]
  .filter(turma => !mapeamentoTurmas[turma]);

if (turmasNaoMapeadas.length > 0) {
  console.log('Turmas não mapeadas encontradas:');
  turmasNaoMapeadas.forEach(turma => {
    const count = horarios.filter(h => h.turma === turma).length;
    console.log(`  - "${turma}": ${count} aulas`);
  });
} else {
  console.log('✅ Todas as turmas foram mapeadas com sucesso!');
}

// 5. Criar backup dos dados originais
const backup = {
  horarios: JSON.parse(localStorage.getItem('horarios_backup') || '[]'),
  descritores: JSON.parse(localStorage.getItem('descritores_backup') || '{}'),
  timestamp: new Date().toISOString()
};

// Só cria backup se ainda não existir
if (backup.horarios.length === 0) {
  localStorage.setItem('horarios_backup', JSON.stringify(horarios));
  localStorage.setItem('descritores_backup', JSON.stringify(descritores));
  console.log('\n💾 Backup dos dados originais criado');
}

console.log('\n🎉 Migração concluída!');
console.log('');
console.log('🔧 Para reverter a migração:');
console.log('localStorage.setItem("horarios", localStorage.getItem("horarios_backup"))');
console.log('localStorage.setItem("descritores", localStorage.getItem("descritores_backup"))');
console.log('');
console.log('🚀 Para continuar:');
console.log('1. Recarregue a página');
console.log('2. Verifique os dados no painel de descritores');
console.log('3. Execute o script test-real-turmas.js para criar dados de teste adicionais');

// Recarregar em 5 segundos
setTimeout(() => {
  console.log('\n🔄 Recarregando página...');
  window.location.reload();
}, 5000);
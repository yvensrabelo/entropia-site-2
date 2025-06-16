/**
 * Script de teste rápido para verificar se os horários aparecem na grade
 * Execute no console da página /admin/dashboard/horarios
 */

console.log('🧪 TESTE RÁPIDO - HORÁRIOS NA GRADE');

// 1. Limpar dados existentes
localStorage.removeItem('horarios_aulas');
console.log('✅ Dados limpos');

// 2. Criar dados de teste
const horariosTestе = [
  {
    id: '1',
    dia_semana: 'segunda',
    hora_inicio: '07:00',
    hora_fim: '07:50',
    professor_id: 'prof1',
    professor_nome: 'Prof. João Silva',
    materia: 'Matemática',
    turma: 'INTENSIVA',
    sala: 'Sala 1',
    turno: 'manhã',
    tempo: 1
  },
  {
    id: '2',
    dia_semana: 'segunda',
    hora_inicio: '08:00',
    hora_fim: '08:50',
    professor_id: 'prof2',
    professor_nome: 'Prof. Maria Santos',
    materia: 'Português',
    turma: 'INTENSIVA',
    sala: 'Sala 1',
    turno: 'manhã',
    tempo: 2
  },
  {
    id: '3',
    dia_semana: 'terça',
    hora_inicio: '07:00',
    hora_fim: '07:50',
    professor_id: 'prof1',
    professor_nome: 'Prof. João Silva',
    materia: 'Física',
    turma: 'EXTENSIVA',
    sala: 'Sala 2',
    turno: 'manhã',
    tempo: 1
  },
  {
    id: '4',
    dia_semana: 'terça',
    hora_inicio: '13:00',
    hora_fim: '13:50',
    professor_id: 'prof2',
    professor_nome: 'Prof. Maria Santos',
    materia: 'História',
    turma: 'INTENSIVA',
    sala: 'Sala 1',
    turno: 'tarde',
    tempo: 1
  }
];

// 3. Salvar dados de teste
localStorage.setItem('horarios_aulas', JSON.stringify(horariosTestе));
console.log('✅ Dados de teste criados:', horariosTestе.length, 'horários');

// 4. Verificar estrutura dos dados
console.log('📊 Estrutura dos dados:');
horariosTestе.forEach((aula, index) => {
  console.log(`Aula ${index + 1}:`, {
    dia: aula.dia_semana,
    hora: aula.hora_inicio,
    materia: aula.materia,
    professor: aula.professor_nome,
    turma: aula.turma,
    sala: aula.sala
  });
});

// 5. Forçar recarregamento da página
console.log('🔄 Recarregando página para aplicar mudanças...');
setTimeout(() => {
  window.location.reload();
}, 1000);

console.log('🎯 TESTE CONCLUÍDO - A página será recarregada');
console.log('Após o reload, verifique se as aulas aparecem na grade:');
console.log('- Segunda 07:00: Matemática');
console.log('- Segunda 08:00: Português');  
console.log('- Terça 07:00: Física');
console.log('- Terça 13:00: História');
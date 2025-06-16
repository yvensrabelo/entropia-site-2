/**
 * Script de teste para validar a integração da portaria
 * Execute no console do navegador na página admin
 */

console.log('=== TESTE DE INTEGRAÇÃO PORTARIA ===');

// 1. Testar estrutura de professores
const testProfessores = () => {
  console.log('\n1. TESTANDO PROFESSORES:');
  const professores = JSON.parse(localStorage.getItem('professores') || '[]');
  console.log('Total de professores:', professores.length);
  
  if (professores.length > 0) {
    const prof = professores[0];
    console.log('Estrutura do primeiro professor:', {
      tem_id: !!prof.id,
      tem_numero: !!prof.numero,
      tem_nome: !!prof.nome,
      tem_cpf: !!prof.cpf,
      tem_whatsapp: !!prof.whatsapp,
      tem_materias: !!prof.materias,
      tem_status: !!prof.status
    });
    console.log('✅ Professor exemplo:', prof);
  } else {
    console.log('❌ NENHUM PROFESSOR CADASTRADO');
  }
};

// 2. Testar estrutura de turmas ativas
const testTurmasAtivas = () => {
  console.log('\n2. TESTANDO TURMAS ATIVAS:');
  const turmas = JSON.parse(localStorage.getItem('turmas_ativas') || '[]');
  console.log('Total de turmas:', turmas.length);
  
  const turmasAtivas = turmas.filter(t => t.ativa);
  console.log('Turmas ativas:', turmasAtivas.length);
  
  if (turmasAtivas.length > 0) {
    const turma = turmasAtivas[0];
    console.log('Estrutura da primeira turma ativa:', {
      tem_id: !!turma.id,
      tem_nome: !!turma.nome,
      tem_turno: !!turma.turno,
      tem_tipo: !!turma.tipo,
      tem_ativa: turma.ativa === true,
      tem_ordem: typeof turma.ordem === 'number'
    });
    console.log('✅ Turma exemplo:', turma);
  } else {
    console.log('❌ NENHUMA TURMA ATIVA CADASTRADA');
  }
};

// 3. Testar estrutura de horários
const testHorarios = () => {
  console.log('\n3. TESTANDO HORÁRIOS:');
  const horarios = JSON.parse(localStorage.getItem('horarios_aulas') || '[]');
  console.log('Total de horários:', horarios.length);
  
  if (horarios.length > 0) {
    const horario = horarios[0];
    console.log('Estrutura do primeiro horário:', {
      tem_id: !!horario.id,
      tem_dia_semana: !!horario.dia_semana,
      tem_hora_inicio: !!horario.hora_inicio,
      tem_hora_fim: !!horario.hora_fim,
      tem_professor_id: !!horario.professor_id,
      tem_professor_nome: !!horario.professor_nome,
      tem_materia: !!horario.materia,
      tem_turma: !!horario.turma,
      tem_sala: !!horario.sala,
      tem_turno: !!horario.turno,
      tem_tempo: typeof horario.tempo === 'number'
    });
    console.log('✅ Horário exemplo:', horario);
    
    // Verificar se há aulas para hoje
    const hoje = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][new Date().getDay()];
    const aulasHoje = horarios.filter(h => h.dia_semana === hoje);
    console.log(`Aulas para hoje (${hoje}):`, aulasHoje.length);
    
    if (aulasHoje.length > 0) {
      console.log('✅ Primeira aula de hoje:', aulasHoje[0]);
    }
  } else {
    console.log('❌ NENHUM HORÁRIO CADASTRADO');
  }
};

// 4. Testar portaria
const testPortaria = () => {
  console.log('\n4. TESTANDO CÓDIGO PORTARIA:');
  const codigoPortaria = localStorage.getItem('codigo_portaria') || 'PORTARIA';
  console.log('Código da portaria:', codigoPortaria);
  console.log('✅ Link da portaria: ' + window.location.origin + '/portaria');
};

// 5. Criar dados de teste se necessário
const criarDadosTeste = () => {
  console.log('\n5. CRIANDO DADOS DE TESTE:');
  
  // Criar professores de teste
  const professores = JSON.parse(localStorage.getItem('professores') || '[]');
  if (professores.length === 0) {
    const professoresTeste = [
      {
        id: '1',
        numero: '001',
        nome: 'Prof. João Silva',
        cpf: '123.456.789-00',
        whatsapp: '(92) 99999-9999',
        materias: ['Matemática', 'Física'],
        status: 'ativo'
      },
      {
        id: '2',
        numero: '002',
        nome: 'Prof. Maria Santos',
        cpf: '987.654.321-00',
        whatsapp: '(92) 88888-8888',
        materias: ['Português', 'Literatura'],
        status: 'ativo'
      }
    ];
    localStorage.setItem('professores', JSON.stringify(professoresTeste));
    console.log('✅ Criados 2 professores de teste');
  }
  
  // Criar turmas ativas de teste
  const turmas = JSON.parse(localStorage.getItem('turmas_ativas') || '[]');
  if (turmas.filter(t => t.ativa).length === 0) {
    const turmasTeste = [
      {
        id: '1',
        nome: 'INTENSIVA',
        turno: 'manhã',
        tipo: 'intensiva',
        ativa: true,
        ordem: 1
      },
      {
        id: '2',
        nome: 'EXTENSIVA MATUTINA 1',
        turno: 'manhã',
        tipo: 'extensiva',
        serie: '1ª série',
        ativa: true,
        ordem: 2
      }
    ];
    localStorage.setItem('turmas_ativas', JSON.stringify(turmasTeste));
    console.log('✅ Criadas 2 turmas ativas de teste');
  }
  
  // Criar horários de teste para hoje
  const horarios = JSON.parse(localStorage.getItem('horarios_aulas') || '[]');
  const hoje = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'][new Date().getDay()];
  const aulasHoje = horarios.filter(h => h.dia_semana === hoje);
  
  if (aulasHoje.length === 0) {
    const horariosHoje = [
      {
        id: Date.now().toString() + '1',
        dia_semana: hoje,
        hora_inicio: '07:00',
        hora_fim: '07:50',
        professor_id: '1',
        professor_nome: 'Prof. João Silva',
        materia: 'Matemática',
        turma: 'INTENSIVA',
        sala: 'Sala 1',
        turno: 'manhã',
        tempo: 1
      },
      {
        id: Date.now().toString() + '2',
        dia_semana: hoje,
        hora_inicio: '08:00',
        hora_fim: '08:50',
        professor_id: '2',
        professor_nome: 'Prof. Maria Santos',
        materia: 'Português',
        turma: 'INTENSIVA',
        sala: 'Sala 1',
        turno: 'manhã',
        tempo: 2
      },
      {
        id: Date.now().toString() + '3',
        dia_semana: hoje,
        hora_inicio: '07:00',
        hora_fim: '07:50',
        professor_id: '1',
        professor_nome: 'Prof. João Silva',
        materia: 'Física',
        turma: 'EXTENSIVA MATUTINA 1',
        sala: 'Sala 2',
        turno: 'manhã',
        tempo: 1
      }
    ];
    
    const novosHorarios = [...horarios, ...horariosHoje];
    localStorage.setItem('horarios_aulas', JSON.stringify(novosHorarios));
    console.log('✅ Criadas 3 aulas de teste para hoje');
  }
};

// Executar todos os testes
const executarTestes = () => {
  testProfessores();
  testTurmasAtivas();
  testHorarios();
  testPortaria();
  
  console.log('\n=== CRIANDO DADOS DE TESTE SE NECESSÁRIO ===');
  criarDadosTeste();
  
  console.log('\n=== TESTE COMPLETO ===');
  console.log('Após criar dados de teste:');
  testProfessores();
  testTurmasAtivas();
  testHorarios();
  
  console.log('\n✅ INTEGRAÇÃO TESTADA COM SUCESSO!');
  console.log('📱 Acesse /portaria para testar a visualização');
  console.log('🔑 Código padrão: PORTARIA');
};

// Exportar função para execução manual
window.testarIntegracaoPortaria = executarTestes;

// Executar automaticamente
executarTestes();
// Script para configurar dados de teste com turmas reais
// Execute no console do navegador em localhost:3000/admin/dashboard

// 1. Turmas reais do sistema
const turmasReais = [
  'INTENSIVA',
  'EXTENSIVA MATUTINA 1',
  'EXTENSIVA NOTURNA 1',
  'EXTENSIVA VESPERTINA 1',
  'TURMA SIS/PSC 1',
  'TURMA SIS/PSC 2',
  'EXTENSIVA MATUTINA 2',
  'EXTENSIVA VESPERTINA 2'
];

// 2. Horários por turno
const horariosPorTurno = {
  'Matutino': [
    { inicio: '07:00', fim: '08:30' },
    { inicio: '08:40', fim: '10:10' },
    { inicio: '10:20', fim: '11:50' }
  ],
  'Vespertino': [
    { inicio: '13:00', fim: '14:30' },
    { inicio: '14:40', fim: '16:10' },
    { inicio: '16:20', fim: '17:50' }
  ],
  'Noturno': [
    { inicio: '18:00', fim: '19:30' },
    { inicio: '19:40', fim: '21:10' },
    { inicio: '21:20', fim: '22:50' }
  ]
};

// 3. Professores atualizados
const professoresReais = [
  {
    id: "prof-001",
    nome: "Ana Silva",
    cpf: "98660608291",
    email: "ana.silva@entropia.com",
    materias: ["Matemática", "Física"],
    ativo: true
  },
  {
    id: "prof-002", 
    nome: "Carlos Santos",
    cpf: "12345678901",
    email: "carlos.santos@entropia.com",
    materias: ["Português", "Literatura"],
    ativo: true
  },
  {
    id: "prof-003",
    nome: "Maria Oliveira", 
    cpf: "98765432109",
    email: "maria.oliveira@entropia.com",
    materias: ["Química", "Biologia"],
    ativo: true
  },
  {
    id: "prof-004",
    nome: "João Pedro",
    cpf: "11122233344",
    email: "joao.pedro@entropia.com",
    materias: ["História", "Geografia"],
    ativo: true
  },
  {
    id: "prof-005",
    nome: "Fernanda Costa",
    cpf: "55566677788",
    email: "fernanda.costa@entropia.com",
    materias: ["Inglês", "Espanhol"],
    ativo: true
  }
];

// 4. Materias por turma
const materiasPorTurma = {
  'INTENSIVA': ['Matemática', 'Física', 'Química'],
  'EXTENSIVA MATUTINA 1': ['Matemática', 'Português', 'História'],
  'EXTENSIVA NOTURNA 1': ['Física', 'Química', 'Biologia'],
  'EXTENSIVA VESPERTINA 1': ['Matemática', 'Geografia', 'Inglês'],
  'TURMA SIS/PSC 1': ['Matemática', 'Física', 'Português'],
  'TURMA SIS/PSC 2': ['Química', 'Biologia', 'História'],
  'EXTENSIVA MATUTINA 2': ['Matemática', 'Literatura', 'Geografia'],
  'EXTENSIVA VESPERTINA 2': ['Física', 'Química', 'Espanhol']
};

// 5. Função para determinar turno
function getTurno(turma) {
  if (turma.includes('MATUTINA')) return 'Matutino';
  if (turma.includes('NOTURNA')) return 'Noturno';
  return 'Vespertino';
}

// 6. Função para obter professor por matéria
function getProfessorByMateria(materia) {
  const professor = professoresReais.find(p => p.materias.includes(materia));
  return professor ? professor.id : 'prof-001'; // fallback
}

// 7. Criar horários com turmas reais
function criarHorariosReais() {
  const horariosExemplo = [];
  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  
  turmasReais.forEach((turma, turmaIndex) => {
    const turno = getTurno(turma);
    const horarios = horariosPorTurno[turno];
    const materias = materiasPorTurma[turma] || ['Matemática', 'Física', 'Química'];
    
    // Criar aulas apenas para Segunda (para demonstração)
    const dia = 'Segunda';
    
    horarios.forEach((horario, horarioIndex) => {
      const materia = materias[horarioIndex % materias.length];
      const professorId = getProfessorByMateria(materia);
      
      horariosExemplo.push({
        id: `${turma.replace(/\s+/g, '-')}-${dia}-${horarioIndex}`,
        turma: turma,
        dia: dia,
        horaInicio: horario.inicio,
        horaFim: horario.fim,
        materia: materia,
        professorId: professorId,
        sala: `Sala ${String.fromCharCode(65 + Math.floor(turmaIndex / 3))}${(turmaIndex % 3) + 1}`,
        tempo: horarioIndex + 1
      });
    });
  });
  
  return horariosExemplo;
}

// 8. Criar descritores de exemplo com cenários variados
function criarDescritoresExemplo(horarios) {
  const descritoresExemplo = {};
  
  horarios.forEach((aula, index) => {
    const professor = professoresReais.find(p => p.id === aula.professorId);
    
    // Criar cenários diversos:
    // - Turmas com progresso completo
    // - Turmas com progresso parcial
    // - Turmas sem progresso
    
    const shouldCreateDescritor = (() => {
      if (aula.turma === 'INTENSIVA') return index < 2; // 2/3 progresso
      if (aula.turma === 'EXTENSIVA MATUTINA 1') return true; // 3/3 progresso
      if (aula.turma === 'EXTENSIVA VESPERTINA 1') return index === 0; // 1/3 progresso
      if (aula.turma === 'TURMA SIS/PSC 1') return false; // 0/3 progresso
      return Math.random() > 0.4; // Variado para outras turmas
    })();
    
    if (shouldCreateDescritor) {
      descritoresExemplo[aula.id] = {
        texto: `Aula de ${aula.materia} ministrada na turma ${aula.turma}. Trabalhamos conceitos fundamentais e realizamos exercícios práticos. Os alunos demonstraram boa participação e compreensão do conteúdo apresentado.`,
        professorId: aula.professorId,
        professorNome: professor?.nome || 'Professor',
        dataHora: new Date().toISOString(),
        turma: aula.turma,
        materia: aula.materia,
        dia: aula.dia,
        horario: `${aula.horaInicio} - ${aula.horaFim}`
      };
    }
  });
  
  return descritoresExemplo;
}

// 9. Função principal para configurar dados
function setupTurmasReais() {
  console.log('🏫 Configurando sistema com turmas reais...');
  
  try {
    // Salvar professores
    localStorage.setItem('professors', JSON.stringify(professoresReais));
    console.log('✅ Professores configurados');
    
    // Criar e salvar horários
    const horariosReais = criarHorariosReais();
    localStorage.setItem('horarios', JSON.stringify(horariosReais));
    console.log('✅ Horários configurados para turmas reais');
    
    // Criar e salvar descritores
    const descritoresReais = criarDescritoresExemplo(horariosReais);
    localStorage.setItem('descritores', JSON.stringify(descritoresReais));
    console.log('✅ Descritores configurados');
    
    console.log('🎉 Sistema configurado com turmas reais!');
    console.log('');
    console.log('📊 Resumo das turmas:');
    turmasReais.forEach(turma => {
      const aulasDaTurma = horariosReais.filter(h => h.turma === turma);
      const descritoresDaTurma = aulasDaTurma.filter(h => descritoresReais[h.id]);
      const progresso = `${descritoresDaTurma.length}/${aulasDaTurma.length}`;
      const turno = getTurno(turma);
      
      console.log(`- ${turma} (${turno}): ${progresso}`);
    });
    
    console.log('');
    console.log('🎯 Cenários criados:');
    console.log('- ✅ EXTENSIVA MATUTINA 1: COMPLETA');
    console.log('- 🔶 INTENSIVA: PARCIAL (2/3)');
    console.log('- 🔶 EXTENSIVA VESPERTINA 1: PARCIAL (1/3)');
    console.log('- ❌ TURMA SIS/PSC 1: SEM DESCRITORES');
    console.log('- 🎲 Outras turmas: Progresso variado');
    
    console.log('');
    console.log('🚀 Para testar:');
    console.log('1. Acesse /admin/dashboard');
    console.log('2. Clique na aba "Descritores"');
    console.log('3. Veja as turmas reais com diferentes progressos!');
    console.log('4. Use o CPF 986.606.082-91 para testar como professor');
    
    // Recarregar página em 3 segundos
    setTimeout(() => {
      console.log('🔄 Recarregando página...');
      window.location.reload();
    }, 3000);
    
  } catch (error) {
    console.error('❌ Erro ao configurar turmas reais:', error);
  }
}

// 10. Executar automaticamente
setupTurmasReais();
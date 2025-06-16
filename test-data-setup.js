// Script para configurar dados de teste do sistema de descritores
// Execute no console do navegador em localhost:3001/admin/dashboard

// 1. Configurar professores
const professoresTest = [
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
  }
];

// 2. Configurar horários (mais completo para demonstrar funcionalidades)
const horariosTest = [
  // 3ª Série A - Segunda
  {
    id: "aula-001",
    dia: "Segunda",
    horaInicio: "07:30",
    horaFim: "08:20",
    turma: "3ª Série A",
    materia: "Matemática",
    professorId: "prof-001",
    sala: "A1"
  },
  {
    id: "aula-002", 
    dia: "Segunda",
    horaInicio: "08:20",
    horaFim: "09:10", 
    turma: "3ª Série A",
    materia: "Física",
    professorId: "prof-001",
    sala: "A1"
  },
  {
    id: "aula-003",
    dia: "Segunda",
    horaInicio: "09:30",
    horaFim: "10:20",
    turma: "3ª Série A", 
    materia: "Português",
    professorId: "prof-002",
    sala: "A1"
  },
  {
    id: "aula-004",
    dia: "Segunda",
    horaInicio: "10:20",
    horaFim: "11:10",
    turma: "3ª Série A",
    materia: "Química",
    professorId: "prof-003", 
    sala: "A1"
  },
  // 2ª Série B
  {
    id: "aula-005",
    dia: "Segunda",
    horaInicio: "07:30", 
    horaFim: "08:20",
    turma: "2ª Série B",
    materia: "Matemática",
    professorId: "prof-001",
    sala: "B2"
  },
  {
    id: "aula-006",
    dia: "Segunda",
    horaInicio: "08:20", 
    horaFim: "09:10",
    turma: "2ª Série B",
    materia: "Biologia",
    professorId: "prof-003",
    sala: "B2"
  },
  // Intensivo - Turma com progresso parcial
  {
    id: "aula-007",
    dia: "Segunda",
    horaInicio: "14:00", 
    horaFim: "15:30",
    turma: "Intensivo",
    materia: "Matemática",
    professorId: "prof-001",
    sala: "C1"
  },
  {
    id: "aula-008",
    dia: "Segunda",
    horaInicio: "15:45", 
    horaFim: "17:15",
    turma: "Intensivo",
    materia: "Física",
    professorId: "prof-001",
    sala: "C1"
  },
  {
    id: "aula-009",
    dia: "Segunda",
    horaInicio: "19:00", 
    horaFim: "20:30",
    turma: "Intensivo",
    materia: "Química",
    professorId: "prof-003",
    sala: "C1"
  }
];

// 3. Configurar descritores para demonstrar diferentes cenários
const descritoresTest = {
  // 3ª Série A - Turma com progresso completo (4/4)
  "aula-001": {
    texto: "Hoje trabalhamos equações de segundo grau utilizando o método de Bhaskara. Resolvemos exercícios do livro páginas 45-48 e discutimos aplicações práticas. Os alunos demonstraram boa compreensão do conteúdo.",
    professorId: "prof-001", 
    professorNome: "Ana Silva",
    dataHora: new Date().toISOString(),
    turma: "3ª Série A",
    materia: "Matemática",
    dia: "Segunda",
    horario: "07:30 - 08:20"
  },
  "aula-002": {
    texto: "Estudamos movimento uniformemente variado. Calculamos aceleração e velocidade em exercícios práticos. Revisamos fórmulas de cinemática para a prova do ENEM.",
    professorId: "prof-001", 
    professorNome: "Ana Silva",
    dataHora: new Date().toISOString(),
    turma: "3ª Série A",
    materia: "Física",
    dia: "Segunda",
    horario: "08:20 - 09:10"
  },
  "aula-003": {
    texto: "Estudamos figuras de linguagem com foco em metáforas e metonímias. Analisamos textos literários do Romantismo brasileiro. Exercícios de interpretação de texto foram realizados em duplas.",
    professorId: "prof-002",
    professorNome: "Carlos Santos", 
    dataHora: new Date().toISOString(),
    turma: "3ª Série A",
    materia: "Português",
    dia: "Segunda", 
    horario: "09:30 - 10:20"
  },
  "aula-004": {
    texto: "Trabalhamos reações de oxirredução e balanceamento de equações químicas. Fizemos exercícios práticos sobre transferência de elétrons. Revisão para vestibular focada em UFAM.",
    professorId: "prof-003",
    professorNome: "Maria Oliveira", 
    dataHora: new Date().toISOString(),
    turma: "3ª Série A",
    materia: "Química",
    dia: "Segunda", 
    horario: "10:20 - 11:10"
  },
  
  // 2ª Série B - Progresso parcial (1/2) - Professor Carlos aguardando
  "aula-005": {
    texto: "Revisamos funções quadráticas e suas propriedades. Trabalhamos com gráficos de parábolas e encontro com os eixos. Exercícios preparatórios para simulados.",
    professorId: "prof-001",
    professorNome: "Ana Silva", 
    dataHora: new Date().toISOString(),
    turma: "2ª Série B",
    materia: "Matemática",
    dia: "Segunda", 
    horario: "07:30 - 08:20"
  },
  // aula-006 (Biologia) - SEM DESCRITOR - Prof. Maria aguardando
  
  // Intensivo - Progresso parcial (2/3) - Professor Maria aguardando na Química
  "aula-007": {
    texto: "Aula intensiva de logaritmos e suas propriedades. Resolução de equações logarítmicas complexas. Foco em questões de vestibular medicina.",
    professorId: "prof-001",
    professorNome: "Ana Silva", 
    dataHora: new Date().toISOString(),
    turma: "Intensivo",
    materia: "Matemática",
    dia: "Segunda", 
    horario: "14:00 - 15:30"
  },
  "aula-008": {
    texto: "Física moderna: efeito fotoelétrico e dualidade onda-partícula. Discussão sobre aplicações na tecnologia atual. Exercícios de vestibular de medicina.",
    professorId: "prof-001",
    professorNome: "Ana Silva", 
    dataHora: new Date().toISOString(),
    turma: "Intensivo",
    materia: "Física",
    dia: "Segunda", 
    horario: "15:45 - 17:15"
  }
  // aula-009 (Química) - SEM DESCRITOR - Prof. Maria aguardando
};

// 4. Função para configurar os dados
function setupTestData() {
  console.log('🔧 Configurando dados de teste...');
  
  try {
    localStorage.setItem('professors', JSON.stringify(professoresTest));
    console.log('✅ Professores configurados');
    
    localStorage.setItem('horarios', JSON.stringify(horariosTest));
    console.log('✅ Horários configurados');
    
    localStorage.setItem('descritores', JSON.stringify(descritoresTest));
    console.log('✅ Descritores configurados');
    
    console.log('🎉 Dados de teste configurados com sucesso!');
    console.log('');
    console.log('📝 Para testar o sistema completo:');
    console.log('1. Acesse /descritor com CPF: 986.606.082-91');
    console.log('2. Acesse o Dashboard Admin (/admin/dashboard)');
    console.log('3. Clique na aba "Descritores" no topo');
    console.log('4. Veja as turmas com diferentes progressos!');
    console.log('');
    console.log('🎯 Cenários de teste criados:');
    console.log('- 📗 EXTENSIVA MATUTINA 1: COMPLETA (4/4) - Todos prontos!');
    console.log('- 📙 EXTENSIVA VESPERTINA 1: PARCIAL (1/2) - Maria aguardando');
    console.log('- 📘 INTENSIVA: PARCIAL (2/3) - Maria aguardando');
    console.log('');
    console.log('🚀 Funcionalidades implementadas:');
    console.log('- ✅ Visualização por turma com progresso');
    console.log('- ✅ Professores aguardando descritor');
    console.log('- ✅ WhatsApp teste: 5592981662806');
    console.log('- ✅ Auto-refresh a cada 5 segundos');
    console.log('- ✅ Filtros por turma (turmas reais)');
    console.log('- ✅ Barra de progresso visual');
    console.log('- ✅ Contadores dinâmicos');
    console.log('');
    console.log('📱 Teste o WhatsApp:');
    console.log('- Clique "Enviar para Alunos" na 3ª Série A');
    console.log('- Será enviado para: +55 92 98166-2806');
    
    // Recarregar a página para aplicar as mudanças
    setTimeout(() => {
      window.location.reload();
    }, 3000);
    
  } catch (error) {
    console.error('❌ Erro ao configurar dados:', error);
  }
}

// 5. Executar automaticamente
setupTestData();
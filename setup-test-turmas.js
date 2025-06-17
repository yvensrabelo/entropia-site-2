// Script para popular turmas de teste
const turmasIniciais = [
  {
    id: 'turma-1',
    nome: 'PSC INTENSIVO',
    foco: 'PREPARAÇÃO TOTAL PARA PSC UFAM',
    serie: '3',
    beneficios: [
      { texto: 'Material específico PSC', destaquePlatinado: true },
      { texto: 'Simulados semanais', destaquePlatinado: false },
      { texto: 'Correção de redação', destaquePlatinado: false }
    ],
    ativa: true
  },
  {
    id: 'turma-2', 
    nome: 'ENEM MAX',
    foco: 'FOCO TOTAL NO ENEM 2025',
    serie: '3',
    beneficios: [
      { texto: 'Redação nota 1000', destaquePlatinado: true },
      { texto: 'Mentoria personalizada', destaquePlatinado: true },
      { texto: 'Simulados ENEM', destaquePlatinado: false }
    ],
    ativa: true
  },
  {
    id: 'turma-3',
    nome: 'MEDICINA VIP',
    foco: 'PREPARAÇÃO EXCLUSIVA PARA MEDICINA',
    serie: 'formado',
    beneficios: [
      { texto: 'Turma reduzida (máx 15 alunos)', destaquePlatinado: true },
      { texto: 'Professor particular', destaquePlatinado: true },
      { texto: 'Simulados específicos', destaquePlatinado: false }
    ],
    ativa: true
  }
];

console.log('Configurando turmas de teste...');
console.log('Dados a serem inseridos:');
console.log(JSON.stringify(turmasIniciais, null, 2));
console.log('\nPara aplicar no navegador:');
console.log('localStorage.setItem("turmas_simples", JSON.stringify(' + JSON.stringify(turmasIniciais) + '));');
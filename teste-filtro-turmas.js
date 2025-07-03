// Teste para verificar se o filtro de turmas funciona corretamente

// Simular dados do banco
const turmasDoBanco = [
  {
    id: 1,
    nome: 'PSC Intensivo Manhã',
    descricao: 'Preparação intensiva para PSC',
    ordem: 3, // 3ª série
    turnos: ['matutino'],
    series_atendidas: ['3'],
    ativo: true
  },
  {
    id: 2,
    nome: 'Extensivo ENEM',
    descricao: 'Curso extensivo para ENEM',
    ordem: 'formado',
    turnos: ['noturno'],
    series_atendidas: ['formado'],
    ativo: true
  }
];

// Função de mapeamento corrigida
const mapearSerie = (ordem) => {
  const ordemString = ordem?.toString() || '1';
  switch (ordemString) {
    case '1': return '1ª série';
    case '2': return '2ª série';
    case '3': return '3ª série';
    case 'formado': return 'Extensivo';
    default: return '1ª série';
  }
};

// Processar turmas como o serviço faz
const turmasProcessadas = turmasDoBanco.map(turma => ({
  id: turma.id.toString(),
  nome: turma.nome,
  foco: turma.descricao,
  serie: mapearSerie(turma.ordem), // CORREÇÃO APLICADA
  turnos: turma.turnos,
  seriesAtendidas: turma.series_atendidas,
  ativa: turma.ativo
}));

// Mapeamento da interface (como na homepage)
const serieMapeamento = {
  '1serie': '1ª série',
  '2serie': '2ª série', 
  '3serie': '3ª série',
  'formado': 'Extensivo'
};

// Testar filtro para 3ª série
console.log('=== TESTE FILTRO 3ª SÉRIE ===');
const serieParaTeste = '3serie';
const serieCorrespondente = serieMapeamento[serieParaTeste];

console.log('Procurando por:', serieCorrespondente);
console.log('Turmas disponíveis:');
turmasProcessadas.forEach(turma => {
  console.log(`- ${turma.nome}: serie="${turma.serie}"`);
});

const turmasEncontradas = turmasProcessadas.filter(turma => 
  turma.serie === serieCorrespondente
);

console.log('\nTurmas encontradas:', turmasEncontradas.length);
turmasEncontradas.forEach(turma => {
  console.log(`✅ ${turma.nome} (${turma.serie})`);
});

// Testar filtro para Extensivo
console.log('\n=== TESTE FILTRO EXTENSIVO ===');
const serieExtensivo = 'formado';
const serieCorrespondenteExtensivo = serieMapeamento[serieExtensivo];

console.log('Procurando por:', serieCorrespondenteExtensivo);
const turmasExtensivo = turmasProcessadas.filter(turma => 
  turma.serie === serieCorrespondenteExtensivo
);

console.log('Turmas encontradas:', turmasExtensivo.length);
turmasExtensivo.forEach(turma => {
  console.log(`✅ ${turma.nome} (${turma.serie})`);
});
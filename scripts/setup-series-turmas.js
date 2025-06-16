// Script to setup initial turmas with series mapping

const turmasIniciais = [
  {
    id: '1',
    nome: 'PSC UFAM - 1ª Série',
    tipo: 'psc',
    turno: 'manhã',
    preco: 180,
    ativa: true,
    destaque: false,
    ordem: 1,
    cor: '#ffffff',
    serieCorrespondente: '1',
    descricoes: {
      card: 'Preparação desde cedo para o PSC UFAM',
      resumo: 'Comece sua jornada rumo à UFAM desde a 1ª série do ensino médio. Material específico e metodologia adaptada.',
      completa: 'Curso preparatório para alunos da 1ª série que desejam iniciar sua preparação para o PSC UFAM com antecedência.',
      slogan: 'Comece cedo, chegue longe!'
    },
    beneficios: {
      principais: [
        'Material didático adaptado para 1ª série',
        'Acompanhamento pedagógico personalizado',
        'Simulados progressivos',
        'Orientação vocacional'
      ],
      secundarios: [
        'Grupos de estudo',
        'Monitoria online'
      ],
      icones: [
        { icone: '📚', texto: 'Material adaptado' },
        { icone: '👨‍🏫', texto: 'Acompanhamento personalizado' },
        { icone: '📝', texto: 'Simulados progressivos' },
        { icone: '🎯', texto: 'Orientação vocacional' }
      ]
    },
    detalhes: {
      cargaHoraria: '180 horas',
      duracao: '10 meses',
      modalidade: 'presencial',
      publicoAlvo: 'Alunos da 1ª série do ensino médio',
      materialIncluso: true,
      certificado: true,
      nivel: 'basico'
    },
    visibilidade: {
      mostrarPreco: false,
      mostrarVagas: true,
      mostrarHorarios: true,
      mostrarBeneficios: true,
      destaque: false
    }
  },
  {
    id: '2',
    nome: 'ENEM Total - 2ª Série',
    tipo: 'enem',
    turno: 'tarde',
    preco: 200,
    ativa: true,
    destaque: true,
    ordem: 2,
    cor: '#ffffff',
    serieCorrespondente: '2',
    descricoes: {
      card: 'Preparação completa para o ENEM',
      resumo: 'Intensifique seus estudos na 2ª série com foco total no ENEM. Metodologia comprovada e professores especialistas.',
      completa: 'Curso completo para alunos da 2ª série que buscam uma preparação sólida para o ENEM.',
      slogan: 'Intensifique sua preparação!'
    },
    beneficios: {
      principais: [
        'Foco nas competências do ENEM',
        'Redação nota 1000',
        'Simulados TRI',
        'Plataforma digital exclusiva',
        'Aulas de atualidades'
      ],
      secundarios: [
        'Correção detalhada de redações',
        'Banco de questões online',
        'Lives semanais'
      ],
      icones: [
        { icone: '📖', texto: 'Competências ENEM' },
        { icone: '✍️', texto: 'Redação nota 1000' },
        { icone: '📊', texto: 'Simulados TRI' },
        { icone: '💻', texto: 'Plataforma digital' },
        { icone: '🌎', texto: 'Atualidades' }
      ]
    },
    detalhes: {
      cargaHoraria: '240 horas',
      duracao: '10 meses',
      modalidade: 'presencial',
      publicoAlvo: 'Alunos da 2ª série do ensino médio',
      materialIncluso: true,
      certificado: true,
      nivel: 'intermediario'
    },
    visibilidade: {
      mostrarPreco: false,
      mostrarVagas: true,
      mostrarHorarios: true,
      mostrarBeneficios: true,
      destaque: true
    }
  },
  {
    id: '3',
    nome: 'Intensivo Final - 3ª Série',
    tipo: 'intensivo',
    turno: 'noite',
    preco: 250,
    ativa: true,
    destaque: true,
    ordem: 3,
    cor: '#ffffff',
    serieCorrespondente: '3',
    descricoes: {
      card: 'Reta final para todos os vestibulares',
      resumo: 'Curso intensivo para a reta final. Revisão completa, simulados semanais e foco total na aprovação.',
      completa: 'Preparação intensiva para alunos da 3ª série e formados que buscam aprovação nos principais vestibulares.',
      slogan: 'Sua aprovação é nossa meta!'
    },
    beneficios: {
      principais: [
        'Revisão completa do conteúdo',
        'Simulados semanais',
        'Aulões temáticos',
        'Plantão de dúvidas 24h',
        'Material de revisão exclusivo'
      ],
      secundarios: [
        'Acompanhamento psicológico',
        'Técnicas de controle emocional',
        'Estratégias de prova'
      ],
      icones: [
        { icone: '🎯', texto: 'Revisão completa' },
        { icone: '📝', texto: 'Simulados semanais' },
        { icone: '🚀', texto: 'Aulões temáticos' },
        { icone: '💡', texto: 'Plantão 24h' },
        { icone: '📚', texto: 'Material exclusivo' }
      ]
    },
    detalhes: {
      cargaHoraria: '320 horas',
      duracao: '8 meses',
      modalidade: 'presencial',
      publicoAlvo: 'Alunos da 3ª série e formados',
      materialIncluso: true,
      certificado: true,
      nivel: 'avancado'
    },
    visibilidade: {
      mostrarPreco: false,
      mostrarVagas: true,
      mostrarHorarios: true,
      mostrarBeneficios: true,
      destaque: true
    }
  }
];

// Executar no console do navegador
console.log('Configurando turmas com mapeamento de séries...');
localStorage.setItem('turmas_robustas', JSON.stringify(turmasIniciais));
console.log('✅ Turmas configuradas com sucesso!');
console.log('Séries mapeadas:');
console.log('- 1ª série → PSC UFAM');
console.log('- 2ª série → ENEM Total');
console.log('- 3ª série → Intensivo Final');
console.log('- Formados → Intensivo Final (mesma turma da 3ª série)');
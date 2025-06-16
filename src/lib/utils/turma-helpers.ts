import { 
  Turma, 
  TurmaRobusta,
  TurmaDescricoes, 
  TurmaBeneficios, 
  TurmaDetalhes,
  TurmaInformacoes,
  TurmaSEO,
  TurmaVisibilidade 
} from '@/lib/types/turma';

/**
 * Helper functions for working with the robust Turma description system
 */

/**
 * Get the most appropriate description for a given context
 */
export function getTurmaDescricao(
  turma: Turma | TurmaRobusta, 
  tipo: 'card' | 'resumo' | 'completa' | 'slogan' = 'card'
): string {
  // Try to get from new robust system first
  if (turma.descricoes) {
    switch (tipo) {
      case 'card':
        return turma.descricoes.card || turma.descricoes.resumo || ('descricao' in turma ? turma.descricao : '');
      case 'resumo':
        return turma.descricoes.resumo || turma.descricoes.card || ('descricao' in turma ? turma.descricao : '');
      case 'completa':
        return turma.descricoes.completa || turma.descricoes.resumo || ('descricao' in turma ? turma.descricao : '');
      case 'slogan':
        return turma.descricoes.slogan || turma.nome;
    }
  }
  
  // Fallback to legacy description
  return 'descricao' in turma ? turma.descricao : '';
}

/**
 * Get all benefits as a flat array
 */
export function getTurmaBeneficios(turma: Turma | TurmaRobusta): string[] {
  const beneficios: string[] = [];
  
  // Add from new system
  if (turma.beneficios) {
    if (turma.beneficios.principais) {
      beneficios.push(...turma.beneficios.principais);
    }
    if (turma.beneficios.secundarios) {
      beneficios.push(...turma.beneficios.secundarios);
    }
    if (turma.beneficios.icones) {
      beneficios.push(...turma.beneficios.icones.map(item => item.texto));
    }
  }
  
  // Add from legacy system
  if ('diferenciais' in turma && turma.diferenciais && turma.diferenciais.length > 0) {
    beneficios.push(...turma.diferenciais);
  }
  
  return [...new Set(beneficios)]; // Remove duplicates
}

/**
 * Get benefits with icons for enhanced display
 */
export function getTurmaBeneficiosComIcones(turma: Turma | TurmaRobusta) {
  return turma.beneficios?.icones || [];
}

/**
 * Check if turma should be visible based on visibility settings
 */
export function isTurmaVisivel(turma: Turma | TurmaRobusta, contexto: 'home' | 'catalogo' = 'home'): boolean {
  // Check basic active status
  const isActive = 'ativa' in turma ? turma.ativa : ('ativo' in turma ? turma.ativo : false);
  if (!isActive) return false;
  
  // Check visibility settings if available
  if (turma.visibilidade) {
    const now = new Date();
    
    // Check date range
    if (turma.visibilidade.data_inicio_exibicao && new Date(turma.visibilidade.data_inicio_exibicao) > now) {
      return false;
    }
    if (turma.visibilidade.data_fim_exibicao && new Date(turma.visibilidade.data_fim_exibicao) < now) {
      return false;
    }
    
    // Check context-specific visibility
    if (contexto === 'home' && turma.visibilidade.exibir_home === false) {
      return false;
    }
    if (contexto === 'catalogo' && turma.visibilidade.exibir_catalogo === false) {
      return false;
    }
  }
  
  return true;
}

/**
 * Check if turma should be highlighted/featured
 */
export function isTurmaDestaque(turma: Turma | TurmaRobusta): boolean {
  return turma.visibilidade?.destacar === true || Boolean(turma.destaque);
}

/**
 * Get SEO metadata for a turma
 */
export function getTurmaSEO(turma: Turma) {
  return {
    title: turma.nome,
    description: turma.seo?.meta_description || getTurmaDescricao(turma, 'resumo'),
    keywords: turma.seo?.keywords || [],
    ogImage: turma.seo?.og_image,
    schemaType: turma.seo?.schema_type || 'Course',
    landingPage: turma.seo?.landing_page
  };
}

/**
 * Get enrollment information for a turma
 */
export function getTurmaInscricoes(turma: Turma) {
  const info = turma.informacoes;
  if (!info) return null;
  
  return {
    proximaTurma: info.proxima_turma,
    inscricoesAbertas: info.inscricoes_abertas ?? true,
    desconto: info.desconto_ativo,
    bonus: info.bonus || [],
    depoimentos: info.depoimentos || []
  };
}

/**
 * Format turma for card display (backward compatible)
 */
export function formatTurmaParaCard(turma: Turma) {
  return {
    id: turma.id,
    nome: turma.nome,
    descricao: getTurmaDescricao(turma, 'card'),
    periodo: turma.periodo,
    duracao: turma.duracao,
    vagas: turma.vagas_disponiveis,
    beneficios: getTurmaBeneficios(turma),
    destaque: turma.destaque || (isTurmaDestaque(turma) ? 'Em destaque' : undefined),
    exibirPeriodo: turma.exibir_periodo ?? true,
    exibirDuracao: turma.exibir_duracao ?? true,
    exibirVagas: turma.exibir_vagas ?? true,
    tipo: turma.tipo,
    modalidade: turma.detalhes?.modalidade,
    cargaHoraria: turma.detalhes?.cargaHoraria,
    nivel: turma.detalhes?.nivel
  };
}

/**
 * Validate robust turma data
 */
export function validarDadosTurma(turma: Partial<Turma | TurmaRobusta>): { valido: boolean; erros: string[] } {
  const erros: string[] = [];
  
  if (!turma.nome?.trim()) {
    erros.push('Nome da turma é obrigatório');
  }
  
  if (!turma.tipo) {
    erros.push('Tipo da turma é obrigatório');
  }

  if ('serieCorrespondente' in turma && !turma.serieCorrespondente) {
    erros.push('Série é obrigatória');
  }
  
  // Validate descriptions length limits
  if (turma.descricoes?.card && turma.descricoes.card.length > 160) {
    erros.push('Descrição do card deve ter no máximo 160 caracteres');
  }
  
  if (turma.descricoes?.resumo && turma.descricoes.resumo.length > 300) {
    erros.push('Resumo deve ter no máximo 300 caracteres');
  }
  
  // Validate visibility dates
  if (turma.visibilidade?.data_inicio_exibicao && turma.visibilidade?.data_fim_exibicao) {
    if (new Date(turma.visibilidade.data_inicio_exibicao) >= new Date(turma.visibilidade.data_fim_exibicao)) {
      erros.push('Data de início deve ser anterior à data de fim da exibição');
    }
  }
  
  return {
    valido: erros.length === 0,
    erros
  };
}
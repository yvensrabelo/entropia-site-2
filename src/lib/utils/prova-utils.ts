/**
 * Utilitários para processamento de provas
 */

/**
 * Detecta se um arquivo é um gabarito baseado no nome
 */
export function isGabarito(filename: string): boolean {
  // Converte para lowercase para comparação case-insensitive
  const normalizedName = filename.toLowerCase();
  
  // Verifica se contém "gabarito" ou "gab" em qualquer parte do nome
  // Usando uma regex simples e direta
  if (/gabarito/i.test(normalizedName) || /\bgab\b/i.test(normalizedName)) {
    // Mas não se também contém "prova" (para evitar falsos positivos)
    if (/prova/i.test(normalizedName) && !/gabarito/i.test(normalizedName)) {
      return false;
    }
    return true;
  }
  
  return false;
}

/**
 * Extrai o nome base da prova removendo indicadores de gabarito
 */
export function extractProvaBaseName(filename: string): string {
  let baseName = filename.replace(/\.pdf$/i, '');
  
  // Remove indicadores de gabarito
  baseName = baseName.replace(/[\-_\s]*gabarito[\-_\s]*/gi, ' ');
  baseName = baseName.replace(/[\-_\s]*gab[\-_\s]*/gi, ' ');
  baseName = baseName.replace(/[\-_\s]*GABARITO[\-_\s]*/g, ' ');
  baseName = baseName.replace(/[\-_\s]*GAB[\-_\s]*/g, ' ');
  
  // Remove espaços extras
  baseName = baseName.replace(/\s+/g, ' ').trim();
  
  return baseName;
}

/**
 * Tenta encontrar o par prova/gabarito baseado em nomes similares
 */
export function findProvaPair(provaName: string, gabaritoName: string): boolean {
  const provaBase = extractProvaBaseName(provaName).toLowerCase();
  const gabaritoBase = extractProvaBaseName(gabaritoName).toLowerCase();
  
  // Se os nomes base são muito similares, provavelmente são par
  const similarity = calculateSimilarity(provaBase, gabaritoBase);
  return similarity > 0.8;
}

/**
 * Calcula similaridade entre duas strings (0-1)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) {
    return 1.0;
  }
  
  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calcula distância de edição entre duas strings
 */
function getEditDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Agrupa arquivos em provas e seus gabaritos
 */
export interface ProvaGroup {
  prova: File;
  gabarito?: File;
  metadata: {
    instituicao: string;
    tipo_prova: string;
    subcategoria?: string | null;
    area?: string | null;
    ano: number;
    etapa: string;
    titulo: string;
  };
}

export function groupProvasAndGabaritos(files: File[]): ProvaGroup[] {
  const provas: File[] = [];
  const gabaritos: File[] = [];
  
  // Separa provas e gabaritos
  files.forEach(file => {
    if (isGabarito(file.name)) {
      gabaritos.push(file);
    } else {
      provas.push(file);
    }
  });
  
  // Agrupa provas com seus gabaritos
  const groups: ProvaGroup[] = provas.map(prova => {
    // Encontra gabarito correspondente
    const gabaritoIndex = gabaritos.findIndex(gab => 
      findProvaPair(prova.name, gab.name)
    );
    
    const gabarito = gabaritoIndex >= 0 ? gabaritos[gabaritoIndex] : undefined;
    
    // Remove gabarito usado da lista
    if (gabaritoIndex >= 0) {
      gabaritos.splice(gabaritoIndex, 1);
    }
    
    return {
      prova,
      gabarito,
      metadata: extractMetadataFromFilename(prova.name)
    };
  });
  
  // Adiciona gabaritos órfãos como provas sem par
  gabaritos.forEach(gabarito => {
    groups.push({
      prova: gabarito,
      gabarito: undefined,
      metadata: extractMetadataFromFilename(gabarito.name)
    });
  });
  
  return groups;
}

/**
 * Extrai metadados do nome do arquivo com padrões específicos
 */
export function extractMetadataFromFilename(filename: string): ProvaGroup['metadata'] {
  const nameWithoutExt = filename.replace(/\.pdf$/i, '');
  
  // Padrões de regex mais específicos para extrair informações
  const patterns = {
    instituicao: /\b(UEA|UFAM|UFRR|UERR|ENEM)\b/i,
    tipo_prova: /\b(PSC|PSI|PSMV|VESTIBULAR|MACRO|SIS|ENEM)\b/i,
    ano: /\b(20\d{2})\b/,
    
    // Padrões específicos para etapas/subcategorias PSC
    psc_etapa: /PSC.*?Etapa[\s\-_]*(I{1,3}|IV|V|[1-5])/i,
    
    // Padrões para SIS
    sis_etapa: /SIS.*?Etapa[\s\-_]*([1-3])/i,
    
    // Padrões para MACRO
    macro_dia: /MACRO.*?DIA[\s\-_]*([12])/i,
    
    // Detecção de áreas MACRO por nome do arquivo
    geral: /\bgeral\b/i,
    biologicas: /biolog|bio(?!grafia)/i,
    humanas: /human|hum(?!ildade)/i,
    exatas: /exata/i,
    conhecimentos_especificos: /\bCE\b|conhecimentos?\s*espec[íi]ficos?|esp(?:ec[íi]ficas?)?[\s-]/i,
    
    // Áreas para MACRO
    area: /\b(BIOLÓGICAS|BIOLOGICAS|HUMANAS|EXATAS)\b/i,
    
    // Padrão geral de etapa
    etapa_geral: /\b(\d+)[ªº]?\s*etapa\b|\betapa\s*(\d+)\b/i
  };

  const metadata: any = {
    instituicao: '',
    tipo_prova: '',
    subcategoria: null,
    area: null,
    ano: new Date().getFullYear(),
    etapa: '',
    titulo: ''
  };

  // Extrai tipo de prova primeiro
  const tipoMatch = nameWithoutExt.match(patterns.tipo_prova);
  if (tipoMatch) {
    metadata.tipo_prova = tipoMatch[1].toUpperCase();
  } else {
    // Se não encontrou tipo explícito, verifica se é MACRO por padrões de área
    if (patterns.geral.test(nameWithoutExt) || 
        patterns.biologicas.test(nameWithoutExt) || 
        patterns.humanas.test(nameWithoutExt) || 
        patterns.exatas.test(nameWithoutExt) ||
        patterns.conhecimentos_especificos.test(nameWithoutExt)) {
      metadata.tipo_prova = 'MACRO';
    }
  }

  // Extrai subcategoria baseada no tipo com padrões específicos
  if (metadata.tipo_prova === 'PSC') {
    const pscMatch = nameWithoutExt.match(patterns.psc_etapa);
    if (pscMatch) {
      const etapaNum = pscMatch[1];
      // Converte romano para número se necessário
      const etapaMap: Record<string, string> = {
        'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5',
        '1': '1', '2': '2', '3': '3', '4': '4', '5': '5'
      };
      const num = etapaMap[etapaNum.toUpperCase()] || etapaNum;
      metadata.subcategoria = `PSC ${num}`;
      metadata.etapa = `${num}ª Etapa`;
    }
  } else if (metadata.tipo_prova === 'SIS') {
    const sisMatch = nameWithoutExt.match(patterns.sis_etapa);
    if (sisMatch) {
      const etapaNum = sisMatch[1];
      metadata.subcategoria = `SIS ${etapaNum}`;
      metadata.etapa = `${etapaNum}ª Etapa`;
    }
  } else if (metadata.tipo_prova === 'MACRO') {
    // Detecta se é GERAL (DIA 1) ou específico por área (DIA 2)
    if (patterns.geral.test(nameWithoutExt)) {
      metadata.subcategoria = 'DIA 1';
    } else if (patterns.biologicas.test(nameWithoutExt)) {
      metadata.subcategoria = 'DIA 2';
      metadata.area = 'BIOLÓGICAS';
    } else if (patterns.humanas.test(nameWithoutExt)) {
      metadata.subcategoria = 'DIA 2';
      metadata.area = 'HUMANAS';
    } else if (patterns.exatas.test(nameWithoutExt)) {
      metadata.subcategoria = 'DIA 2';
      metadata.area = 'EXATAS';
    } else if (patterns.conhecimentos_especificos.test(nameWithoutExt)) {
      // CE ou Conhecimentos Específicos indica DIA 2
      metadata.subcategoria = 'DIA 2';
      
      // Tenta identificar a área específica
      if (patterns.biologicas.test(nameWithoutExt)) {
        metadata.area = 'BIOLÓGICAS';
      } else if (patterns.humanas.test(nameWithoutExt)) {
        metadata.area = 'HUMANAS';
      } else if (patterns.exatas.test(nameWithoutExt)) {
        metadata.area = 'EXATAS';
      }
    } else {
      // Tenta detectar pelo padrão DIA X
      const macroMatch = nameWithoutExt.match(patterns.macro_dia);
      if (macroMatch) {
        const diaNum = macroMatch[1];
        metadata.subcategoria = `DIA ${diaNum}`;
        
        // Se for DIA 2, tenta extrair área
        if (diaNum === '2') {
          const areaMatch = nameWithoutExt.match(patterns.area);
          if (areaMatch) {
            metadata.area = areaMatch[1].toUpperCase().replace('BIOLOGICAS', 'BIOLÓGICAS');
          }
        }
      }
    }
  }

  // Se não conseguiu extrair subcategoria mas há etapa geral, tenta usar
  if (!metadata.etapa) {
    const etapaMatch = nameWithoutExt.match(patterns.etapa_geral);
    if (etapaMatch) {
      const etapaNum = etapaMatch[1] || etapaMatch[2];
      metadata.etapa = `${etapaNum}ª Etapa`;
    }
  }

  // Extrai ou determina instituição
  const instMatch = nameWithoutExt.match(patterns.instituicao);
  if (instMatch) {
    metadata.instituicao = instMatch[1].toUpperCase();
  } else {
    // Verifica se começa com UEA-
    if (/^UEA[-_\s]/i.test(nameWithoutExt)) {
      metadata.instituicao = 'UEA';
    } else {
      // Auto-associa instituição baseada no tipo de prova
      const tipoProva = metadata.tipo_prova;
      if (tipoProva === 'PSC' || tipoProva === 'PSI') {
        metadata.instituicao = 'UFAM';
      } else if (tipoProva === 'MACRO' || tipoProva === 'SIS' || tipoProva === 'PSMV') {
        metadata.instituicao = 'UEA';
      }
    }
  }

  // Extrai ano
  const anoMatch = nameWithoutExt.match(patterns.ano);
  if (anoMatch) {
    metadata.ano = parseInt(anoMatch[1]);
  }

  // Gera título baseado nas informações extraídas
  if (metadata.tipo_prova && metadata.ano) {
    const baseTitle = metadata.subcategoria || metadata.tipo_prova;
    metadata.titulo = `${baseTitle} ${metadata.ano}`;
    
    if (metadata.etapa && metadata.etapa !== 'undefined' && metadata.etapa.trim() !== '') {
      metadata.titulo += ` - ${metadata.etapa}`;
    }
    if (metadata.area && metadata.area !== 'undefined' && metadata.area.trim() !== '') {
      metadata.titulo += ` - ${metadata.area}`;
    }
  } else {
    metadata.titulo = extractProvaBaseName(nameWithoutExt);
  }

  // Garante que subcategoria e area não sejam strings vazias ou undefined
  if (!metadata.subcategoria || metadata.subcategoria.trim() === '') {
    metadata.subcategoria = null;
  }
  if (!metadata.area || metadata.area.trim() === '') {
    metadata.area = null;
  }

  return metadata;
}
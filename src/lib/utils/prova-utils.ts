/**
 * Utilitários para processamento de provas - VERSÃO DEFINITIVA
 * Estrutura completa dos vestibulares brasileiros
 * 
 * TIPOS DE PROVA VÁLIDOS:
 * - PSC (UFAM): etapas 1, 2, 3
 * - PSI: DIA 1, DIA 2 (instituição a definir)  
 * - SIS (UEA): etapas 1, 2, 3
 * - MACRO (UEA): CG (Conhecimentos Gerais) ou áreas (HUMANAS, EXATAS, BIOLÓGICAS)
 * - PSS (UFRR): etapas 1, 2, 3
 * - UERR: fase única
 * - ENEM: DIA 1, DIA 2
 * - OUTROS: instituições não mapeadas
 */

// Tipos de prova válidos - DEFINITIVO
export const EXAM_TYPES = {
  PSC: 'PSC',
  PSI: 'PSI',
  SIS: 'SIS',
  MACRO: 'MACRO',
  PSS: 'PSS',
  UERR: 'UERR',
  ENEM: 'ENEM',
  OUTROS: 'OUTROS'
} as const;

export type ExamType = typeof EXAM_TYPES[keyof typeof EXAM_TYPES];

// Mapeamento de subcategorias por tipo - DEFINITIVO
export const SUBCATEGORY_MAP: Record<ExamType, string[]> = {
  [EXAM_TYPES.PSC]: ['1', '2', '3'],
  [EXAM_TYPES.PSI]: ['DIA 1', 'DIA 2'],
  [EXAM_TYPES.SIS]: ['1', '2', '3'],
  [EXAM_TYPES.MACRO]: ['DIA 1'], // áreas são tratadas separadamente
  [EXAM_TYPES.PSS]: ['1', '2', '3'],
  [EXAM_TYPES.UERR]: ['FASE ÚNICA'],
  [EXAM_TYPES.ENEM]: ['DIA 1', 'DIA 2'],
  [EXAM_TYPES.OUTROS]: ['GERAL']
};

// Áreas específicas para MACRO - DEFINITIVO
export const MACRO_AREAS = ['HUMANAS', 'EXATAS', 'BIOLÓGICAS'] as const;
export type MacroArea = typeof MACRO_AREAS[number];

// Mapeamento instituição → tipo padrão
export const DEFAULT_TYPE_BY_INSTITUTION: Record<string, ExamType> = {
  'UFAM': EXAM_TYPES.PSC,
  'UEA': EXAM_TYPES.SIS,
  'UFRR': EXAM_TYPES.PSS,
  'UERR': EXAM_TYPES.UERR,
  'ENEM': EXAM_TYPES.ENEM
};

/**
 * Detecta se um arquivo é um gabarito baseado no nome
 */
export function isGabarito(filename: string): boolean {
  const normalizedName = filename.toLowerCase();
  
  if (/gabarito/i.test(normalizedName) || /\bgab\b/i.test(normalizedName)) {
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
  
  baseName = baseName.replace(/[\-_\s]*gabarito[\-_\s]*/gi, ' ');
  baseName = baseName.replace(/[\-_\s]*gab[\-_\s]*/gi, ' ');
  baseName = baseName.replace(/[\-_\s]*GABARITO[\-_\s]*/g, ' ');
  baseName = baseName.replace(/[\-_\s]*GAB[\-_\s]*/g, ' ');
  
  baseName = baseName.replace(/\s+/g, ' ').trim();
  
  return baseName;
}

/**
 * Tenta encontrar o par prova/gabarito baseado em nomes similares
 */
export function findProvaPair(provaName: string, gabaritoName: string): boolean {
  const provaBase = extractProvaBaseName(provaName).toLowerCase();
  const gabaritoBase = extractProvaBaseName(gabaritoName).toLowerCase();
  
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
  
  files.forEach(file => {
    if (isGabarito(file.name)) {
      gabaritos.push(file);
    } else {
      provas.push(file);
    }
  });
  
  const groups: ProvaGroup[] = provas.map(prova => {
    const gabaritoIndex = gabaritos.findIndex(gab => 
      findProvaPair(prova.name, gab.name)
    );
    
    const gabarito = gabaritoIndex >= 0 ? gabaritos[gabaritoIndex] : undefined;
    
    if (gabaritoIndex >= 0) {
      gabaritos.splice(gabaritoIndex, 1);
    }
    
    return {
      prova,
      gabarito,
      metadata: extractMetadataFromFilename(prova.name)
    };
  });
  
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
 * VERSÃO DEFINITIVA - PRIORIZA PSI E EVITA CONFLITOS UEA/MACRO
 */
export function extractMetadataFromFilename(filename: string): ProvaGroup['metadata'] {
  console.log('\n╔════════════════════════════════════════════');
  console.log('║ INICIANDO ANÁLISE DO ARQUIVO:', filename);
  console.log('╚════════════════════════════════════════════');
  
  const name = filename.toLowerCase().replace(/\.[^/.]+$/, '');
  const originalName = filename.replace(/\.[^/.]+$/, '');
  const currentYear = new Date().getFullYear();
  
  const metadata: any = {
    instituicao: '',
    tipo_prova: '',
    subcategoria: '',
    area: null,
    ano: currentYear,
    titulo: originalName,
    etapa: ''
  };

  // ======== PRIORIDADE 1: DETECTAR PSI PRIMEIRO! ========
  if (name.includes('psi')) {
    console.log('║ 🎯 DETECTADO COMO PSI');
    metadata.tipo_prova = EXAM_TYPES.PSI;
    // NÃO forçar instituição - deixar vazio para seleção manual
    metadata.instituicao = ''; 
    
    // Detectar DIA 2 ANTES de DIA 1 (ordem importante!)
    if (name.includes('cg-ii') || name.includes('cgii') || 
        name.includes('cg ii') || name.includes('cg_ii') ||
        name.includes('-ii') || name.includes('_ii') || 
        name.includes(' ii') || name.includes('.ii')) {
      metadata.subcategoria = 'DIA 2';
      console.log('║   ✅ PSI DIA 2 detectado');
    }
    else if ((name.includes('cg-i') || name.includes('cgi') || 
             name.includes('cg i') || name.includes('cg_i') ||
             name.includes('-i') || name.includes('_i') || 
             name.includes(' i') || name.includes('.i')) &&
             !name.includes('-ii') && !name.includes('_ii') && !name.includes(' ii')) {
      metadata.subcategoria = 'DIA 1';
      console.log('║   ✅ PSI DIA 1 detectado');
    }
    else {
      // Se não detectar dia específico, assumir DIA 1
      metadata.subcategoria = 'DIA 1';
      console.log('║   ℹ️ PSI sem dia específico - assumindo DIA 1');
    }
    
    // Detectar ano para PSI
    const anoMatch = name.match(/\b(19|20)\d{2}\b|\b\d{2}\b/);
    if (anoMatch) {
      let ano = anoMatch[0];
      if (ano.length === 2) {
        const anoNum = parseInt(ano);
        ano = (anoNum > 50) ? '19' + ano : '20' + ano;
      }
      metadata.ano = parseInt(ano);
      console.log('║   📅 Ano PSI detectado:', metadata.ano);
    }
    
    // Construir título para PSI
    metadata.titulo = metadata.subcategoria;
    if (isGabarito(originalName)) {
      metadata.titulo += ' - Gabarito';
    }
    
    // Retornar IMEDIATAMENTE para PSI - não processar mais nada
    console.log('║ ✅ PROCESSAMENTO PSI COMPLETO:', {
      tipo_prova: metadata.tipo_prova,
      instituicao: metadata.instituicao || '(vazio para seleção manual)',
      subcategoria: metadata.subcategoria,
      titulo: metadata.titulo,
      ano: metadata.ano
    });
    console.log('╚════════════════════════════════════════════');
    return metadata;
  }

  // ======== PRIORIDADE 2: ENEM ========
  if (name.includes('enem')) {
    console.log('║ 🎯 DETECTADO COMO ENEM');
    metadata.instituicao = 'ENEM';
    metadata.tipo_prova = EXAM_TYPES.ENEM;
    
    if (name.includes('dia-1') || name.includes('dia 1') || name.includes('dia1')) {
      metadata.subcategoria = 'DIA 1';
    } else if (name.includes('dia-2') || name.includes('dia 2') || name.includes('dia2')) {
      metadata.subcategoria = 'DIA 2';
    }
  }
  
  // ======== PRIORIDADE 3: MACRO (apenas se NÃO for PSI) ========
  else if ((name.includes('biologica') || name.includes('biológica') ||
            name.includes('humana') || name.includes('exata') ||
            name.includes('geral') || name.includes('cg')) &&
           !name.includes('psi')) { // Dupla verificação - NUNCA para PSI
    console.log('║ 🎯 DETECTADO COMO MACRO (não PSI)');
    metadata.instituicao = 'UEA';
    metadata.tipo_prova = EXAM_TYPES.MACRO;
    
    // Detectar área
    if (name.includes('biologica') || name.includes('biológica')) {
      metadata.area = 'BIOLÓGICAS';
      metadata.titulo = 'Biológicas';
    } else if (name.includes('humana')) {
      metadata.area = 'HUMANAS';
      metadata.titulo = 'Humanas';
    } else if (name.includes('exata')) {
      metadata.area = 'EXATAS';
      metadata.titulo = 'Exatas';
    } else {
      metadata.subcategoria = 'CG';
      metadata.titulo = 'DIA 1';
    }
  }
  
  // ======== DETECTAR OUTRAS INSTITUIÇÕES ========
  else {
    console.log('\n║ === DETECTANDO INSTITUIÇÃO ===');
    if (name.includes('uea')) {
      metadata.instituicao = 'UEA';
      console.log('║ ✓ Detectado: UEA');
    }
    else if (name.includes('ufam')) {
      metadata.instituicao = 'UFAM';
      console.log('║ ✓ Detectado: UFAM');
    }
    else if (name.includes('ufrr')) {
      metadata.instituicao = 'UFRR';
      console.log('║ ✓ Detectado: UFRR');
    }
    else if (name.includes('uerr')) {
      metadata.instituicao = 'UERR';
      console.log('║ ✓ Detectado: UERR');
    }
  }

  // Detectar ano (para todos os tipos exceto PSI que já foi processado)
  const anoMatch = name.match(/\b(19|20)\d{2}\b/);
  if (anoMatch) {
    metadata.ano = parseInt(anoMatch[0]);
    console.log('║ ✓ Ano detectado:', metadata.ano);
  }

  // ======== DETECTAR OUTROS TIPOS (apenas se não foi detectado como PSI/ENEM/MACRO) ========
  if (!metadata.tipo_prova) {
    console.log('\n║ === DETECTANDO TIPO DE PROVA ===');
    
    // === PSC (UFAM) ===
    if (name.includes('psc')) {
      metadata.tipo_prova = EXAM_TYPES.PSC;
      metadata.instituicao = metadata.instituicao || 'UFAM';
      console.log('║ ✓ Tipo: PSC (UFAM)');
      
      // Detectar etapa - ORDEM IMPORTA! III antes de II, II antes de I
      if (name.includes('etapa-iii') || name.includes('etapa iii')) {
        metadata.subcategoria = '3';
      }
      else if (name.includes('etapa-ii') || name.includes('etapa ii')) {
        metadata.subcategoria = '2';
      }
      else if (name.includes('etapa-i') || name.includes('etapa i')) {
        metadata.subcategoria = '1';
      }
      else if (name.match(/psc[-_\s]?3/)) {
        metadata.subcategoria = '3';
      }
      else if (name.match(/psc[-_\s]?2/)) {
        metadata.subcategoria = '2';
      }
      else if (name.match(/psc[-_\s]?1/)) {
        metadata.subcategoria = '1';
      }
      metadata.titulo = `PSC ${metadata.subcategoria || '1'}`;
    }
    
    // === SIS (UEA) ===
    else if (name.includes('sis')) {
      metadata.tipo_prova = EXAM_TYPES.SIS;
      metadata.instituicao = metadata.instituicao || 'UEA';
      console.log('║ ✓ Tipo: SIS (UEA)');
      
      if (name.includes('etapa-iii') || name.includes('etapa iii') || name.includes('sis-iii')) {
        metadata.subcategoria = '3';
      }
      else if (name.includes('etapa-ii') || name.includes('etapa ii') || name.includes('sis-ii')) {
        metadata.subcategoria = '2';
      }
      else if (name.includes('etapa-i') || name.includes('etapa i') || name.includes('sis-i')) {
        metadata.subcategoria = '1';
      }
      metadata.titulo = `SIS ${metadata.subcategoria || '1'}`;
    }
    
    // === PSS (UFRR) ===
    else if (name.includes('pss') || (metadata.instituicao === 'UFRR')) {
      metadata.tipo_prova = EXAM_TYPES.PSS;
      metadata.instituicao = metadata.instituicao || 'UFRR';
      console.log('║ ✓ Tipo: PSS (UFRR)');
      
      if (name.includes('pss-3') || name.includes('pss3') || name.includes('e3')) {
        metadata.subcategoria = '3';
      }
      else if (name.includes('pss-2') || name.includes('pss2') || name.includes('e2')) {
        metadata.subcategoria = '2';
      }
      else {
        metadata.subcategoria = '1';
      }
      metadata.titulo = `PSS ${metadata.subcategoria}`;
    }
    
    // === UERR ===
    else if (metadata.instituicao === 'UERR') {
      metadata.tipo_prova = EXAM_TYPES.UERR;
      metadata.subcategoria = 'FASE ÚNICA';
      metadata.titulo = 'FASE ÚNICA';
      console.log('║ ✓ Tipo: UERR');
    }
    
    // === FALLBACK ===
    else {
      metadata.tipo_prova = EXAM_TYPES.OUTROS;
      metadata.subcategoria = 'GERAL';
      metadata.titulo = metadata.titulo || 'Outros';
    }
  }

  // ======== FINALIZAR TÍTULOS ========
  if (metadata.tipo_prova === 'ENEM') {
    metadata.titulo = metadata.subcategoria || 'DIA 1';
  }
  
  // Adicionar indicador de gabarito
  if (isGabarito(originalName)) {
    metadata.titulo += ' - Gabarito';
  }

  // Fallback final para instituição
  if (!metadata.instituicao) {
    console.log('║ ⚠ AVISO: Arquivo sem instituição detectada');
    metadata.instituicao = 'OUTROS';
  }

  console.log('\n║ === RESULTADO FINAL ===');
  console.log('║ Instituição:', metadata.instituicao || '(vazio)');
  console.log('║ Tipo:', metadata.tipo_prova);
  console.log('║ Subcategoria:', metadata.subcategoria || '(nenhuma)');
  console.log('║ Área:', metadata.area || '(nenhuma)');
  console.log('║ Ano:', metadata.ano);
  console.log('║ Título:', metadata.titulo);
  console.log('╚════════════════════════════════════════════\n');

  return metadata;
}

// Função auxiliar para gerar títulos limpos
function gerarTituloProva(metadata: any): string {
  if (metadata.tipo_prova === 'PSI') {
    const dia = metadata.subcategoria || 'DIA 1';
    return dia;
  }
  
  if (metadata.tipo_prova === 'MACRO') {
    if (metadata.area) {
      return metadata.area.charAt(0).toUpperCase() + metadata.area.slice(1).toLowerCase();
    }
    return metadata.subcategoria === 'CG' ? 'DIA 1' : 'MACRO';
  }
  
  // Para outros tipos, usar o título já definido
  return metadata.titulo || `${metadata.tipo_prova} ${metadata.ano}`;
}
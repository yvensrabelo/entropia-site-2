/**
 * Utilitários para processamento de provas - VERSÃO DEFINITIVA
 * Estrutura completa dos vestibulares brasileiros
 * 
 * TIPOS DE PROVA VÁLIDOS:
 * - PSC (UFAM): etapas 1, 2, 3
 * - PSI (UFAM): DIA 1, DIA 2  
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
 * VERSÃO CORRIGIDA - Reflete estrutura real dos vestibulares
 */
export function extractMetadataFromFilename(filename: string): ProvaGroup['metadata'] {
  const name = filename.toLowerCase().replace('.pdf', '');
  const originalName = filename.replace('.pdf', '');
  
  console.log('\n╔══════════════════════════════════════════');
  console.log('║ PROCESSANDO ARQUIVO');
  console.log('╠══════════════════════════════════════════');
  console.log('║ Nome original:', filename);
  console.log('║ Nome normalizado:', name);
  
  const metadata: any = {
    instituicao: '',
    tipo_prova: '',
    subcategoria: '',
    area: '',
    ano: new Date().getFullYear(),
    titulo: originalName,
    etapa: ''
  };

  // DETECTAR ANO PRIMEIRO
  console.log('\n║ === DETECTANDO ANO ===');
  const anoMatch = name.match(/\b(19|20)\d{2}\b/);
  if (anoMatch) {
    metadata.ano = parseInt(anoMatch[0]);
    console.log('║ ✓ Ano detectado:', metadata.ano);
  }

  // === REGRA PRIORITÁRIA: SE TEM ÁREA, É UEA/MACRO ===
  console.log('\n║ === DETECTANDO ÁREA PRIORITARIAMENTE ===');
  if (name.includes('biologica') || name.includes('biológica') || name.includes('bio')) {
    metadata.instituicao = 'UEA';
    metadata.tipo_prova = EXAM_TYPES.MACRO;
    metadata.area = 'BIOLÓGICAS';
    console.log('║ ✓ PRIORIDADE: UEA/MACRO - BIOLÓGICAS');
  }
  else if (name.includes('humana')) {
    metadata.instituicao = 'UEA';
    metadata.tipo_prova = EXAM_TYPES.MACRO;
    metadata.area = 'HUMANAS';
    console.log('║ ✓ PRIORIDADE: UEA/MACRO - HUMANAS');
  }
  else if (name.includes('exata')) {
    metadata.instituicao = 'UEA';
    metadata.tipo_prova = EXAM_TYPES.MACRO;
    metadata.area = 'EXATAS';
    console.log('║ ✓ PRIORIDADE: UEA/MACRO - EXATAS');
  }
  else if (name.includes('geral') || name.includes('cg') || name.includes('conhecimentos gerais')) {
    metadata.instituicao = 'UEA';
    metadata.tipo_prova = EXAM_TYPES.MACRO;
    metadata.subcategoria = 'CG';
    metadata.area = null;
    console.log('║ ✓ PRIORIDADE: UEA/MACRO - DIA 1 (CG)');
  }
  else {
    // DETECTAR INSTITUIÇÃO APENAS SE NÃO FOI DETECTADA ÁREA
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
    else if (name.includes('enem')) {
      metadata.instituicao = 'ENEM';
      console.log('║ ✓ Detectado: ENEM');
    }
  }

  // ========================================
  // DETECTAR TIPO DE PROVA - ESTRUTURA REAL
  // ========================================
  
  console.log('\n║ === DETECTANDO TIPO DE PROVA ===');
  
  // SE JÁ FOI DETECTADO COMO MACRO POR ÁREA, PULAR DETECÇÃO
  if (metadata.tipo_prova === EXAM_TYPES.MACRO) {
    console.log('║ ✓ Tipo já detectado: MACRO (por área)');
  }
  // === PSI (UFAM) - DETECTAR PRIMEIRO ===
  else if (name.includes('psi')) {
    metadata.tipo_prova = EXAM_TYPES.PSI;
    metadata.instituicao = metadata.instituicao || 'UFAM';
    console.log('║ ✓ Tipo: PSI (UFAM)');
    
    // IMPORTANTE: Detectar CG-II ANTES de CG-I para evitar falso positivo!
    if (name.includes('cg-ii') || name.includes('cgii') || name.includes('cg ii')) {
      metadata.subcategoria = 'DIA 2';
      console.log('║   → Detectado CG-II como DIA 2');
    }
    else if (name.includes('cg-i') || name.includes('cgi') || name.includes('cg i')) {
      metadata.subcategoria = 'DIA 1';
      console.log('║   → Detectado CG-I como DIA 1');
    }
    // Alternativas com "dia"
    else if (name.includes('dia-2') || name.includes('dia 2')) {
      metadata.subcategoria = 'DIA 2';
    }
    else if (name.includes('dia-1') || name.includes('dia 1')) {
      metadata.subcategoria = 'DIA 1';
    }
    
    console.log('║   → Dia:', metadata.subcategoria || 'não identificado');
  }
  
  // === PSC (UFAM) ===
  else if (name.includes('psc')) {
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
    // Padrões com números
    else if (name.match(/psc[-_\s]?3/)) {
      metadata.subcategoria = '3';
    }
    else if (name.match(/psc[-_\s]?2/)) {
      metadata.subcategoria = '2';
    }
    else if (name.match(/psc[-_\s]?1/)) {
      metadata.subcategoria = '1';
    }
    console.log('║   → Etapa:', metadata.subcategoria || 'não identificada');
  }
  
  // === UEA: SIS e MACRO ===
  else if (name.includes('sis')) {
    metadata.tipo_prova = EXAM_TYPES.SIS;
    metadata.instituicao = metadata.instituicao || 'UEA';
    console.log('║ ✓ Tipo: SIS (UEA)');
    
    // ORDEM IMPORTA! III antes de II, II antes de I
    if (name.includes('etapa-iii') || name.includes('etapa iii')) {
      metadata.subcategoria = '3';
    }
    else if (name.includes('etapa-ii') || name.includes('etapa ii')) {
      metadata.subcategoria = '2';
    }
    else if (name.includes('etapa-i') || name.includes('etapa i')) {
      metadata.subcategoria = '1';
    }
    // Padrão: SIS-III-, SIS-II-, SIS-I-
    else if (name.includes('sis-iii') || name.includes('-sis-iii-')) {
      metadata.subcategoria = '3';
    }
    else if (name.includes('sis-ii') || name.includes('-sis-ii-')) {
      metadata.subcategoria = '2';
    }
    else if (name.includes('sis-i') || name.includes('-sis-i-')) {
      metadata.subcategoria = '1';
    }
    // Padrão: SIS-3, SIS-2, SIS-1
    else if (name.match(/sis[-_\s]?3/)) {
      metadata.subcategoria = '3';
    }
    else if (name.match(/sis[-_\s]?2/)) {
      metadata.subcategoria = '2';
    }
    else if (name.match(/sis[-_\s]?1/)) {
      metadata.subcategoria = '1';
    }
    console.log('║   → Etapa:', metadata.subcategoria || 'não identificada');
  }
  
  // === LÓGICA ESPECIAL PARA UEA/MACRO ===
  // CE, ESP, MACRO, VESTIBULAR da UEA → tudo vira MACRO
  else if ((metadata.instituicao === 'UEA' || name.includes('uea')) && 
           (name.includes('ce-') || name.includes('ce ') || 
            name.includes('esp-') || name.includes('esp ') || name.includes('especifica') ||
            name.includes('vestibular') || name.includes('vest') || name.includes('macro'))) {
    
    metadata.tipo_prova = EXAM_TYPES.MACRO;
    metadata.instituicao = 'UEA';
    console.log('║ ✓ Tipo: MACRO (UEA - por palavra-chave)');
    
    // Se não tem área detectada, tentar detectar aqui
    if (!metadata.area && !metadata.subcategoria) {
      if (name.includes('biologica') || name.includes('biológica')) {
        metadata.area = 'BIOLÓGICAS';
      } else if (name.includes('humana')) {
        metadata.area = 'HUMANAS';
      } else if (name.includes('exata')) {
        metadata.area = 'EXATAS';
      } else {
        metadata.subcategoria = 'CG';
      }
      console.log('║   → Detectado:', metadata.area || metadata.subcategoria);
    }
  }
  
  // === UFRR: PSS ===
  else if (name.includes('pss') || (metadata.instituicao === 'UFRR' && name.match(/\be[123]\b/))) {
    metadata.tipo_prova = EXAM_TYPES.PSS;
    metadata.instituicao = metadata.instituicao || 'UFRR';
    console.log('║ ✓ Tipo: PSS (UFRR)');
    
    // Detectar etapa
    if (name.includes('pss-1') || name.includes('pss1') || name.includes('e1')) {
      metadata.subcategoria = '1';
    }
    else if (name.includes('pss-2') || name.includes('pss2') || name.includes('e2')) {
      metadata.subcategoria = '2';
    }
    else if (name.includes('pss-3') || name.includes('pss3') || name.includes('e3')) {
      metadata.subcategoria = '3';
    }
    console.log('║   → Etapa:', metadata.subcategoria || 'não identificada');
  }
  
  // === UERR: TIPO UERR ===
  else if (metadata.instituicao === 'UERR') {
    metadata.tipo_prova = EXAM_TYPES.UERR;
    metadata.subcategoria = 'FASE ÚNICA';
    console.log('║ ✓ Tipo: UERR');
  }
  
  // === ENEM ===
  else if (name.includes('enem')) {
    metadata.tipo_prova = EXAM_TYPES.ENEM;
    metadata.instituicao = 'ENEM';
    console.log('║ ✓ Tipo: ENEM');
    
    if (name.includes('dia-1') || name.includes('dia 1')) {
      metadata.subcategoria = 'DIA 1';
    } else if (name.includes('dia-2') || name.includes('dia 2')) {
      metadata.subcategoria = 'DIA 2';
    }
  }
  
  // === FALLBACK: Se não detectou tipo mas tem instituição ===
  else if (metadata.instituicao && !metadata.tipo_prova) {
    metadata.tipo_prova = DEFAULT_TYPE_BY_INSTITUTION[metadata.instituicao] || EXAM_TYPES.OUTROS;
    console.log('║ ⚠ Tipo inferido pela instituição:', metadata.tipo_prova);
    
    // Se é UERR, definir subcategoria padrão
    if (metadata.tipo_prova === EXAM_TYPES.UERR) {
      metadata.subcategoria = 'FASE ÚNICA';
    }
  }

  // ========================================
  // CONSTRUIR TÍTULO LIMPO
  // ========================================
  if (metadata.tipo_prova) {
    let titulo = '';
    
    // Para PSC, SIS, PSS - mostrar número
    if (['PSC', 'SIS', 'PSS'].includes(metadata.tipo_prova) && metadata.subcategoria) {
      titulo = `${metadata.tipo_prova} ${metadata.subcategoria}`;
    }
    // Para PSI - mostrar DIA
    else if (metadata.tipo_prova === 'PSI' && metadata.subcategoria) {
      titulo = metadata.subcategoria; // Já vem como "DIA 1" ou "DIA 2"
    }
    // Para MACRO
    else if (metadata.tipo_prova === 'MACRO') {
      if (metadata.subcategoria === 'CG') {
        titulo = 'DIA 1';
      } else if (metadata.area) {
        titulo = metadata.area.charAt(0).toUpperCase() + metadata.area.slice(1).toLowerCase();
      } else {
        titulo = 'MACRO';
      }
    }
    // ENEM
    else if (metadata.tipo_prova === 'ENEM' && metadata.subcategoria) {
      titulo = metadata.subcategoria;
    }
    // UERR
    else if (metadata.tipo_prova === 'UERR') {
      titulo = 'FASE ÚNICA';
    }
    // Outros tipos
    else {
      titulo = metadata.tipo_prova;
      if (metadata.subcategoria && metadata.subcategoria !== 'GERAL') {
        titulo += ` ${metadata.subcategoria}`;
      }
    }
    
    metadata.titulo = titulo.trim();
  } else {
    // Para OUTROS, limpar o nome
    let titulo = originalName;
    titulo = titulo.replace(/\d{4}/g, ''); // Remove ano
    titulo = titulo.replace(/[-_]?(Prova|Gabarito)$/i, ''); // Remove sufixo
    titulo = titulo.trim();
    metadata.titulo = titulo || 'Outros';
  }

  // Adicionar indicador de gabarito
  if (isGabarito(originalName)) {
    metadata.titulo += ' - Gabarito';
  }

  // Converter strings vazias em null
  if (!metadata.subcategoria || metadata.subcategoria.trim() === '') {
    metadata.subcategoria = null;
  }
  if (!metadata.area || metadata.area.trim() === '') {
    metadata.area = null;
  }

  // Fallback final para instituição
  if (!metadata.instituicao) {
    console.log('║ ⚠ AVISO: Arquivo sem instituição detectada');
    metadata.instituicao = 'OUTROS';
  }

  // Fallback final para tipo
  if (!metadata.tipo_prova) {
    console.log('║ ⚠ AVISO: Arquivo sem tipo detectado');
    metadata.tipo_prova = EXAM_TYPES.OUTROS;
    metadata.subcategoria = 'GERAL';
  }

  console.log('\n║ === RESULTADO FINAL ===');
  console.log('║ Instituição:', metadata.instituicao);
  console.log('║ Tipo:', metadata.tipo_prova);
  console.log('║ Subcategoria:', metadata.subcategoria || '(nenhuma)');
  console.log('║ Área:', metadata.area || '(nenhuma)');
  console.log('║ Ano:', metadata.ano);
  console.log('║ Título:', metadata.titulo);
  console.log('╚══════════════════════════════════════════\n');

  return metadata;
}

// TESTES TEMPORÁRIOS - REMOVER EM PRODUÇÃO
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log('=== TESTES DE DETECÇÃO DE NÚMEROS ROMANOS E PSI ===');
  
  // Testes PSC
  console.log('PSC-2016-Etapa-III-Prova.pdf:', extractMetadataFromFilename('PSC-2016-Etapa-III-Prova.pdf'));
  // Esperado: { tipo_prova: 'PSC', subcategoria: '3', titulo: 'PSC 3' }
  
  console.log('PSC-2013-Etapa-II-Gabarito.pdf:', extractMetadataFromFilename('PSC-2013-Etapa-II-Gabarito.pdf'));
  // Esperado: { tipo_prova: 'PSC', subcategoria: '2', titulo: 'PSC 2 - Gabarito' }
  
  console.log('PSC-2015-Etapa-I-Prova.pdf:', extractMetadataFromFilename('PSC-2015-Etapa-I-Prova.pdf'));
  // Esperado: { tipo_prova: 'PSC', subcategoria: '1', titulo: 'PSC 1' }
  
  // Testes SIS
  console.log('UEA-2024-SIS-III-Prova.pdf:', extractMetadataFromFilename('UEA-2024-SIS-III-Prova.pdf'));
  // Esperado: { tipo_prova: 'SIS', subcategoria: '3', titulo: 'SIS 3' }
  
  console.log('UEA-2023-SIS-II-Gabarito.pdf:', extractMetadataFromFilename('UEA-2023-SIS-II-Gabarito.pdf'));
  // Esperado: { tipo_prova: 'SIS', subcategoria: '2', titulo: 'SIS 2 - Gabarito' }
  
  // Testes PSI - IMPORTANTE!
  console.log('\n=== TESTES PSI CG-I e CG-II ===');
  console.log('PSI-19-Prova-CG-II.pdf:', extractMetadataFromFilename('PSI-19-Prova-CG-II.pdf'));
  // Esperado: { tipo_prova: 'PSI', subcategoria: 'DIA 2', titulo: 'DIA 2' }
  
  console.log('PSI-19-Prova-CG-I.pdf:', extractMetadataFromFilename('PSI-19-Prova-CG-I.pdf'));
  // Esperado: { tipo_prova: 'PSI', subcategoria: 'DIA 1', titulo: 'DIA 1' }
  
  console.log('PSI-2024-DIA-1-Prova.pdf:', extractMetadataFromFilename('PSI-2024-DIA-1-Prova.pdf'));
  // Esperado: { tipo_prova: 'PSI', subcategoria: 'DIA 1', titulo: 'DIA 1' }
}
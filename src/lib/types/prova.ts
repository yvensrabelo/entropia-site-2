export interface Prova {
  id: string;
  instituicao: string;
  tipo_prova: string;
  ano: number;
  etapa?: string;
  titulo: string;
  descricao?: string;
  url_pdf?: string | null;
  url_gabarito?: string;
  is_gabarito?: boolean;
  tags?: string[];
  visualizacoes: number;
  subcategoria?: string;
  area?: string;
  created_at: string;
  updated_at: string;
}

export type Instituicao = 'UEA' | 'UFAM' | 'UFRR' | 'UERR' | 'ENEM' | 'OUTROS';
export type TipoProva = 'PSC' | 'PSI' | 'PSMV' | 'VESTIBULAR' | 'MACRO' | 'SIS' | 'ENEM';

// Subcategorias por tipo de prova
export const SUBCATEGORIAS: Record<string, string[]> = {
  PSC: ['PSC 1', 'PSC 2', 'PSC 3'],
  SIS: ['SIS 1', 'SIS 2', 'SIS 3'],
  MACRO: ['DIA 1', 'DIA 2']
};

// Áreas para MACRO DIA 2
export const AREAS_MACRO = ['BIOLÓGICAS', 'HUMANAS', 'EXATAS'];

// Tipo para dados do formulário
export interface ProvaFormData {
  instituicao: string;
  tipo_prova: string;
  subcategoria?: string;
  area?: string;
  ano: number;
  etapa?: string;
  titulo: string;
  descricao?: string;
  tags?: string;
}

// Função para validar se uma subcategoria é válida para um tipo
export function isValidSubcategoria(tipo: string, subcategoria: string): boolean {
  const validSubcategorias = SUBCATEGORIAS[tipo];
  return validSubcategorias ? validSubcategorias.includes(subcategoria) : false;
}

// Função para validar se uma área é válida para MACRO DIA 2
export function isValidArea(tipo: string, subcategoria: string, area: string): boolean {
  if (tipo === 'MACRO' && subcategoria === 'DIA 2') {
    return AREAS_MACRO.includes(area);
  }
  return false;
}
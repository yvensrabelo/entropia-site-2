export interface Prova {
  id: string;
  instituicao: string;
  tipo_prova: string;
  ano: number;
  etapa?: string;
  titulo: string;
  descricao?: string;
  url_pdf: string;
  url_gabarito?: string;
  tags?: string[];
  visualizacoes: number;
  created_at: string;
  updated_at: string;
}

export type Instituicao = 'UEA' | 'UFAM' | 'UFRR' | 'UERR' | 'ENEM' | 'OUTROS';
export type TipoProva = 'PSC' | 'PSI' | 'PSMV' | 'VESTIBULAR' | 'MACRO' | 'SIS' | 'ENEM';
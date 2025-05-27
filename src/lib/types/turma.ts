export type TipoTurma = 'intensivo_psc' | 'enem_total' | 'sis_macro';

export interface Turma {
  id: string;
  nome: string;
  descricao: string;
  periodo?: string;
  duracao?: string;
  vagas_disponiveis?: number;
  tipo: TipoTurma;
  diferenciais: string[];
  destaque?: string;
  exibir_periodo?: boolean;
  exibir_duracao?: boolean;
  exibir_vagas?: boolean;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface TurmaFormData {
  nome: string;
  descricao: string;
  periodo?: string;
  duracao?: string;
  vagas_disponiveis?: number;
  tipo: TipoTurma;
  diferenciais: string[];
  destaque?: string;
  exibir_periodo?: boolean;
  exibir_duracao?: boolean;
  exibir_vagas?: boolean;
  ativo: boolean;
  ordem?: number;
}

export const tipoTurmaLabels: Record<TipoTurma, string> = {
  intensivo_psc: 'PSC Intensivo',
  enem_total: 'ENEM Total',
  sis_macro: 'SIS/MACRO'
};

export const tipoTurmaColors: Record<TipoTurma, string> = {
  intensivo_psc: 'bg-blue-100 text-blue-800',
  enem_total: 'bg-green-100 text-green-800',
  sis_macro: 'bg-purple-100 text-purple-800'
};
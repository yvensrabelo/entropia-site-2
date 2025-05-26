export interface TurmaConfig {
  id: string;
  codigo: string;
  nome: string;
  turno: 'MATUTINO' | 'VESPERTINO' | 'NOTURNO';
  capacidade_maxima: number;
  vagas_ocupadas: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export type Turno = 'MATUTINO' | 'VESPERTINO' | 'NOTURNO';

export const TURNOS: Record<Turno, string> = {
  MATUTINO: 'Matutino',
  VESPERTINO: 'Vespertino',
  NOTURNO: 'Noturno'
};
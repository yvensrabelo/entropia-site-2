import { Aluno } from './aluno';
import { Matricula } from './matricula';

export interface Presenca {
  id: string;
  aluno_id: string;
  matricula_id?: string;
  data_hora: string;
  origem: 'catraca' | 'manual';
  criado_em: string;
  // Relações
  aluno?: Aluno;
  matricula?: Matricula;
}

export type OrigemPresenca = 'catraca' | 'manual';

export const ORIGEM_LABELS: Record<OrigemPresenca, string> = {
  catraca: 'Catraca',
  manual: 'Manual'
};
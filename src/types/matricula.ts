import { Aluno } from './aluno';
import { TurmaConfig } from './turma';

export type StatusMatricula = 'pendente' | 'aprovada' | 'confirmada' | 'ativa' | 'trancada' | 'cancelada';

export interface Matricula {
  id: string;
  aluno_id: string;
  turma_id: string;
  status: StatusMatricula;
  data_pre_matricula: string;
  data_matricula_confirmada?: string;
  data_status_alterado: string;
  asaas_customer_id?: string;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
  // Relações
  aluno?: Aluno;
  turma?: TurmaConfig;
}

export const STATUS_LABELS: Record<StatusMatricula, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  confirmada: 'Confirmada',
  ativa: 'Ativa',
  trancada: 'Trancada',
  cancelada: 'Cancelada'
};

export const STATUS_COLORS: Record<StatusMatricula, string> = {
  pendente: 'bg-yellow-100 text-yellow-800',
  aprovada: 'bg-blue-100 text-blue-800',
  confirmada: 'bg-green-100 text-green-800',
  ativa: 'bg-green-100 text-green-800',
  trancada: 'bg-gray-100 text-gray-800',
  cancelada: 'bg-red-100 text-red-800'
};
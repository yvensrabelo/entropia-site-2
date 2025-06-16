export interface TurmaConfig {
  codigo: string;
  nome: string;
  turno: 'Matutino' | 'Vespertino' | 'Noturno';
  vagas: number;
  ocupacao: number;
  ativa: boolean;
}

export const TURMAS_CONFIG = {
  turmas: [
    { codigo: 'INTENSIVA', nome: 'INTENSIVA', turno: 'Vespertino' as const, vagas: 40, ocupacao: 0, ativa: true },
    { codigo: 'T1-MAT1', nome: 'EXTENSIVA MATUTINA 1', turno: 'Matutino' as const, vagas: 45, ocupacao: 34, ativa: true },
    { codigo: 'T1-NOT1', nome: 'EXTENSIVA NOTURNA 1', turno: 'Noturno' as const, vagas: 45, ocupacao: 36, ativa: true },
    { codigo: 'T1-VESP1', nome: 'EXTENSIVA VESPERTINA 1', turno: 'Vespertino' as const, vagas: 45, ocupacao: 39, ativa: true },
    { codigo: 'T1-SIS1', nome: 'TURMA SIS/PSC 1', turno: 'Vespertino' as const, vagas: 45, ocupacao: 8, ativa: true },
    { codigo: 'T1-SIS2', nome: 'TURMA SIS/PSC 2', turno: 'Vespertino' as const, vagas: 45, ocupacao: 20, ativa: true },
    { codigo: 'T2-MAT2', nome: 'EXTENSIVA MATUTINA 2', turno: 'Matutino' as const, vagas: 45, ocupacao: 27, ativa: true },
    { codigo: 'T2-VESP2', nome: 'EXTENSIVA VESPERTINA 2', turno: 'Vespertino' as const, vagas: 45, ocupacao: 29, ativa: true }
  ] as TurmaConfig[]
};

// Compatibility with previous implementation
export const TURMAS_REAIS = TURMAS_CONFIG.turmas;

// Função helper para obter lista de nomes das turmas
export const getTurmasNomes = (): string[] => {
  return TURMAS_CONFIG.turmas.filter(t => t.ativa).map(t => t.nome);
};

// Função para obter turma por código
export const getTurmaByCodigo = (codigo: string): TurmaConfig | undefined => {
  return TURMAS_CONFIG.turmas.find(t => t.codigo === codigo);
};

// Função para obter turma por nome
export const getTurmaByNome = (nome: string): TurmaConfig | undefined => {
  return TURMAS_CONFIG.turmas.find(t => t.nome === nome);
};
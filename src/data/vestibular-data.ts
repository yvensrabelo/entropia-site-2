// Dados de referência para os processos seletivos

export const PROCESSOS = ['PSC', 'MACRO', 'SIS', 'ENEM'] as const;
export type Processo = typeof PROCESSOS[number];

export const CURSOS = [
  'Medicina', 
  'Direito', 
  'Engenharia', 
  'Psicologia', 
  'Pedagogia', 
  'Licenciaturas'
] as const;
export type Curso = typeof CURSOS[number];

// Cotas disponíveis por processo
export const COTAS_POR_PROCESSO: Record<Processo, string[]> = {
  PSC: ['AC', 'PP1', 'PP2', 'IND1', 'IND2', 'QLB1', 'QLB2', 'PCD1', 'PCD2', 'NDC1', 'NDC2'],
  MACRO: ['AC', 'Escola Pública', 'Negros', 'Indígenas', 'PCD'],
  SIS: ['AC', 'Escola Pública', 'PPI', 'PCD', 'Indígenas'],
  ENEM: ['AC', 'Escola Pública', 'PPI', 'PCD'],
};

// Descrições das cotas
export const DESCRICOES_COTA: Record<string, string> = {
  AC: 'Ampla Concorrência',
  PP1: 'Escola Pública + PPI + Baixa Renda',
  PP2: 'Escola Pública + PPI',
  IND1: 'Escola Pública + Indígena + Baixa Renda',
  IND2: 'Escola Pública + Indígena',
  QLB1: 'Escola Pública + Quilombola + Baixa Renda',
  QLB2: 'Escola Pública + Quilombola',
  PCD1: 'Escola Pública + PCD + Baixa Renda',
  PCD2: 'Escola Pública + PCD',
  NDC1: 'Escola Pública + Baixa Renda',
  NDC2: 'Escola Pública',
  'Escola Pública': 'Escola Pública',
  'Negros': 'Negros/Pardos',
  'Indígenas': 'Indígenas',
  'PCD': 'Pessoa com Deficiência',
  'PPI': 'Pretos, Pardos e Indígenas'
};

// Campos de nota por processo
export interface CampoNota {
  label: string;
  min: number;
  max: number;
}

export const CAMPOS_POR_PROCESSO: Record<Processo, CampoNota[]> = {
  PSC: [
    { label: 'PSC 1', min: 0, max: 54 },
    { label: 'PSC 2', min: 0, max: 54 },
    { label: 'PSC 3', min: 0, max: 54 },
    { label: 'Redação', min: 0, max: 9 },
  ],
  MACRO: [
    { label: 'Conhecimentos Gerais', min: 0, max: 100 },
    { label: 'Conhecimentos Específicos', min: 0, max: 100 },
    { label: 'Redação', min: 0, max: 100 },
  ],
  SIS: [
    { label: 'SIS 1', min: 0, max: 60 },
    { label: 'SIS 2', min: 0, max: 60 },
    { label: 'Redação SIS 2', min: 0, max: 10 },
    { label: 'SIS 3', min: 0, max: 60 },
    { label: 'Redação SIS 3', min: 0, max: 10 },
  ],
  ENEM: [
    { label: 'Linguagens', min: 0, max: 1000 },
    { label: 'Humanas', min: 0, max: 1000 },
    { label: 'Natureza', min: 0, max: 1000 },
    { label: 'Matemática', min: 0, max: 1000 },
    { label: 'Redação', min: 0, max: 1000 },
  ],
};

// Importar notas de corte do arquivo JSON
import notasDeCorteJson from './notas-corte.json';

// Notas de corte
export type NotasDeCorte = Record<string, Record<Curso, number>>;

// Fazer type assertion para garantir que o JSON tem o formato correto
export const NOTAS_DE_CORTE = notasDeCorteJson as Record<Processo, NotasDeCorte>;

// Referências de estudo
export interface ReferenciasEstudo {
  titulo: string;
  tempo: string;
  assuntos: string[];
}

export const REFERENCIAS_ESTUDO: ReferenciasEstudo[] = [
  {
    titulo: "Reforço em Matemática",
    tempo: "2h/dia",
    assuntos: ["Álgebra", "Geometria", "Trigonometria", "Estatística"]
  },
  {
    titulo: "Redação Intensiva",
    tempo: "1h/dia",
    assuntos: ["Argumentação", "Coesão", "Proposta de Intervenção", "Repertório Cultural"]
  },
  {
    titulo: "Revisão de Humanas",
    tempo: "1.5h/dia",
    assuntos: ["História do Brasil", "Geografia", "Filosofia", "Sociologia"]
  },
  {
    titulo: "Ciências da Natureza",
    tempo: "2h/dia",
    assuntos: ["Física Mecânica", "Química Orgânica", "Biologia Celular", "Ecologia"]
  },
  {
    titulo: "Simulados Semanais",
    tempo: "4h/semana",
    assuntos: ["Questões anteriores", "Tempo de prova", "Estratégias", "Revisão de erros"]
  }
];
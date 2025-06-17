export type TipoTurma = 'intensivo_psc' | 'enem_total' | 'sis_macro';

// Interfaces for the robust description system
export interface TurmaDescricoes {
  card?: string;      // Descrição breve para cards (até 160 caracteres)
  resumo?: string;    // Resumo médio (até 300 caracteres)
  completa?: string;  // Descrição completa sem limite
  slogan?: string;    // Frase de impacto ou chamada
}

export interface TurmaBeneficios {
  principais?: string[];   // Lista de benefícios principais
  secundarios?: string[];  // Benefícios adicionais
  icones?: Array<{        // Benefícios com ícones
    icone: string;
    texto: string;
    destaque?: boolean;
  }>;
}

export interface TurmaDetalhes {
  cargaHoraria?: string;
  duracao?: string;
  modalidade?: 'presencial' | 'online' | 'hibrido';
  publicoAlvo?: string;
  prerequisitos?: string[];
  materialIncluso?: boolean;
  certificado?: boolean;
  nivel?: 'basico' | 'intermediario' | 'avancado';
}

export interface TurmaInformacoes {
  proxima_turma?: string;
  promocao?: string;
  inscricoes_abertas?: boolean;
  desconto_ativo?: {
    percentual: number;
    valido_ate: Date;
    codigo?: string;
  };
  bonus?: string[];
  depoimentos?: Array<{
    nome: string;
    texto: string;
    nota?: number;
    data?: Date;
  }>;
}

export interface TurmaSEO {
  meta_description?: string;
  keywords?: string[];
  og_image?: string;
  schema_type?: 'Course' | 'EducationalProgram';
  landing_page?: string;
}

export interface TurmaVisibilidade {
  exibir_home?: boolean;
  exibir_catalogo?: boolean;
  destacar?: boolean;
  ordem_destaque?: number;
  data_inicio_exibicao?: Date;
  data_fim_exibicao?: Date;
  mostrarPreco?: boolean;
  mostrarVagas?: boolean;
  mostrarHorarios?: boolean;
  mostrarBeneficios?: boolean;
  destaque?: boolean;
}

// Interface simplificada para o sistema de turmas
export interface TurmaSimples {
  id: string;
  nome: string;
  foco: string;
  serie: '1' | '2' | '3' | 'formado';
  beneficios: Array<{
    texto: string;
    destaquePlatinado: boolean;
  }>;
  ativa?: boolean; // Para controle interno
  // NOVOS CAMPOS PARA VALOR E DURAÇÃO
  precoMensal: number;
  duracaoMeses: number;
}

// Interface for the robust admin turmas (DEPRECATED - mantido para compatibilidade)
export interface TurmaRobusta {
  id: string;
  nome: string;
  tipo: 'psc' | 'enem' | 'intensivo' | 'militar' | 'sis' | 'macro';
  turno: 'manhã' | 'tarde' | 'noite';
  preco: number;
  ativa: boolean;
  destaque: boolean;
  ordem: number;
  cor: string;
  serieCorrespondente?: '1' | '2' | '3' | 'formado';
  descricoes: TurmaDescricoes;
  beneficios: TurmaBeneficios;
  detalhes: TurmaDetalhes;
  informacoes?: TurmaInformacoes;
  seo?: TurmaSEO;
  visibilidade: TurmaVisibilidade;
}

export interface TurmaRobustaFormData {
  nome: string;
  tipo: 'psc' | 'enem' | 'intensivo' | 'militar' | 'sis' | 'macro';
  turno: 'manhã' | 'tarde' | 'noite';
  preco: number;
  ativa: boolean;
  destaque: boolean;
  ordem: number;
  cor: string;
  serieCorrespondente?: '1' | '2' | '3' | 'formado';
  descricoes: TurmaDescricoes;
  beneficios: TurmaBeneficios;
  detalhes: TurmaDetalhes;
  informacoes?: TurmaInformacoes;
  seo?: TurmaSEO;
  visibilidade: TurmaVisibilidade;
}

export interface Turma {
  id: string;
  nome: string;
  descricao: string;  // Mantido para compatibilidade
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
  
  // Novos campos do sistema robusto
  descricoes?: TurmaDescricoes;
  beneficios?: TurmaBeneficios;
  detalhes?: TurmaDetalhes;
  informacoes?: TurmaInformacoes;
  seo?: TurmaSEO;
  visibilidade?: TurmaVisibilidade;
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
  
  // Novos campos opcionais do sistema robusto
  descricoes?: TurmaDescricoes;
  beneficios?: TurmaBeneficios;
  detalhes?: TurmaDetalhes;
  informacoes?: TurmaInformacoes;
  seo?: TurmaSEO;
  visibilidade?: TurmaVisibilidade;
}

// Interface for the turma_cards table (Descomplica-style cards)
export interface TurmaCard {
  id: string;
  turma_id: string;
  title?: string;
  subtitle?: string;
  package_title?: string;
  main_title?: string;
  description?: string;
  plans?: Array<{
    name: string;
    price?: string;
    features?: string[];
    highlighted?: boolean;
  }>;
  benefits?: string[];
  cta_text?: string;
  gradient?: string;
  order_index: number;
  featured: boolean;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface TurmaCardFormData {
  title?: string;
  subtitle?: string;
  package_title?: string;
  main_title?: string;
  description?: string;
  plans?: Array<{
    name: string;
    price?: string;
    features?: string[];
    highlighted?: boolean;
  }>;
  benefits?: string[];
  cta_text?: string;
  gradient?: string;
  order_index?: number;
  featured?: boolean;
  visible?: boolean;
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
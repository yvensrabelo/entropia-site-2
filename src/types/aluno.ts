export interface Aluno {
  id: string;
  nome: string;
  cpf: string;
  telefone?: string;
  email?: string;
  data_nascimento?: string;
  endereco?: string;
  nome_responsavel?: string;
  telefone_responsavel?: string;
  cpf_responsavel?: string;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
  // Campos de endereço separados
  cep?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  numero?: string;
  complemento?: string;
  // Controle de documentação
  contrato_entregue?: boolean;
  data_entrega_contrato?: string;
}

export interface AlunoFormData {
  nome: string;
  cpf: string;
  telefone?: string;
  email?: string;
  data_nascimento?: string;
  endereco?: string;
  nome_responsavel?: string;
  telefone_responsavel?: string;
  cpf_responsavel?: string;
  observacoes?: string;
}
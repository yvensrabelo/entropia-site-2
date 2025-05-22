import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Verificar se as credenciais estão válidas
const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && supabaseAnonKey !== 'placeholder-key'

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

// Types para o banco de dados
export interface Usuario {
  id: string
  nome: string
  cpf: string
  email: string
  telefone?: string
  turma: string
  situacao: 'ativo' | 'inativo' | 'trancado'
  data_matricula: string
  created_at: string
  updated_at: string
}

export interface Presenca {
  id: string
  usuario_id: string
  data_aula: string
  disciplina: string
  professor: string
  presente: boolean
  justificativa?: string
  created_at: string
}

export interface Nota {
  id: string
  usuario_id: string
  disciplina: string
  tipo_avaliacao: 'simulado' | 'prova' | 'trabalho' | 'exercicio'
  nota: number
  nota_maxima: number
  data_aplicacao: string
  observacoes?: string
  created_at: string
}

export interface Financeiro {
  id: string
  usuario_id: string
  tipo: 'mensalidade' | 'material' | 'taxa'
  valor: number
  vencimento: string
  status: 'pendente' | 'pago' | 'vencido'
  descricao: string
  created_at: string
  data_pagamento?: string
}

export interface Material {
  id: string
  titulo: string
  disciplina: string
  tipo: 'apostila' | 'exercicio' | 'simulado' | 'video'
  arquivo_url?: string
  descricao?: string
  disponivel_para_turma: string[]
  created_at: string
}
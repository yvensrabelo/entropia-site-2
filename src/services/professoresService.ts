import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Professor {
  id: string
  numero: string
  nome: string
  cpf: string
  whatsapp?: string
  materias?: string[]
  email?: string
  reconhecimento: string
  status: 'ativo' | 'inativo'
  created_at?: string
  updated_at?: string
}

class ProfessoresService {
  private supabase = createClientComponentClient()

  async listarProfessores(apenasAtivos = false): Promise<Professor[]> {
    try {
      let query = this.supabase
        .from('professores')
        .select('*')
        .order('nome', { ascending: true })
      
      if (apenasAtivos) {
        query = query.eq('ativo', true)
      }

      const { data, error } = await query

      if (error) throw error

      // Adaptar formato
      return (data || []).map(prof => ({
        id: prof.id.toString(),
        numero: prof.telefone || '',
        nome: prof.nome,
        cpf: prof.email || '', // Temporário - ajustar depois
        whatsapp: prof.telefone,
        materias: prof.disciplinas || [],
        email: prof.email,
        reconhecimento: '', // Campo não existe na tabela atual
        status: prof.ativo ? 'ativo' as const : 'inativo' as const
      }))
    } catch (error) {
      console.error('Erro ao listar professores:', error)
      return []
    }
  }

  async criarProfessor(professor: Omit<Professor, 'id'>): Promise<Professor | null> {
    try {
      const dadosBanco = {
        nome: professor.nome,
        email: professor.email || professor.cpf,
        telefone: professor.whatsapp || professor.numero,
        disciplinas: professor.materias || [],
        ativo: professor.status === 'ativo'
      }

      const { data, error } = await this.supabase
        .from('professores')
        .insert([dadosBanco])
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id.toString(),
        numero: data.telefone || '',
        nome: data.nome,
        cpf: data.email || '',
        whatsapp: data.telefone,
        materias: data.disciplinas || [],
        email: data.email,
        reconhecimento: '',
        status: data.ativo ? 'ativo' as const : 'inativo' as const
      }
    } catch (error) {
      console.error('Erro ao criar professor:', error)
      return null
    }
  }

  async atualizarProfessor(id: string, professor: Partial<Professor>): Promise<boolean> {
    try {
      const dadosBanco: any = {}
      
      if (professor.nome !== undefined) dadosBanco.nome = professor.nome
      if (professor.email !== undefined) dadosBanco.email = professor.email
      if (professor.whatsapp !== undefined) dadosBanco.telefone = professor.whatsapp
      if (professor.materias !== undefined) dadosBanco.disciplinas = professor.materias
      if (professor.status !== undefined) dadosBanco.ativo = professor.status === 'ativo'

      const { error } = await this.supabase
        .from('professores')
        .update(dadosBanco)
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erro ao atualizar professor:', error)
      return false
    }
  }

  async excluirProfessor(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('professores')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erro ao excluir professor:', error)
      return false
    }
  }
}

export const professoresService = new ProfessoresService()
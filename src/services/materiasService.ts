import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Materia {
  id: string
  nome: string
  codigo?: string
  cor_hex?: string
  ativo: boolean
  ordem?: number
}

class MateriasService {
  private supabase = createClientComponentClient()

  async listarMaterias(apenasAtivas = true): Promise<Materia[]> {
    try {
      let query = this.supabase
        .from('materias')
        .select('*')
        .order('ordem', { ascending: true })
        .order('nome', { ascending: true })
      
      if (apenasAtivas) {
        query = query.eq('ativo', true)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).map(materia => ({
        id: materia.id,
        nome: materia.nome,
        codigo: materia.codigo,
        cor_hex: materia.cor_hex,
        ativo: materia.ativo,
        ordem: materia.ordem
      }))
    } catch (error) {
      console.error('Erro ao listar matérias:', error)
      return []
    }
  }

  async buscarMateriaPorNome(nome: string): Promise<Materia | null> {
    try {
      const { data, error } = await this.supabase
        .from('materias')
        .select('*')
        .eq('nome', nome)
        .single()

      if (error) throw error

      return data ? {
        id: data.id,
        nome: data.nome,
        codigo: data.codigo,
        cor_hex: data.cor_hex,
        ativo: data.ativo,
        ordem: data.ordem
      } : null
    } catch (error) {
      console.error('Erro ao buscar matéria:', error)
      return null
    }
  }
}

export const materiasService = new MateriasService()
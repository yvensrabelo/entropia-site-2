import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TurmaSimples } from '@/lib/types/turma'

export interface BeneficioTurma {
  texto: string
  destaquePlatinado: boolean
}

class TurmasService {
  private supabase = createClientComponentClient()

  async listarTurmas(apenasAtivas = true): Promise<TurmaSimples[]> {
    try {
      let query = this.supabase
        .from('turmas')
        .select('*')
        .order('ordem', { ascending: true })
        .order('nome', { ascending: true })
      
      if (apenasAtivas) {
        query = query.eq('ativo', true)
      }

      const { data, error } = await query

      if (error) throw error

      // Adaptar formato do banco para o formato esperado
      return (data || []).map(turma => {
        // Validar e normalizar beneficios
        let beneficiosValidos = []
        try {
          if (Array.isArray(turma.beneficios)) {
            beneficiosValidos = turma.beneficios
          } else if (typeof turma.beneficios === 'string') {
            beneficiosValidos = JSON.parse(turma.beneficios)
          }
        } catch (error) {
          console.warn('Benefícios inválidos para turma', turma.id, error)
          beneficiosValidos = []
        }

        return {
          id: turma.id.toString(),
          nome: turma.nome || '',
          foco: turma.descricao || '',
          serie: turma.ordem?.toString() || '1' as '1' | '2' | '3' | 'formado',
          beneficios: beneficiosValidos,
          ativa: turma.ativo ?? true
        }
      })
    } catch (error) {
      console.error('Erro ao listar turmas:', error)
      return []
    }
  }

  async criarTurma(turma: Omit<TurmaSimples, 'id'>): Promise<TurmaSimples | null> {
    try {
      const dadosBanco = {
        nome: turma.nome,
        descricao: turma.foco,
        ordem: parseInt(turma.serie),
        beneficios: turma.beneficios,
        ativo: turma.ativa
      }

      const { data, error } = await this.supabase
        .from('turmas')
        .insert([dadosBanco])
        .select()
        .single()

      if (error) throw error

      // Validar beneficios retornados
      let beneficiosValidos = []
      try {
        if (Array.isArray(data.beneficios)) {
          beneficiosValidos = data.beneficios
        } else if (typeof data.beneficios === 'string') {
          beneficiosValidos = JSON.parse(data.beneficios)
        }
      } catch (error) {
        console.warn('Benefícios inválidos ao criar turma', error)
        beneficiosValidos = []
      }

      return {
        id: data.id.toString(),
        nome: data.nome || '',
        foco: data.descricao || '',
        serie: data.ordem?.toString() || '1' as '1' | '2' | '3' | 'formado',
        beneficios: beneficiosValidos,
        ativa: data.ativo ?? true
      }
    } catch (error) {
      console.error('Erro ao criar turma:', error)
      return null
    }
  }

  async atualizarTurma(id: string, turma: Partial<TurmaSimples>): Promise<boolean> {
    try {
      const dadosBanco: any = {}
      
      if (turma.nome !== undefined) dadosBanco.nome = turma.nome
      if (turma.foco !== undefined) dadosBanco.descricao = turma.foco
      if (turma.serie !== undefined) dadosBanco.ordem = parseInt(turma.serie)
      if (turma.beneficios !== undefined) dadosBanco.beneficios = turma.beneficios
      if (turma.ativa !== undefined) dadosBanco.ativo = turma.ativa

      const { error } = await this.supabase
        .from('turmas')
        .update(dadosBanco)
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erro ao atualizar turma:', error)
      return false
    }
  }

  async excluirTurma(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('turmas')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erro ao excluir turma:', error)
      return false
    }
  }
}

export const turmasService = new TurmasService()
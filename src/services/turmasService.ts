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
        .order('serie', { ascending: true })
        .order('nome', { ascending: true })
      
      if (apenasAtivas) {
        query = query.eq('ativo', true)
      }

      const { data, error } = await query

      if (error) throw error

      // Adaptar formato do banco para o formato esperado
      return (data || []).map(turma => ({
        id: turma.id.toString(),
        nome: turma.nome,
        foco: turma.descricao || '',
        serie: turma.ordem?.toString() || '3' as '1' | '2' | '3' | 'formado',
        beneficios: [], // Temporariamente vazio até coluna ser adicionada
        ativa: turma.ativo ?? true
      }))
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
        // beneficios: turma.beneficios, // TEMPORARIAMENTE REMOVIDO - coluna não existe
        ativo: turma.ativa
      }

      const { data, error } = await this.supabase
        .from('turmas')
        .insert([dadosBanco])
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id.toString(),
        nome: data.nome,
        foco: data.descricao || '',
        serie: data.ordem?.toString() || '3' as '1' | '2' | '3' | 'formado',
        beneficios: [], // Temporariamente vazio até coluna ser adicionada
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
      // if (turma.beneficios !== undefined) dadosBanco.beneficios = turma.beneficios // TEMPORARIAMENTE REMOVIDO
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
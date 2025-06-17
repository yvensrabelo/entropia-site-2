import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

class ConfiguracoesService {
  private supabase = createClientComponentClient()

  async obterConfiguracao(chave: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('configuracoes')
        .select('valor')
        .eq('chave', chave)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Não encontrado
        throw error
      }

      return data?.valor
    } catch (error) {
      console.error(`Erro ao obter configuração ${chave}:`, error)
      return null
    }
  }

  async salvarConfiguracao(chave: string, valor: any): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('configuracoes')
        .upsert([{ chave, valor }], { onConflict: 'chave' })

      if (error) throw error
      return true
    } catch (error) {
      console.error(`Erro ao salvar configuração ${chave}:`, error)
      return false
    }
  }

  // Métodos específicos para configurações conhecidas
  async obterCodigoPortaria(): Promise<string | null> {
    return this.obterConfiguracao('codigo_portaria')
  }

  async salvarCodigoPortaria(codigo: string): Promise<boolean> {
    return this.salvarConfiguracao('codigo_portaria', codigo)
  }

  async obterTurmasAtivas(): Promise<any[]> {
    const turmas = await this.obterConfiguracao('turmas_ativas')
    return turmas || []
  }

  async salvarTurmasAtivas(turmas: any[]): Promise<boolean> {
    return this.salvarConfiguracao('turmas_ativas', turmas)
  }

  async obterMapeamentoTurmas(): Promise<any[]> {
    const mapeamento = await this.obterConfiguracao('mapeamento_turmas')
    return mapeamento || []
  }

  async salvarMapeamentoTurmas(mapeamento: any[]): Promise<boolean> {
    return this.salvarConfiguracao('mapeamento_turmas', mapeamento)
  }

  async obterMapeamentoLookup(): Promise<Record<string, string>> {
    const lookup = await this.obterConfiguracao('mapeamento_turmas_lookup')
    return lookup || {}
  }

  async salvarMapeamentoLookup(lookup: Record<string, string>): Promise<boolean> {
    return this.salvarConfiguracao('mapeamento_turmas_lookup', lookup)
  }
}

export const configuracoesService = new ConfiguracoesService()
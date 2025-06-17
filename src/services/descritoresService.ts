import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface DescritorAula {
  assunto: string
  observacoes?: string
  professor_id: string
}

export interface DescritoresDia {
  [turma_materia: string]: DescritorAula
}

class DescritoresService {
  private supabase = createClientComponentClient()

  async obterDescritoresPorData(data: string): Promise<DescritoresDia> {
    try {
      const config = await this.obterConfiguracao(`descritores_${data}`)
      return config || {}
    } catch (error) {
      console.error(`Erro ao obter descritores de ${data}:`, error)
      return {}
    }
  }

  async salvarDescritoresPorData(data: string, descritores: DescritoresDia): Promise<boolean> {
    try {
      return await this.salvarConfiguracao(`descritores_${data}`, descritores)
    } catch (error) {
      console.error(`Erro ao salvar descritores de ${data}:`, error)
      return false
    }
  }

  async obterChegadasPorData(data: string): Promise<any[]> {
    try {
      const chegadas = await this.obterConfiguracao(`chegadas_${data}`)
      return chegadas || []
    } catch (error) {
      console.error(`Erro ao obter chegadas de ${data}:`, error)
      return []
    }
  }

  async salvarChegadasPorData(data: string, chegadas: any[]): Promise<boolean> {
    try {
      return await this.salvarConfiguracao(`chegadas_${data}`, chegadas)
    } catch (error) {
      console.error(`Erro ao salvar chegadas de ${data}:`, error)
      return false
    }
  }

  async obterAtrasosPorData(data: string): Promise<Record<string, any>> {
    try {
      const atrasos = await this.obterConfiguracao(`atrasos_${data}`)
      return atrasos || {}
    } catch (error) {
      console.error(`Erro ao obter atrasos de ${data}:`, error)
      return {}
    }
  }

  async salvarAtrasosPorData(data: string, atrasos: Record<string, any>): Promise<boolean> {
    try {
      return await this.salvarConfiguracao(`atrasos_${data}`, atrasos)
    } catch (error) {
      console.error(`Erro ao salvar atrasos de ${data}:`, error)
      return false
    }
  }

  // Métodos auxiliares privados
  private async obterConfiguracao(chave: string): Promise<any> {
    const { data, error } = await this.supabase
      .from('configuracoes')
      .select('valor')
      .eq('chave', chave)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data?.valor
  }

  private async salvarConfiguracao(chave: string, valor: any): Promise<boolean> {
    const { error } = await this.supabase
      .from('configuracoes')
      .upsert([{ chave, valor }], { onConflict: 'chave' })

    return !error
  }
}

export const descritoresService = new DescritoresService()
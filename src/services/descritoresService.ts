import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface DescritorAula {
  assunto: string
  observacoes?: string
  professor_id: string
  horario_id?: string
  minutos_aula?: number
  id?: string
}

export interface DescritoresDia {
  [aula_id: string]: DescritorAula
}

export interface DescritorDB {
  id: string
  professor_id: string
  data: string
  horario_id?: string
  titulo?: string
  descricao?: string
  descricao_livre: string
  minutos_aula: number
  enviado: boolean
  editavel: boolean
  topico_id?: string
  created_at: string
  updated_at: string
}

class DescritoresService {
  private supabase = createClientComponentClient()

  // Método principal para obter descritores por data
  async obterDescritoresPorData(data: string): Promise<DescritoresDia> {
    try {
      console.log('🔍 [DESCRITORES SERVICE] Buscando descritores para data:', data)
      
      const { data: descritores, error } = await this.supabase
        .from('descritores')
        .select(`
          id,
          professor_id,
          data,
          horario_id,
          titulo,
          descricao,
          descricao_livre,
          minutos_aula,
          enviado,
          editavel,
          topico_id,
          created_at,
          updated_at
        `)
        .eq('data', data)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ [DESCRITORES SERVICE] Erro na busca:', error)
        throw error
      }

      console.log('✅ [DESCRITORES SERVICE] Descritores encontrados:', descritores?.length || 0)

      // Converter para o formato esperado pelo sistema
      const descritoresFormatados: DescritoresDia = {}
      
      if (descritores && descritores.length > 0) {
        descritores.forEach((desc: DescritorDB) => {
          const aulaId = desc.horario_id || desc.id
          descritoresFormatados[aulaId] = {
            id: desc.id,
            assunto: desc.descricao_livre || desc.descricao || '',
            observacoes: desc.titulo,
            professor_id: desc.professor_id,
            horario_id: desc.horario_id,
            minutos_aula: desc.minutos_aula
          }
        })
      }

      return descritoresFormatados
    } catch (error) {
      console.error(`❌ [DESCRITORES SERVICE] Erro ao obter descritores de ${data}:`, error)
      return {}
    }
  }

  // Método principal para salvar descritores por data
  async salvarDescritoresPorData(data: string, descritores: DescritoresDia): Promise<boolean> {
    try {
      console.log('💾 [DESCRITORES SERVICE] Salvando descritores para data:', data)
      console.log('📝 [DESCRITORES SERVICE] Quantidade de descritores:', Object.keys(descritores).length)

      // Processar cada descritor
      for (const [aulaId, descritor] of Object.entries(descritores)) {
        await this.salvarDescritorIndividual(data, aulaId, descritor)
      }

      console.log('✅ [DESCRITORES SERVICE] Todos os descritores salvos com sucesso')
      return true
    } catch (error) {
      console.error(`❌ [DESCRITORES SERVICE] Erro ao salvar descritores de ${data}:`, error)
      return false
    }
  }

  // Método para salvar um descritor individual
  async salvarDescritorIndividual(data: string, aulaId: string, descritor: DescritorAula): Promise<boolean> {
    try {
      // Calcular minutos da aula (padrão: 50 minutos por tempo)
      const minutosAula = descritor.minutos_aula || this.calcularMinutosAula()

      // Dados para inserir/atualizar
      const dadosDescritor = {
        professor_id: descritor.professor_id,
        data: data,
        horario_id: descritor.horario_id || aulaId,
        titulo: descritor.observacoes || '',
        descricao: descritor.assunto,
        descricao_livre: descritor.assunto,
        minutos_aula: minutosAula,
        enviado: false,
        editavel: true,
        topico_id: null
      }

      // Verificar se já existe um descritor para esta aula
      const { data: existente } = await this.supabase
        .from('descritores')
        .select('id')
        .eq('data', data)
        .eq('horario_id', aulaId)
        .eq('professor_id', descritor.professor_id)
        .single()

      if (existente) {
        // Atualizar registro existente
        const { error: updateError } = await this.supabase
          .from('descritores')
          .update({
            ...dadosDescritor,
            updated_at: new Date().toISOString()
          })
          .eq('id', existente.id)

        if (updateError) {
          console.error('❌ [DESCRITORES SERVICE] Erro ao atualizar:', updateError)
          return false
        }

        console.log('🔄 [DESCRITORES SERVICE] Descritor atualizado:', existente.id)
      } else {
        // Inserir novo registro
        const { error: insertError } = await this.supabase
          .from('descritores')
          .insert([dadosDescritor])

        if (insertError) {
          console.error('❌ [DESCRITORES SERVICE] Erro ao inserir:', insertError)
          return false
        }

        console.log('➕ [DESCRITORES SERVICE] Novo descritor criado para aula:', aulaId)
      }

      return true
    } catch (error) {
      console.error('❌ [DESCRITORES SERVICE] Erro ao salvar descritor individual:', error)
      return false
    }
  }

  // Método para calcular minutos da aula baseado no tempo
  private calcularMinutosAula(tempo?: number): number {
    // Cada tempo = 50 minutos (padrão do sistema)
    const minutosPorTempo = 50
    return minutosPorTempo * (tempo || 1)
  }

  // Métodos mantidos para compatibilidade (ainda usando configuracoes)
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

  // Métodos auxiliares privados (mantidos para chegadas e atrasos)
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

  // Métodos adicionais para gerenciamento de descritores
  async obterDescritorPorId(id: string): Promise<DescritorDB | null> {
    try {
      const { data, error } = await this.supabase
        .from('descritores')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao obter descritor por ID:', error)
      return null
    }
  }

  async excluirDescritor(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('descritores')
        .delete()
        .eq('id', id)

      return !error
    } catch (error) {
      console.error('Erro ao excluir descritor:', error)
      return false
    }
  }

  async marcarComoEnviado(ids: string[]): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('descritores')
        .update({ 
          enviado: true, 
          editavel: false,
          updated_at: new Date().toISOString()
        })
        .in('id', ids)

      return !error
    } catch (error) {
      console.error('Erro ao marcar descritores como enviados:', error)
      return false
    }
  }
}

export const descritoresService = new DescritoresService()
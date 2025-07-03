import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { TurmaSimples, Turno, Serie } from '@/lib/types/turma'

export interface BeneficioTurma {
  texto: string
  destaquePlatinado: boolean
}

// Mapear ordem numérica para série formatada
const mapearSerie = (ordem: number | string): string => {
  const ordemString = ordem?.toString() || '1';
  switch (ordemString) {
    case '1': return '1ª série';
    case '2': return '2ª série';
    case '3': return '3ª série';
    case 'formado': return 'Extensivo';
    default: return '1ª série';
  }
};

// Mapear tipo de turma baseado no nome
const mapearTipoPorNome = (nome: string): string => {
  const nomeUpper = nome.toUpperCase()
  
  if (nomeUpper.includes('PSC')) return 'intensivo_psc'
  if (nomeUpper.includes('SIS')) return 'sis_macro'
  if (nomeUpper.includes('MACRO')) return 'sis_macro'
  if (nomeUpper.includes('ENEM')) return 'enem_total'
  if (nomeUpper.includes('MILITAR')) return 'intensivo_psc'
  if (nomeUpper.includes('INTENSIV')) return 'intensivo_psc'
  if (nomeUpper.includes('EXTENSIV')) return 'enem_total'
  
  // Padrão - PSC Intensivo
  return 'intensivo_psc'
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

        const mapped = {
          id: turma.id.toString(),
          nome: turma.nome || '',
          foco: turma.descricao || '',
          serie: mapearSerie(turma.ordem) as Serie,
          turnos: Array.isArray(turma.turnos) ? turma.turnos : ['matutino'],
          seriesAtendidas: Array.isArray(turma.series_atendidas) 
            ? turma.series_atendidas.map((s: string) => mapearSerie(s))
            : [mapearSerie(turma.ordem?.toString() || '1')],
          beneficios: beneficiosValidos,
          ativa: turma.ativo ?? true,
          precoMensal: turma.preco_mensal || 0,
          duracaoMeses: turma.duracao_meses || 12
        }
        
        return mapped
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
        turnos: turma.turnos || ['matutino'], // NOVO - array de turnos
        series_atendidas: turma.seriesAtendidas || [turma.serie], // NOVO - array de séries
        beneficios: turma.beneficios,
        ativo: turma.ativa,
        // CAMPOS OBRIGATÓRIOS ADICIONAIS
        tipo: mapearTipoPorNome(turma.nome),
        vagas_disponiveis: 100, // valor padrão
        exibir_periodo: true,
        exibir_duracao: true,
        exibir_vagas: true,
        // NOVOS CAMPOS DE VALOR E DURAÇÃO
        preco_mensal: turma.precoMensal || 0,
        duracao_meses: turma.duracaoMeses || 12,
        // Campos adicionais que podem ser necessários
        diferenciais: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Criando turma com dados:', dadosBanco)

      const { data, error } = await this.supabase
        .from('turmas')
        .insert([dadosBanco])
        .select()
        .single()

      if (error) {
        console.error('Erro do Supabase ao criar turma:', error)
        throw error
      }

      console.log('✅ Turma criada com sucesso no banco:', data)

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
        serie: mapearSerie(data.ordem) as Serie,
        turnos: data.turnos || ['matutino'], // NOVO - array de turnos
        seriesAtendidas: Array.isArray(data.series_atendidas) 
          ? data.series_atendidas.map((s: string) => mapearSerie(s))
          : [mapearSerie(data.ordem?.toString() || '1')], // NOVO - array de séries
        beneficios: beneficiosValidos,
        ativa: data.ativo ?? true,
        // NOVOS CAMPOS DE VALOR E DURAÇÃO
        precoMensal: data.preco_mensal || 0,
        duracaoMeses: data.duracao_meses || 12
      }
    } catch (error) {
      console.error('Erro ao criar turma:', error)
      return null
    }
  }

  async atualizarTurma(id: string, turma: Partial<TurmaSimples>): Promise<boolean> {
    try {
      const dadosBanco: any = {}
      
      if (turma.nome !== undefined) {
        dadosBanco.nome = turma.nome
        // Se o nome mudou, atualizar o tipo também
        dadosBanco.tipo = mapearTipoPorNome(turma.nome)
      }
      if (turma.foco !== undefined) dadosBanco.descricao = turma.foco
      if (turma.serie !== undefined) dadosBanco.ordem = parseInt(turma.serie)
      if (turma.beneficios !== undefined) dadosBanco.beneficios = turma.beneficios
      if (turma.ativa !== undefined) dadosBanco.ativo = turma.ativa
      // NOVOS CAMPOS DE VALOR E DURAÇÃO
      if (turma.precoMensal !== undefined) dadosBanco.preco_mensal = turma.precoMensal
      if (turma.duracaoMeses !== undefined) dadosBanco.duracao_meses = turma.duracaoMeses
      // NOVOS CAMPOS DE ARRAYS
      if (turma.turnos !== undefined) dadosBanco.turnos = turma.turnos
      if (turma.seriesAtendidas !== undefined) dadosBanco.series_atendidas = turma.seriesAtendidas
      
      // Sempre atualizar timestamp
      dadosBanco.updated_at = new Date().toISOString()

      console.log('Atualizando turma ID:', id, 'com dados:', dadosBanco)

      const { error } = await this.supabase
        .from('turmas')
        .update(dadosBanco)
        .eq('id', id)

      if (error) {
        console.error('Erro do Supabase ao atualizar turma:', error)
        throw error
      }
      
      console.log('✅ Turma atualizada com sucesso:', id)
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

  // NOVA FUNÇÃO: Listar turnos disponíveis por série
  async listarTurnosDisponiveisPorSerie(serie: Serie): Promise<Turno[]> {
    try {
      // IMPLEMENTAÇÃO SIMPLIFICADA: Buscar todas as turmas e filtrar localmente
      const { data, error } = await this.supabase
        .from('turmas')
        .select('turnos, series_atendidas')
        .eq('ativo', true)

      if (error) throw error

      // Filtrar localmente turmas que atendem esta série
      const turmasValidas = (data || []).filter(turma => 
        Array.isArray(turma.series_atendidas) && turma.series_atendidas.includes(serie)
      )

      // Extrair turnos únicos
      const todosTurnos = turmasValidas.flatMap(t => t.turnos || [])
      const turnosUnicos = [...new Set(todosTurnos)] as Turno[]
      
      return turnosUnicos
    } catch (error) {
      console.error('Erro ao listar turnos disponíveis:', error)
      return []
    }
  }

  // NOVA FUNÇÃO: Obter turmas por série e turno
  async listarTurmasPorSerieETurno(serie: Serie, turno: Turno): Promise<TurmaSimples[]> {
    try {
      // IMPLEMENTAÇÃO SIMPLIFICADA: Buscar todas as turmas e filtrar localmente
      const { data, error } = await this.supabase
        .from('turmas')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (error) throw error

      // Filtrar localmente
      const turmasFiltradas = (data || []).filter(turma => {
        const contemSerie = Array.isArray(turma.series_atendidas) && turma.series_atendidas.includes(serie)
        const contemTurno = Array.isArray(turma.turnos) && turma.turnos.includes(turno)
        return contemSerie && contemTurno
      })

      // Adaptar formato do banco para o formato esperado
      return turmasFiltradas.map(turma => {
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
          serie: mapearSerie(turma.ordem) as Serie,
          turnos: turma.turnos || ['matutino'],
          seriesAtendidas: Array.isArray(turma.series_atendidas) 
            ? turma.series_atendidas.map((s: string) => mapearSerie(s))
            : [mapearSerie(turma.ordem?.toString() || '1')],
          beneficios: beneficiosValidos,
          ativa: turma.ativo ?? true,
          precoMensal: turma.preco_mensal || 0,
          duracaoMeses: turma.duracao_meses || 12
        }
      })
    } catch (error) {
      console.error('Erro ao listar turmas por série e turno:', error)
      return []
    }
  }

  // NOVA FUNÇÃO: Obter turma por ID
  async obterTurma(id: string): Promise<TurmaSimples | null> {
    try {
      const { data, error } = await this.supabase
        .from('turmas')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) return null

      // Validar e normalizar beneficios
      let beneficiosValidos = []
      try {
        if (Array.isArray(data.beneficios)) {
          beneficiosValidos = data.beneficios
        } else if (typeof data.beneficios === 'string') {
          beneficiosValidos = JSON.parse(data.beneficios)
        }
      } catch (error) {
        console.warn('Benefícios inválidos para turma', data.id, error)
        beneficiosValidos = []
      }

      return {
        id: data.id.toString(),
        nome: data.nome || '',
        foco: data.descricao || '',
        serie: mapearSerie(data.ordem) as Serie,
        turnos: data.turnos || ['matutino'],
        seriesAtendidas: Array.isArray(data.series_atendidas) 
          ? data.series_atendidas.map((s: string) => mapearSerie(s))
          : [mapearSerie(data.ordem?.toString() || '1')],
        beneficios: beneficiosValidos,
        ativa: data.ativo ?? true,
        precoMensal: data.preco_mensal || 0,
        duracaoMeses: data.duracao_meses || 12
      }
    } catch (error) {
      console.error('Erro ao obter turma:', error)
      return null
    }
  }

  // NOVO: Listar turmas do sistema de horários
  async listarTurmasSistema(apenasAtivas = true): Promise<Array<{id: string, codigo: string, nome: string, turno: string}>> {
    try {
      let query = this.supabase
        .from('turmas_sistema')
        .select('*')
        .order('codigo', { ascending: true })
      
      if (apenasAtivas) {
        query = query.eq('ativo', true)
      }

      const { data, error } = await query

      if (error) throw error

      return (data || []).map(turma => ({
        id: turma.id,
        codigo: turma.codigo,
        nome: turma.nome,
        turno: turma.turno
      }))
    } catch (error) {
      console.error('Erro ao listar turmas do sistema:', error)
      return []
    }
  }
}

export const turmasService = new TurmasService()
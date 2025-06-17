import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface HorarioAula {
  id: string
  dia_semana: string
  hora_inicio: string
  hora_fim: string
  professor_id?: string
  professor_nome?: string
  materia: string
  turma: string
  sala: string
  turno: 'manhã' | 'tarde' | 'noite'
  tempo: number
  created_at?: string
  updated_at?: string
}

class HorariosService {
  private supabase = createClientComponentClient()

  async listarHorarios(): Promise<HorarioAula[]> {
    try {
      const { data, error } = await this.supabase
        .from('horarios')
        .select(`
          *,
          professor:professores(nome)
        `)
        .order('dia_semana', { ascending: true })
        .order('hora_inicio', { ascending: true })

      if (error) throw error

      return (data || []).map(horario => ({
        id: horario.id.toString(),
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fim: horario.hora_fim,
        professor_id: horario.professor_id,
        professor_nome: horario.professor?.nome || '',
        materia: horario.disciplina || '',
        turma: '', // Buscar nome da turma se necessário
        sala: horario.sala || '',
        turno: this.definirTurno(horario.hora_inicio),
        tempo: this.calcularTempo(horario.hora_inicio, horario.hora_fim)
      }))
    } catch (error) {
      console.error('Erro ao listar horários:', error)
      return []
    }
  }

  async criarHorario(horario: Omit<HorarioAula, 'id'>): Promise<HorarioAula | null> {
    try {
      const { data, error } = await this.supabase
        .from('horarios')
        .insert([{
          dia_semana: horario.dia_semana,
          hora_inicio: horario.hora_inicio,
          hora_fim: horario.hora_fim,
          professor_id: horario.professor_id,
          disciplina: horario.materia,
          sala: horario.sala
        }])
        .select()
        .single()

      if (error) throw error

      return {
        ...horario,
        id: data.id.toString()
      }
    } catch (error) {
      console.error('Erro ao criar horário:', error)
      return null
    }
  }

  async atualizarHorario(id: string, horario: Partial<HorarioAula>): Promise<boolean> {
    try {
      const dadosBanco: any = {}
      
      if (horario.dia_semana !== undefined) dadosBanco.dia_semana = horario.dia_semana
      if (horario.hora_inicio !== undefined) dadosBanco.hora_inicio = horario.hora_inicio
      if (horario.hora_fim !== undefined) dadosBanco.hora_fim = horario.hora_fim
      if (horario.professor_id !== undefined) dadosBanco.professor_id = horario.professor_id
      if (horario.materia !== undefined) dadosBanco.disciplina = horario.materia
      if (horario.sala !== undefined) dadosBanco.sala = horario.sala

      const { error } = await this.supabase
        .from('horarios')
        .update(dadosBanco)
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erro ao atualizar horário:', error)
      return false
    }
  }

  async excluirHorario(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('horarios')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erro ao excluir horário:', error)
      return false
    }
  }

  async excluirTodosHorarios(): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('horarios')
        .delete()
        .gte('id', '00000000-0000-0000-0000-000000000000') // Deleta todos

      if (error) throw error
      return true
    } catch (error) {
      console.error('Erro ao excluir todos os horários:', error)
      return false
    }
  }

  private definirTurno(horaInicio: string): 'manhã' | 'tarde' | 'noite' {
    const hora = parseInt(horaInicio.split(':')[0])
    if (hora < 12) return 'manhã'
    if (hora < 18) return 'tarde'
    return 'noite'
  }

  private calcularTempo(horaInicio: string, horaFim: string): number {
    const [h1, m1] = horaInicio.split(':').map(Number)
    const [h2, m2] = horaFim.split(':').map(Number)
    return (h2 * 60 + m2) - (h1 * 60 + m1)
  }
}

export const horariosService = new HorariosService()
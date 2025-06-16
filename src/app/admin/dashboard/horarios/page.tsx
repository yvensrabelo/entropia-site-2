'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit2, Trash2, User, MapPin, Calendar, Grid3x3, List, Monitor, CheckCircle, AlertCircle } from 'lucide-react';
import { detectarTurno, calcularTempo, getDiaAtual, formatDiaName, isAulaAtual } from '@/lib/utils/horario-utils';
import AuthGuard from '@/components/admin/AuthGuard';

interface Professor {
  id: string;
  numero: string;
  nome: string;
  cpf: string;
  email?: string;
  whatsapp?: string;
  materias?: string[];
  status: 'ativo' | 'inativo';
}

interface HorarioAula {
  id: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
  professor_id?: string;
  professor_nome?: string;
  materia: string;
  turma: string;
  sala: string;
  turno: 'manhã' | 'tarde' | 'noite';
  tempo: number;
}

interface PresencaProfessor {
  horarioId: string;
  professorPresente: boolean;
  horaChegada?: string;
  timestamp: string;
}

export default function HorariosPage() {
  const [horarios, setHorarios] = useState<HorarioAula[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedHorario, setSelectedHorario] = useState<HorarioAula | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'today' | 'turma'>('turma');
  const [filterDia, setFilterDia] = useState('');
  const [filterTurma, setFilterTurma] = useState('');
  const [presencas, setPresencas] = useState<PresencaProfessor[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const diasSemana = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const diasSemanaDisplay = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const horariosPadrao = ['07:00', '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  
  // Estados para nova visualização por turma
  const [turmaSelecionada, setTurmaSelecionada] = useState('');
  const [turnoSelecionado, setTurnoSelecionado] = useState<'manhã' | 'tarde' | 'noite'>('manhã');
  const [diaSelecionado, setDiaSelecionado] = useState('segunda');
  
  // Tempos por turno
  const temposPorTurno = {
    'manhã': [
      { tempo: 1, horario: '07:00-07:50', inicio: '07:00', fim: '07:50' },
      { tempo: 2, horario: '08:00-08:50', inicio: '08:00', fim: '08:50' },
      { tempo: 3, horario: '09:00-09:50', inicio: '09:00', fim: '09:50' },
      { tempo: 4, horario: '10:00-10:50', inicio: '10:00', fim: '10:50' }
    ],
    'tarde': [
      { tempo: 1, horario: '13:00-13:50', inicio: '13:00', fim: '13:50' },
      { tempo: 2, horario: '14:00-14:50', inicio: '14:00', fim: '14:50' },
      { tempo: 3, horario: '15:00-15:50', inicio: '15:00', fim: '15:50' },
      { tempo: 4, horario: '16:00-16:50', inicio: '16:00', fim: '16:50' }
    ],
    'noite': [
      { tempo: 1, horario: '19:00-19:50', inicio: '19:00', fim: '19:50' },
      { tempo: 2, horario: '20:00-20:50', inicio: '20:00', fim: '20:50' },
      { tempo: 3, horario: '21:00-21:50', inicio: '21:00', fim: '21:50' }
    ]
  };
  
  const [turmasDisponiveis, setTurmasDisponiveis] = useState<string[]>([]);

  const materiasDisponiveis = [
    'Matemática', 'Física', 'Química', 'Biologia',
    'Português', 'Literatura', 'Redação', 'Inglês',
    'História', 'Geografia', 'Filosofia', 'Sociologia'
  ];

  useEffect(() => {
    loadData();
    
    // Atualizar relógio a cada segundo
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Sincronizar professores entre abas
  useEffect(() => {
    // Carregar professores do localStorage
    const loadProfessores = () => {
      const stored = localStorage.getItem('professores');
      if (stored) {
        setProfessors(JSON.parse(stored));
      }
    };

    // Carregar inicialmente
    loadProfessores();

    // Escutar mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'professores') {
        loadProfessores();
      }
    };

    // Recarregar quando a aba ganhar foco
    const handleFocus = () => {
      loadProfessores();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Sincronizar turmas ativas
  useEffect(() => {
    const carregarTurmasAtivas = () => {
      const stored = localStorage.getItem('turmas_ativas');
      if (stored) {
        const turmas = JSON.parse(stored);
        const turmasAtivas = turmas
          .filter((t: any) => t.ativa)
          .sort((a: any, b: any) => a.ordem - b.ordem)
          .map((t: any) => t.nome);
        setTurmasDisponiveis(turmasAtivas);
      }
    };

    // Carregar inicialmente
    carregarTurmasAtivas();

    // Escutar mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'turmas_ativas') {
        carregarTurmasAtivas();
      }
    };

    // Recarregar quando a aba ganhar foco
    const handleFocus = () => {
      carregarTurmasAtivas();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadData = () => {
    // Carregar horários
    const storedHorarios = localStorage.getItem('horarios_aulas');
    if (storedHorarios) {
      const horariosData = JSON.parse(storedHorarios);
      setHorarios(horariosData);
      console.log('📅 [HORARIOS] Carregados:', horariosData.length, 'horários');
      if (horariosData.length > 0) {
        console.log('📅 [HORARIOS] Primeiro horário:', horariosData[0]);
        console.log('📅 [HORARIOS] Dias únicos:', [...new Set(horariosData.map((h: any) => h.dia_semana))]);
        console.log('📅 [HORARIOS] Horários únicos:', [...new Set(horariosData.map((h: any) => h.hora_inicio))]);
      }
    } else {
      console.log('📅 [HORARIOS] Nenhum horário encontrado no localStorage');
    }

    // Carregar presenças
    const storedPresencas = localStorage.getItem('presencas_professores');
    if (storedPresencas) {
      setPresencas(JSON.parse(storedPresencas));
    }
  };

  // Funções auxiliares para a aba HOJE
  const getDiaAtualFormatado = () => {
    return formatDiaName(getDiaAtual());
  };

  const getDataFormatada = () => {
    return currentTime.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getHoraFormatada = () => {
    return currentTime.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getAulasDoDia = () => {
    const diaAtual = getDiaAtual();
    return horarios
      .filter(h => h.dia_semana === diaAtual)
      .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  };

  const isAulaAtualHoje = (horario: HorarioAula) => {
    return isAulaAtual(horario.hora_inicio, horario.hora_fim);
  };

  const getPresencaProfessor = (horarioId: string) => {
    return presencas.find(p => p.horarioId === horarioId);
  };

  const togglePresencaProfessor = (horarioId: string) => {
    const presencaExistente = getPresencaProfessor(horarioId);
    const novaPresenca: PresencaProfessor = {
      horarioId,
      professorPresente: !presencaExistente?.professorPresente,
      horaChegada: !presencaExistente?.professorPresente ? getHoraFormatada() : undefined,
      timestamp: new Date().toISOString()
    };

    const presencasAtualizadas = presencaExistente
      ? presencas.map(p => p.horarioId === horarioId ? novaPresenca : p)
      : [...presencas, novaPresenca];

    setPresencas(presencasAtualizadas);
    localStorage.setItem('presencas_professores', JSON.stringify(presencasAtualizadas));
  };

  const editarHoraChegada = (horarioId: string) => {
    const novaHora = prompt('Digite a hora de chegada (HH:MM):');
    if (novaHora && /^\d{2}:\d{2}$/.test(novaHora)) {
      const presencaExistente = getPresencaProfessor(horarioId);
      if (presencaExistente) {
        const presencaAtualizada = {
          ...presencaExistente,
          horaChegada: novaHora
        };
        
        const presencasAtualizadas = presencas.map(p => 
          p.horarioId === horarioId ? presencaAtualizada : p
        );
        
        setPresencas(presencasAtualizadas);
        localStorage.setItem('presencas_professores', JSON.stringify(presencasAtualizadas));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const professorId = formData.get('professorId') as string;
    const professor = professors.find(p => p.id === professorId);
    const horaInicio = formData.get('horaInicio') as string;
    const horaFim = formData.get('horaFim') as string;
    
    const diaFormulario = formData.get('dia') as string;
    const diaCorreto = diaFormulario.toLowerCase();
    
    const horarioData: HorarioAula = {
      id: selectedHorario?.id || Date.now().toString(),
      dia_semana: diaCorreto,
      hora_inicio: horaInicio,
      hora_fim: horaFim,
      professor_id: professorId || undefined,
      professor_nome: professor?.nome || undefined,
      materia: formData.get('materia') as string,
      turma: formData.get('turma') as string,
      sala: formData.get('sala') as string || 'Sala 1',
      turno: detectarTurno(horaInicio),
      tempo: calcularTempo(horaInicio)
    };

    console.log('📅 [HORARIOS] Salvando aula:', horarioData);

    const updatedHorarios = selectedHorario
      ? horarios.map(h => h.id === selectedHorario.id ? horarioData : h)
      : [...horarios, horarioData];

    setHorarios(updatedHorarios);
    localStorage.setItem('horarios_aulas', JSON.stringify(updatedHorarios));
    console.log('📅 [HORARIOS] Total após salvar:', updatedHorarios.length, 'horários');
    console.log('📅 [HORARIOS] Aula salva com sucesso!', horarioData.materia, '-', horarioData.turma);
    
    setShowModal(false);
    setSelectedHorario(null);
  };

  const deleteHorario = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este horário?')) {
      const updatedHorarios = horarios.filter(h => h.id !== id);
      setHorarios(updatedHorarios);
      localStorage.setItem('horarios_aulas', JSON.stringify(updatedHorarios));
    }
  };

  // Funções para nova visualização por turma
  const handleAddAulaForTempo = (tempo: number, tempoInfo: any) => {
    setSelectedHorario({
      id: '',
      dia_semana: diaSelecionado,
      hora_inicio: tempoInfo.inicio,
      hora_fim: tempoInfo.fim,
      turma: turmaSelecionada,
      materia: '',
      sala: 'Sala 1',
      turno: turnoSelecionado,
      tempo: tempo,
      professor_id: undefined,
      professor_nome: undefined
    });
    setShowModal(true);
  };

  const handleEditAula = (aula: HorarioAula) => {
    setSelectedHorario(aula);
    setShowModal(true);
  };

  const handleDeleteAula = (id: string) => {
    deleteHorario(id);
  };

  // Get horarios for specific day and time slot
  const getHorarioForSlot = (dia: string, horaInicio: string) => {
    const aulaEncontrada = horarios.find(h => h.dia_semana === dia && h.hora_inicio === horaInicio);
    console.log(`📅 [HORARIOS] Buscando aula para ${dia} às ${horaInicio}:`, aulaEncontrada ? 'ENCONTRADA' : 'NÃO ENCONTRADA');
    return aulaEncontrada;
  };

  // Get filtered horarios for table view
  const filteredHorarios = horarios.filter(h => {
    if (filterDia && formatDiaName(h.dia_semana) !== filterDia) return false;
    if (filterTurma && h.turma !== filterTurma) return false;
    return true;
  }).sort((a, b) => {
    const diaA = diasSemana.indexOf(a.dia_semana);
    const diaB = diasSemana.indexOf(b.dia_semana);
    if (diaA !== diaB) return diaA - diaB;
    return a.hora_inicio.localeCompare(b.hora_inicio);
  });

  return (
    <AuthGuard>
      <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Horários</h1>
        <p className="text-gray-600 mt-1">Grade de horários semanal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de Aulas</p>
              <p className="text-2xl font-bold text-gray-800">{horarios.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Professores Ativos</p>
              <p className="text-2xl font-bold text-gray-800">{professors.filter(p => p.status === 'ativo').length}</p>
            </div>
            <User className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sem Professor</p>
              <p className="text-2xl font-bold text-gray-800">
                {horarios.filter(h => !h.professor_id).length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 flex-1">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('turma')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  viewMode === 'turma' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Por Turma
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
                Grade Semanal
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
                Lista
              </button>
              <button
                onClick={() => setViewMode('today')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  viewMode === 'today' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Monitor className="w-4 h-4" />
                HOJE
              </button>
            </div>

            {(viewMode === 'table' || viewMode === 'grid') && (
              <div className="flex gap-4">
                <select
                  value={filterDia}
                  onChange={(e) => setFilterDia(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">Todos os dias</option>
                  {diasSemanaDisplay.map(dia => (
                    <option key={dia} value={dia}>{dia}</option>
                  ))}
                </select>
                
                <select
                  value={filterTurma}
                  onChange={(e) => setFilterTurma(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">Todas as turmas</option>
                  {turmasDisponiveis.map(turma => (
                    <option key={turma} value={turma}>{turma}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                console.log('📅 [DEBUG] Horários salvos no localStorage:', localStorage.getItem('horarios_aulas'));
                console.log('📅 [DEBUG] Estado horários atual:', horarios);
                console.log('📅 [DEBUG] Total de horários:', horarios.length);
                if (horarios.length > 0) {
                  console.log('📅 [DEBUG] Primeiro horário:', horarios[0]);
                  console.log('📅 [DEBUG] Dias únicos nos horários:', [...new Set(horarios.map(h => h.dia_semana))]);
                }
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Debug Horários
            </button>
            
            <button
              onClick={() => {
                setSelectedHorario(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Adicionar Aula
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'turma' ? (
        /* Nova visualização por Turma/Turno/Dia */
        <div className="space-y-6">
          {/* Filtros */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Filtros de Visualização</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Selecionar Turma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Turma</label>
                <select
                  value={turmaSelecionada}
                  onChange={(e) => setTurmaSelecionada(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">Selecione uma turma</option>
                  {turmasDisponiveis.map(turma => (
                    <option key={turma} value={turma}>{turma}</option>
                  ))}
                </select>
              </div>

              {/* Selecionar Turno */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Turno</label>
                <select
                  value={turnoSelecionado}
                  onChange={(e) => setTurnoSelecionado(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="manhã">Manhã</option>
                  <option value="tarde">Tarde</option>
                  <option value="noite">Noite</option>
                </select>
              </div>

              {/* Selecionar Dia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dia da Semana</label>
                <select
                  value={diaSelecionado}
                  onChange={(e) => setDiaSelecionado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="segunda">Segunda</option>
                  <option value="terça">Terça</option>
                  <option value="quarta">Quarta</option>
                  <option value="quinta">Quinta</option>
                  <option value="sexta">Sexta</option>
                  <option value="sábado">Sábado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grade de Horários por Tempo */}
          {turmaSelecionada ? (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  {turmaSelecionada} - {turnoSelecionado.charAt(0).toUpperCase() + turnoSelecionado.slice(1)} - {diaSelecionado.charAt(0).toUpperCase() + diaSelecionado.slice(1)}
                </h3>
                <div className="text-sm text-gray-500">
                  {temposPorTurno[turnoSelecionado].length} tempos disponíveis
                </div>
              </div>

              <div className="space-y-4">
                {temposPorTurno[turnoSelecionado].map((tempoInfo) => {
                  const aula = horarios.find(h => 
                    h.turma === turmaSelecionada &&
                    h.turno === turnoSelecionado &&
                    h.dia_semana === diaSelecionado &&
                    h.tempo === tempoInfo.tempo
                  );

                  return (
                    <div key={tempoInfo.tempo} className={`border-2 rounded-lg p-4 transition-all ${
                      aula ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className={`text-2xl font-bold px-3 py-2 rounded-lg ${
                            aula ? 'bg-green-600 text-white' : 'bg-gray-400 text-white'
                          }`}>
                            {tempoInfo.tempo}º TEMPO
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">
                              {tempoInfo.horario}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tempoInfo.inicio} - {tempoInfo.fim}
                            </div>
                          </div>
                        </div>

                        {aula ? (
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-800">{aula.materia}</div>
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {aula.professor_nome || 'Professor não atribuído'}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {aula.sala}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditAula(aula)}
                                className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                                title="Editar aula"
                              >
                                <Edit2 className="w-4 h-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteAula(aula.id)}
                                className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                                title="Excluir aula"
                              >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddAulaForTempo(tempoInfo.tempo, tempoInfo)}
                            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                          >
                            <Plus className="w-5 h-5" />
                            Adicionar Aula
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resumo */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-800 font-medium">Resumo do turno:</span>
                  <div className="flex gap-4 text-blue-700">
                    <span>
                      Aulas preenchidas: {horarios.filter(h => 
                        h.turma === turmaSelecionada &&
                        h.turno === turnoSelecionado &&
                        h.dia_semana === diaSelecionado
                      ).length}/{temposPorTurno[turnoSelecionado].length}
                    </span>
                    <span>
                      • Vagas disponíveis: {temposPorTurno[turnoSelecionado].length - horarios.filter(h => 
                        h.turma === turmaSelecionada &&
                        h.turno === turnoSelecionado &&
                        h.dia_semana === diaSelecionado
                      ).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Selecione uma turma para visualizar os horários
              </h3>
              <p className="text-gray-500">
                Use os filtros acima para escolher a turma, turno e dia que deseja gerenciar.
              </p>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Weekly Grid View */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Horário
                  </th>
                  {diasSemanaDisplay.map((diaDisplay, index) => (
                    <th key={diasSemana[index]} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-48">
                      {diaDisplay}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {horariosPadrao.map(horario => (
                  <tr key={horario} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 border-r">
                      {horario}
                    </td>
                    {diasSemana.map((dia, index) => {
                      const aulaDoSlot = getHorarioForSlot(dia, horario);
                      return (
                        <td key={`${dia}-${horario}`} className="px-2 py-2 align-top border-r">
                          {aulaDoSlot ? (
                            <div className="bg-green-100 border-l-4 border-green-500 p-3 rounded-lg cursor-pointer hover:bg-green-200 transition-colors group">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold text-green-800 text-sm">{aulaDoSlot.materia}</span>
                                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                                  <button
                                    onClick={() => {
                                      setSelectedHorario(aulaDoSlot);
                                      setShowModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => deleteHorario(aulaDoSlot.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-green-700">
                                <div className="font-medium text-sm mb-1">{aulaDoSlot.turma}</div>
                                <div className="text-xs text-green-600">
                                  {aulaDoSlot.hora_inicio} - {aulaDoSlot.hora_fim}
                                </div>
                                {aulaDoSlot.professor_nome && (
                                  <div className="text-xs text-green-600 mt-1">
                                    👨‍🏫 {aulaDoSlot.professor_nome}
                                  </div>
                                )}
                                <div className="text-xs text-green-600">
                                  📍 {aulaDoSlot.sala}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center hover:border-gray-300 transition-colors">
                              <button
                                onClick={() => {
                                  setSelectedHorario({
                                    id: '',
                                    dia_semana: dia,
                                    hora_inicio: horario,
                                    hora_fim: '',
                                    turma: '',
                                    materia: '',
                                    sala: 'Sala 1',
                                    turno: detectarTurno(horario),
                                    tempo: calcularTempo(horario),
                                    professor_id: undefined,
                                    professor_nome: undefined
                                  });
                                  setShowModal(true);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dia</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horário</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turma</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matéria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Professor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sala</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredHorarios.map(horario => {
                  const professor = professors.find(p => p.id === horario.professor_id);
                  return (
                    <tr key={horario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatDiaName(horario.dia_semana)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {horario.hora_inicio} - {horario.hora_fim}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{horario.turma}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{horario.materia}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {horario.professor_nome ? (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {horario.professor_nome}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 italic">Não atribuído</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{horario.sala}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedHorario(horario);
                            setShowModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteHorario(horario.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredHorarios.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum horário encontrado</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Today View - Telão friendly */
        <div className="space-y-6">
          {/* Header com relógio */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-8 text-white text-center">
            <div className="text-6xl font-bold font-mono tracking-wider mb-2">
              {getHoraFormatada()}
            </div>
            <div className="text-xl font-medium opacity-90">
              {getDataFormatada()}
            </div>
          </div>

          {/* Lista de aulas do dia */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Aulas de {getDiaAtualFormatado()}
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {getAulasDoDia().length === 0 ? (
                <div className="text-center py-16">
                  <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma aula hoje</h3>
                  <p className="text-gray-500">Não há aulas programadas para {getDiaAtualFormatado().toLowerCase()}.</p>
                </div>
              ) : (
                getAulasDoDia().map(horario => {
                  const professor = professors.find(p => p.id === horario.professor_id);
                  const presenca = getPresencaProfessor(horario.id);
                  const isAtual = isAulaAtualHoje(horario);
                  
                  return (
                    <div 
                      key={horario.id} 
                      className={`p-6 transition-all duration-300 ${
                        isAtual 
                          ? 'bg-green-50 border-l-4 border-green-500 shadow-md' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {/* Horário e Status */}
                          <div className="flex items-center gap-4 mb-3">
                            <div className={`text-2xl font-bold ${
                              isAtual ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {horario.hora_inicio} - {horario.hora_fim}
                            </div>
                            {isAtual && (
                              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                                AGORA
                              </span>
                            )}
                          </div>

                          {/* Informações da aula */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <span className="text-sm font-medium text-gray-500">Matéria</span>
                              <div className="text-lg font-semibold text-gray-800">{horario.materia}</div>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Turma</span>
                              <div className="text-lg font-semibold text-gray-800">{horario.turma}</div>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-500">Sala</span>
                              <div className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {horario.sala}
                              </div>
                            </div>
                          </div>

                          {/* Professor e presença */}
                          {professor && (
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center gap-3">
                                <User className="w-6 h-6 text-blue-600" />
                                <div>
                                  <div className="font-semibold text-gray-800">{professor.nome}</div>
                                  <div className="text-sm text-gray-600">
                                    {professor.materias?.join(', ') || 'Professor'}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Controle de presença */}
                              <div className="flex items-center gap-3">
                                {presenca?.professorPresente ? (
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-green-700">Presente</div>
                                      {presenca.horaChegada && (
                                        <button
                                          onClick={() => editarHoraChegada(horario.id)}
                                          className="text-xs text-green-600 hover:text-green-800 underline"
                                        >
                                          Chegou às {presenca.horaChegada}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <AlertCircle className="w-6 h-6 text-red-600" />
                                    <div className="text-sm font-medium text-red-700">Ausente</div>
                                  </div>
                                )}
                                
                                <button
                                  onClick={() => togglePresencaProfessor(horario.id)}
                                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    presenca?.professorPresente
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  {presenca?.professorPresente ? 'Marcar Ausente' : 'Marcar Presente'}
                                </button>
                              </div>
                            </div>
                          )}

                          {!professor && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-yellow-800">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-medium">Professor não atribuído</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">
              {selectedHorario?.id ? 'Editar Aula' : 'Nova Aula'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dia da Semana</label>
                  <select
                    name="dia"
                    defaultValue={selectedHorario?.dia_semana ? formatDiaName(selectedHorario.dia_semana) : ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="">Selecione...</option>
                    {diasSemanaDisplay.map((diaDisplay, index) => (
                      <option key={diasSemana[index]} value={diaDisplay}>{diaDisplay}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Turma</label>
                  <select
                    name="turma"
                    defaultValue={selectedHorario?.turma || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="">Selecione...</option>
                    {turmasDisponiveis.map(turma => (
                      <option key={turma} value={turma}>{turma}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Início</label>
                  <input
                    type="time"
                    name="horaInicio"
                    defaultValue={selectedHorario?.hora_inicio || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fim</label>
                  <input
                    type="time"
                    name="horaFim"
                    defaultValue={selectedHorario?.hora_fim || ''}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
                <select
                  name="materia"
                  defaultValue={selectedHorario?.materia || ''}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  {materiasDisponiveis.map(materia => (
                    <option key={materia} value={materia}>{materia}</option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
                <select
                  name="professorId"
                  defaultValue={selectedHorario?.professor_id || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="">Não atribuído</option>
                  {professors.length === 0 ? (
                    <option value="" disabled>Nenhum professor cadastrado</option>
                  ) : (
                    professors
                      .filter(p => p.status === 'ativo')
                      .map(professor => (
                        <option key={professor.id} value={professor.id}>
                          {professor.nome} - {professor.materias?.join(', ') || 'Sem matérias'}
                        </option>
                      ))
                  )}
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sala (opcional)</label>
                <input
                  type="text"
                  name="sala"
                  defaultValue={selectedHorario?.sala || 'Sala 1'}
                  placeholder="Ex: Sala 101"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              {/* Mostrar informações pré-preenchidas quando vem da visualização por turma */}
              {selectedHorario && selectedHorario.tempo && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium mb-2">📋 Informações pré-definidas:</p>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>• <strong>Tempo:</strong> {selectedHorario.tempo}° tempo</div>
                    <div>• <strong>Turno:</strong> {selectedHorario.turno}</div>
                    <div>• <strong>Dia:</strong> {selectedHorario.dia_semana}</div>
                    <div>• <strong>Horário:</strong> {selectedHorario.hora_inicio} - {selectedHorario.hora_fim}</div>
                    {selectedHorario.turma && <div>• <strong>Turma:</strong> {selectedHorario.turma}</div>}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    ℹ️ Estes campos foram preenchidos automaticamente baseados na sua seleção
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedHorario(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AuthGuard>
  );
}
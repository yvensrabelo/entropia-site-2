'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit2, Trash2, User, MapPin, Calendar, Grid3x3, List, Monitor, CheckCircle, AlertCircle } from 'lucide-react';
import { detectarTurno, calcularTempo, getDiaAtual, formatDiaName, isAulaAtual } from '@/lib/utils/horario-utils';
import { horariosService } from '@/services/horariosService';
import { professoresService } from '@/services/professoresService';
import { turmasService } from '@/services/turmasService';
import { materiasService } from '@/services/materiasService';

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

interface HorariosTabProps {
  refetchTrigger: number;
}

export default function HorariosTab({ refetchTrigger }: HorariosTabProps) {
  const [horarios, setHorarios] = useState<HorarioAula[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedHorario, setSelectedHorario] = useState<HorarioAula | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'turma'>('turma');
  const [filterDia, setFilterDia] = useState('');
  const [filterTurma, setFilterTurma] = useState('');

  const diasSemana = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
  const diasSemanaDisplay = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
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
  const [materiasDisponiveis, setMateriasDisponiveis] = useState<string[]>([]);

  const carregarDados = async () => {
    setIsLoading(true);
    try {
      // Carregar horários
      const horariosDB = await horariosService.listarHorarios();
      setHorarios(horariosDB);
      
      // Carregar professores
      const professoresDB = await professoresService.listarProfessores(true); // apenas ativos
      setProfessors(professoresDB);
      
      // Carregar turmas do sistema
      const turmasDB = await turmasService.listarTurmasSistema(true);
      const nomesTurmas = turmasDB.map(t => t.nome || t.codigo);
      setTurmasDisponiveis(nomesTurmas);
      
      // Carregar matérias
      const materiasDB = await materiasService.listarMaterias(true);
      const nomesMaterias = materiasDB.map(m => m.nome);
      setMateriasDisponiveis(nomesMaterias);
      
      console.log('📅 [HORARIOS TAB] Dados carregados:', {
        horarios: horariosDB.length,
        professores: professoresDB.length,
        turmas: nomesTurmas.length,
        materias: nomesMaterias.length,
      });
      
      // Log detalhado dos horários com professor
      console.log('📅 [HORARIOS TAB] Horários com detalhes:', 
        horariosDB.map(h => ({
          id: h.id,
          materia: h.materia,
          professor_id: h.professor_id,
          professor_nome: h.professor_nome,
          dia: h.dia_semana,
          hora: h.hora_inicio
        }))
      );
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [refetchTrigger]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      
      const professorId = formData.get('professorId') as string;
      const professorIdValid = professorId && professorId.trim() !== '' ? professorId : undefined;
      const professor = professorIdValid ? professors.find(p => p.id === professorIdValid) : undefined;
      const horaInicio = formData.get('horaInicio') as string;
      const horaFim = formData.get('horaFim') as string;
      
      const diaFormulario = formData.get('dia') as string;
      const diaCorreto = diaFormulario.toLowerCase();
      
      const horarioData: HorarioAula = {
        id: selectedHorario?.id || Date.now().toString(),
        dia_semana: diaCorreto,
        hora_inicio: horaInicio,
        hora_fim: horaFim,
        professor_id: professorIdValid,
        professor_nome: professor?.nome,
        materia: formData.get('materia') as string,
        turma: formData.get('turma') as string,
        sala: formData.get('sala') as string || 'Sala 1',
        turno: detectarTurno(horaInicio),
        tempo: calcularTempo(horaInicio)
      };

      console.log('📅 [HORARIOS TAB] Salvando aula:', horarioData);
      console.log('📅 [HORARIOS TAB] Professor selecionado:', { professorId, professorIdValid, professor });

      if (selectedHorario?.id) {
        const resultado = await horariosService.atualizarHorario(selectedHorario.id, horarioData);
        console.log('📅 [HORARIOS TAB] Resultado da atualização:', resultado);
      } else {
        await horariosService.criarHorario(horarioData);
      }
      
      await carregarDados(); // Aguardar o carregamento
      setShowModal(false);
      setSelectedHorario(null);
      alert('Horário salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
      alert('Erro ao salvar horário');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteHorario = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este horário?')) {
      try {
        await horariosService.excluirHorario(id);
        carregarDados();
        alert('Horário excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir horário:', error);
        alert('Erro ao excluir horário');
      }
    }
  };

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

  const getHorarioForSlot = (dia: string, horaInicio: string) => {
    return horarios.find(h => h.dia_semana === dia && h.hora_inicio === horaInicio);
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Grade de Horários</h2>
        <p className="text-gray-600 mt-1">Gerencie a grade de horários semanal</p>
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

      {/* Content */}
      {viewMode === 'turma' ? (
        /* Nova visualização por Turma */
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
                  <option value="domingo">Domingo</option>
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
                              <div className={`text-sm flex items-center gap-1 ${
                                aula.professor_nome ? 'text-green-600' : 'text-orange-600'
                              }`}>
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
      ) : (
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

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
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
  );
}
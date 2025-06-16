'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, Filter, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase-singleton';

interface Descritor {
  id: number;
  horario_id: number;
  data: string;
  descricao: string;
  preenchido_em: string;
  horario?: {
    dia_semana: string;
    hora_inicio: string;
    hora_fim: string;
    materia: string;
    turma: string;
    sala: string;
    professor?: {
      nome: string;
      numero: number;
    };
  };
}

interface HorarioAula {
  id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
  materia: string;
  turma: string;
  sala: string;
  professor_id: number;
  professor?: {
    nome: string;
    numero: number;
  };
}

export default function DescritoresPage() {
  const [descritores, setDescritores] = useState<Descritor[]>([]);
  const [horarios, setHorarios] = useState<HorarioAula[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'filled' | 'pending'>('all');

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar descritores da data selecionada
      const { data: descritoresData, error: descritoresError } = await supabase
        .from('descritores')
        .select(`
          *,
          horario:horarios_aulas(
            *,
            professor:professores(nome, numero)
          )
        `)
        .eq('data', selectedDate);

      if (descritoresError) throw descritoresError;

      // Buscar todos os horários para comparar
      const { data: horariosData, error: horariosError } = await supabase
        .from('horarios_aulas')
        .select(`
          *,
          professor:professores(nome, numero)
        `)
        .order('hora_inicio');

      if (horariosError) throw horariosError;

      setDescritores(descritoresData || []);
      setHorarios(horariosData || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayOfWeek = (date: string) => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[new Date(date + 'T00:00:00').getDay()];
  };

  const getHorariosOfDay = () => {
    const dayOfWeek = getDayOfWeek(selectedDate);
    return horarios.filter(h => h.dia_semana === dayOfWeek);
  };

  const getDescritorForHorario = (horarioId: number) => {
    return descritores.find(d => d.horario_id === horarioId);
  };

  const getStatusStats = () => {
    const horariosOfDay = getHorariosOfDay();
    const filled = horariosOfDay.filter(h => getDescritorForHorario(h.id)).length;
    const pending = horariosOfDay.length - filled;
    
    return { total: horariosOfDay.length, filled, pending };
  };

  const getFilteredHorarios = () => {
    const horariosOfDay = getHorariosOfDay();
    
    switch (filterStatus) {
      case 'filled':
        return horariosOfDay.filter(h => getDescritorForHorario(h.id));
      case 'pending':
        return horariosOfDay.filter(h => !getDescritorForHorario(h.id));
      default:
        return horariosOfDay;
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const formatDate = (date: string) => {
    return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const stats = getStatusStats();
  const filteredHorarios = getFilteredHorarios();

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoramento de Descritores</h1>
          <p className="text-gray-600">Acompanhe o preenchimento dos descritores de aula</p>
        </div>
        <button
          onClick={fetchData}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">Todos</option>
              <option value="filled">Preenchidos</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>

          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">
              {formatDate(selectedDate)} - {getDayOfWeek(selectedDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Aulas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Preenchidos</p>
              <p className="text-2xl font-bold text-green-900">{stats.filled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-orange-900">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold">%</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Progresso</p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.total > 0 ? Math.round((stats.filled / stats.total) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Aulas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Aulas do Dia ({filteredHorarios.length})
          </h3>
        </div>

        {filteredHorarios.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Nenhuma aula encontrada
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {stats.total === 0 
                ? 'Não há aulas programadas para este dia.'
                : 'Tente ajustar os filtros.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredHorarios.map((horario) => {
              const descritor = getDescritorForHorario(horario.id);
              const isPreenchido = !!descritor;

              return (
                <div
                  key={horario.id}
                  className={`p-6 ${isPreenchido ? 'bg-green-50' : 'bg-orange-50'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {horario.materia}
                        </h4>
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isPreenchido
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {isPreenchido ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Preenchido
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Pendente
                            </>
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Horário:</span>
                          <br />
                          {formatTime(horario.hora_inicio)} - {formatTime(horario.hora_fim)}
                        </div>
                        <div>
                          <span className="font-medium">Turma:</span>
                          <br />
                          {horario.turma}
                        </div>
                        {horario.sala && (
                          <div>
                            <span className="font-medium">Sala:</span>
                            <br />
                            {horario.sala}
                          </div>
                        )}
                        {horario.professor && (
                          <div>
                            <span className="font-medium">Professor:</span>
                            <br />
                            {horario.professor.nome} (#{horario.professor.numero})
                          </div>
                        )}
                      </div>

                      {descritor && (
                        <div className="mt-4 p-3 bg-white rounded border">
                          <h5 className="font-medium text-gray-900 mb-2">Descritor:</h5>
                          <p className="text-gray-700 whitespace-pre-wrap">{descritor.descricao}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            Preenchido em: {new Date(descritor.preenchido_em).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
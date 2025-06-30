'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Plus, Edit, Trash, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase-singleton';

interface Horario {
  id: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
  materia: string;
  turma: string;
  sala: string;
  professor_id: number | null;
  professor_nome?: string;
}

interface Professor {
  id: number;
  numero: number;
  nome: string;
  cpf: string;
}

const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
const horarios = [
  '07:00', '07:50', '08:40', '09:30', '10:20', '11:10',
  '13:00', '13:50', '14:40', '15:30', '16:20', '17:10',
  '19:00', '19:50', '20:40'
];

export default function HorariosPage() {
  const [horariosList, setHorariosList] = useState<Horario[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null);
  const [formData, setFormData] = useState({
    dia_semana: '',
    hora_inicio: '',
    hora_fim: '',
    materia: '',
    turma: '',
    sala: '',
    professor_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar horários com dados do professor
      const { data: horariosData, error: horariosError } = await supabase
        .from('horarios_aulas')
        .select(`
          *,
          professor:professores(nome)
        `)
        .order('dia_semana')
        .order('hora_inicio');

      if (horariosError) throw horariosError;

      // Buscar professores
      const { data: professoresData, error: professoresError } = await supabase
        .from('professores')
        .select('*')
        .order('nome');

      if (professoresError) throw professoresError;

      const horariosFormatted = (horariosData || []).map(h => ({
        ...h,
        professor_nome: h.professor?.nome || null
      }));

      setHorariosList(horariosFormatted);
      setProfessores(professoresData || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const horarioData = {
        dia_semana: formData.dia_semana,
        hora_inicio: formData.hora_inicio,
        hora_fim: formData.hora_fim,
        materia: formData.materia,
        turma: formData.turma,
        sala: formData.sala,
        professor_id: formData.professor_id ? parseInt(formData.professor_id) : null
      };

      if (editingHorario) {
        const { error } = await supabase
          .from('horarios_aulas')
          .update(horarioData)
          .eq('id', editingHorario.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('horarios_aulas')
          .insert([horarioData]);

        if (error) throw error;
      }

      setShowModal(false);
      setEditingHorario(null);
      setFormData({
        dia_semana: '',
        hora_inicio: '',
        hora_fim: '',
        materia: '',
        turma: '',
        sala: '',
        professor_id: ''
      });
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar horário:', error);
      alert('Erro ao salvar horário');
    }
  };

  const handleEdit = (horario: Horario) => {
    setEditingHorario(horario);
    setFormData({
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fim: horario.hora_fim,
      materia: horario.materia,
      turma: horario.turma,
      sala: horario.sala,
      professor_id: horario.professor_id?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este horário?')) return;

    try {
      const { error } = await supabase
        .from('horarios_aulas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir horário:', error);
      alert('Erro ao excluir horário');
    }
  };

  const getHorarioForSlot = (dia: string, hora: string) => {
    return horariosList.find(h => h.dia_semana === dia && h.hora_inicio === hora);
  };

  const getNextHour = (hour: string) => {
    const currentIndex = horarios.indexOf(hour);
    return currentIndex < horarios.length - 1 ? horarios[currentIndex + 1] : '';
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Grade de Horários</h1>
          <p className="text-gray-600">Gerencie os horários das aulas</p>
        </div>
        <button
          onClick={() => {
            setEditingHorario(null);
            setFormData({
              dia_semana: '',
              hora_inicio: '',
              hora_fim: '',
              materia: '',
              turma: '',
              sala: '',
              professor_id: ''
            });
            setShowModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Aula
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Aulas</p>
              <p className="text-2xl font-bold text-gray-900">{horariosList.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Com Professor</p>
              <p className="text-2xl font-bold text-gray-900">
                {horariosList.filter(h => h.professor_id).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grade de Horários */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                  Horário
                </th>
                {diasSemana.map((dia) => (
                  <th key={dia} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {horarios.map((hora) => (
                <tr key={hora} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r bg-gray-50">
                    {hora} - {getNextHour(hora)}
                  </td>
                  {diasSemana.map((dia) => {
                    const horario = getHorarioForSlot(dia, hora);
                    
                    return (
                      <td key={`${dia}-${hora}`} className="px-2 py-2 border-r">
                        {horario ? (
                          <div className="bg-blue-100 border-l-4 border-blue-500 p-2 rounded text-xs">
                            <div className="font-semibold text-blue-900">{horario.materia}</div>
                            <div className="text-blue-700">Turma: {horario.turma}</div>
                            {horario.sala && (
                              <div className="text-blue-600">Sala: {horario.sala}</div>
                            )}
                            {horario.professor_nome && (
                              <div className="text-blue-600">Prof: {horario.professor_nome}</div>
                            )}
                            <div className="flex gap-1 mt-1">
                              <button
                                onClick={() => handleEdit(horario)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDelete(horario.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-16 border-2 border-dashed border-gray-200 rounded flex items-center justify-center">
                            <button
                              onClick={() => {
                                setEditingHorario(null);
                                setFormData({
                                  dia_semana: dia,
                                  hora_inicio: hora,
                                  hora_fim: getNextHour(hora),
                                  materia: '',
                                  turma: '',
                                  sala: '',
                                  professor_id: ''
                                });
                                setShowModal(true);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Plus className="w-4 h-4" />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingHorario ? 'Editar Aula' : 'Nova Aula'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dia da Semana
                    </label>
                    <select
                      required
                      value={formData.dia_semana}
                      onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Selecione</option>
                      {diasSemana.map(dia => (
                        <option key={dia} value={dia}>{dia}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora Início
                    </label>
                    <select
                      required
                      value={formData.hora_inicio}
                      onChange={(e) => {
                        const horaInicio = e.target.value;
                        const horaFim = getNextHour(horaInicio);
                        setFormData({ 
                          ...formData, 
                          hora_inicio: horaInicio,
                          hora_fim: horaFim
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Selecione</option>
                      {horarios.map(hora => (
                        <option key={hora} value={hora}>{hora}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora Fim
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.hora_fim}
                      onChange={(e) => setFormData({ ...formData, hora_fim: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sala
                    </label>
                    <input
                      type="text"
                      value={formData.sala}
                      onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Ex: A1, B2"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Matéria
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.materia}
                    onChange={(e) => setFormData({ ...formData, materia: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: Matemática, Português"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Turma
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.turma}
                    onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ex: 1º Ano A, 2º Ano B"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professor
                  </label>
                  <select
                    value={formData.professor_id}
                    onChange={(e) => setFormData({ ...formData, professor_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Nenhum professor</option>
                    {professores.map(prof => (
                      <option key={prof.id} value={prof.id}>
                        {prof.nome} (#{prof.numero})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
                  >
                    {editingHorario ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
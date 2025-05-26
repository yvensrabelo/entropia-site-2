'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import { TurmaConfig, TURNOS } from '@/types/turma';
import { Users, Plus, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';

export default function TurmasConfigPage() {
  const [turmas, setTurmas] = useState<TurmaConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTurmas();
  }, []);

  const fetchTurmas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('turmas_config')
        .select('*')
        .order('codigo', { ascending: true })
        .order('nome', { ascending: true })
        .order('turno', { ascending: true });

      if (error) throw error;
      setTurmas(data || []);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('turmas_config')
        .update({ ativo: !ativo })
        .eq('id', id);

      if (error) throw error;
      
      // Atualizar lista local
      setTurmas(turmas.map(t => 
        t.id === id ? { ...t, ativo: !ativo } : t
      ));
    } catch (error) {
      console.error('Erro ao atualizar status da turma:', error);
      alert('Erro ao atualizar status da turma');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.')) return;

    try {
      const { error } = await supabase
        .from('turmas_config')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Atualizar lista local
      setTurmas(turmas.filter(t => t.id !== id));
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      alert('Erro ao excluir turma. Verifique se não há matrículas vinculadas.');
    }
  };

  const getOcupacaoPercentual = (turma: TurmaConfig) => {
    return Math.round((turma.vagas_ocupadas / turma.capacidade_maxima) * 100);
  };

  const getOcupacaoColor = (percentual: number) => {
    if (percentual >= 90) return 'text-red-600 bg-red-50';
    if (percentual >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <AuthGuard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Configuração de Turmas</h1>
            <p className="text-gray-600 mt-1">Gerencie as turmas e suas vagas</p>
          </div>
          <Link
            href="/admin/dashboard/turmas-config/nova"
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nova Turma
          </Link>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Turmas</p>
                <p className="text-2xl font-bold text-gray-800">{turmas.length}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Turmas Ativas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {turmas.filter(t => t.ativo).length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total de Vagas Ocupadas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {turmas.reduce((total, t) => total + t.vagas_ocupadas, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Lista de turmas */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : turmas.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma turma cadastrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Turno
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ocupação
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {turmas.map((turma) => {
                    const ocupacaoPercentual = getOcupacaoPercentual(turma);
                    return (
                      <tr key={turma.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{turma.codigo}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{turma.nome}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{TURNOS[turma.turno]}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-900">
                              {turma.vagas_ocupadas}/{turma.capacidade_maxima}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getOcupacaoColor(ocupacaoPercentual)}`}>
                              {ocupacaoPercentual}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleAtivo(turma.id, turma.ativo)}
                            className={`px-3 py-1 text-xs rounded-full font-semibold ${
                              turma.ativo
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {turma.ativo ? 'Ativa' : 'Inativa'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/dashboard/turmas-config/${turma.id}/editar`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(turma.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
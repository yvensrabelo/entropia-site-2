'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import { formatCPF } from '@/lib/utils/cpf';
import { Calendar, Clock, Users, Filter, Download, CheckCircle, XCircle, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import AuthGuard from '@/components/admin/AuthGuard';

interface Presenca {
  id: string;
  aluno_id: string;
  data: string;
  hora_entrada: string;
  hora_saida?: string;
  tipo: string;
  enrollid_catraca?: number;
  observacoes?: string;
  aluno: {
    nome: string;
    cpf: string;
  };
  matricula?: {
    turma: {
      nome: string;
      turno: string;
    };
  };
}

interface Estatisticas {
  totalPresentes: number;
  totalAlunos: number;
  percentualPresenca: number;
  presencasPorTurma: Array<{
    turma: string;
    turno: string;
    presentes: number;
    total: number;
    percentual: number;
  }>;
}

export default function PresencasPage() {
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataFiltro, setDataFiltro] = useState(new Date().toISOString().split('T')[0]);
  const [turmaFiltro, setTurmaFiltro] = useState('todas');
  const [turmas, setTurmas] = useState<Array<{ id: string; nome: string; turno: string }>>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    totalPresentes: 0,
    totalAlunos: 0,
    percentualPresenca: 0,
    presencasPorTurma: []
  });

  useEffect(() => {
    fetchTurmas();
  }, []);

  useEffect(() => {
    fetchPresencas();
    fetchEstatisticas();
  }, [dataFiltro, turmaFiltro]);

  const fetchTurmas = async () => {
    try {
      const { data, error } = await supabase
        .from('turmas_config')
        .select('id, nome, turno')
        .order('nome');

      if (error) throw error;
      setTurmas(data || []);
    } catch (error) {
      console.error('Erro ao buscar turmas:', error);
    }
  };

  const fetchPresencas = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('presencas')
        .select(`
          *,
          aluno:alunos(nome, cpf),
          matricula:matriculas!inner(
            turma:turmas_config!inner(id, nome, turno)
          )
        `)
        .eq('data', dataFiltro)
        .order('hora_entrada', { ascending: false });

      // Filtro por turma se necessário
      if (turmaFiltro !== 'todas') {
        query = query.eq('matricula.turma.id', turmaFiltro);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPresencas(data || []);
    } catch (error) {
      console.error('Erro ao buscar presenças:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstatisticas = async () => {
    try {
      // Total de alunos ativos
      const { count: totalAlunos } = await supabase
        .from('matriculas')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ativa');

      // Presentes no dia
      const { count: totalPresentes } = await supabase
        .from('presencas')
        .select('*', { count: 'exact', head: true })
        .eq('data', dataFiltro);

      // Estatísticas por turma
      const { data: turmasData } = await supabase
        .from('turmas_config')
        .select(`
          id,
          nome,
          turno,
          matriculas!inner(
            id,
            status,
            aluno:alunos!inner(
              id,
              presencas!left(data)
            )
          )
        `)
        .eq('matriculas.status', 'ativa');

      const presencasPorTurma = turmasData?.map(turma => {
        const totalTurma = turma.matriculas.length;
        const presentesTurma = turma.matriculas.filter((mat: any) => 
          mat.aluno.presencas?.some((p: any) => p.data === dataFiltro)
        ).length;

        return {
          turma: turma.nome,
          turno: turma.turno,
          presentes: presentesTurma,
          total: totalTurma,
          percentual: totalTurma > 0 ? (presentesTurma / totalTurma) * 100 : 0
        };
      }) || [];

      setEstatisticas({
        totalPresentes: totalPresentes || 0,
        totalAlunos: totalAlunos || 0,
        percentualPresenca: totalAlunos ? ((totalPresentes || 0) / totalAlunos) * 100 : 0,
        presencasPorTurma
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const exportarPresencas = () => {
    const dataExport = presencas.map(p => ({
      Aluno: p.aluno.nome,
      CPF: formatCPF(p.aluno.cpf),
      Turma: p.matricula?.turma.nome || '-',
      Turno: p.matricula?.turma.turno || '-',
      'Hora Entrada': p.hora_entrada,
      'Hora Saída': p.hora_saida || '-',
      Tipo: p.tipo,
      Observações: p.observacoes || '-'
    }));

    const csv = [
      Object.keys(dataExport[0] || {}).join(','),
      ...dataExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presencas_${dataFiltro}.csv`;
    a.click();
  };

  return (
    <AuthGuard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Controle de Presenças</h1>
            <p className="text-gray-600 mt-1">Registro de entrada dos alunos via catraca</p>
          </div>
          <Link
            href="/admin/dashboard/presencas/registrar"
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Registrar Manual
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={dataFiltro}
                  onChange={(e) => setDataFiltro(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turma
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={turmaFiltro}
                  onChange={(e) => setTurmaFiltro(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                  <option value="todas">Todas as turmas</option>
                  {turmas.map(turma => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome} - {turma.turno}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={exportarPresencas}
                disabled={presencas.length === 0}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                Exportar CSV
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-green-600">
                {estatisticas.percentualPresenca.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500">Presença Geral</h3>
            <p className="text-lg font-semibold text-gray-800 mt-1">
              {estatisticas.totalPresentes} de {estatisticas.totalAlunos} alunos
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500">Horário de Pico</h3>
            <p className="text-lg font-semibold text-gray-800 mt-1">
              07:00 - 08:00
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500">Turma com Maior Presença</h3>
            <p className="text-lg font-semibold text-gray-800 mt-1">
              {estatisticas.presencasPorTurma.sort((a, b) => b.percentual - a.percentual)[0]?.turma || '-'}
            </p>
          </div>
        </div>

        {/* Estatísticas por turma */}
        {estatisticas.presencasPorTurma.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Presença por Turma</h2>
            <div className="space-y-3">
              {estatisticas.presencasPorTurma.map((turma, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      {turma.turma} - {turma.turno}
                    </p>
                    <p className="text-sm text-gray-500">
                      {turma.presentes} de {turma.total} alunos
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${turma.percentual}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-12 text-right">
                      {turma.percentual.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lista de presenças */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              Registros do Dia
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : presencas.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Nenhuma presença registrada para esta data
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPF
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Turma
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entrada
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saída
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {presencas.map((presenca) => (
                    <tr key={presenca.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {presenca.aluno.nome}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatCPF(presenca.aluno.cpf)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {presenca.matricula?.turma.nome || '-'} 
                          {presenca.matricula?.turma.turno && ` (${presenca.matricula.turma.turno})`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{presenca.hora_entrada}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{presenca.hora_saida || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          presenca.tipo === 'catraca' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {presenca.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {presenca.observacoes || '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
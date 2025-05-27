'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  Award, 
  AlertTriangle,
  Download,
  FileText,
  Filter,
  Sun,
  Moon,
  Sunset
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AuthGuard from '@/components/admin/AuthGuard';
import { supabase } from '@/lib/supabase-singleton';
import jsPDF from 'jspdf';

interface TurmaStats {
  id: string;
  nome: string;
  turno: string;
  total_alunos: number;
  total_presencas: number;
  total_aulas: number;
  frequencia_media: number;
  alunos_frequentes: number;
  alunos_risco: number;
  ranking: number;
}

interface TurnoStats {
  turno: string;
  total_turmas: number;
  total_alunos: number;
  frequencia_media: number;
  color: string;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function RelatorioTurmasPage() {
  const [loading, setLoading] = useState(true);
  const [dadosTurmas, setDadosTurmas] = useState<TurmaStats[]>([]);
  const [dadosTurnos, setDadosTurnos] = useState<TurnoStats[]>([]);
  const [dataInicial, setDataInicial] = useState(() => {
    const data = new Date();
    data.setDate(data.getDate() - 30);
    return data.toISOString().split('T')[0];
  });
  const [dataFinal, setDataFinal] = useState(new Date().toISOString().split('T')[0]);
  const [turnoFiltro, setTurnoFiltro] = useState('');

  useEffect(() => {
    carregarRelatorio();
  }, [dataInicial, dataFinal, turnoFiltro]);

  const carregarRelatorio = async () => {
    setLoading(true);
    try {
      // Buscar todas as turmas com seus alunos e presenças
      let query = supabase
        .from('turmas_config')
        .select(`
          id,
          nome,
          turno,
          matriculas!inner(
            aluno_id,
            alunos!inner(
              id,
              nome
            )
          )
        `);

      if (turnoFiltro) {
        query = query.eq('turno', turnoFiltro);
      }

      const { data: turmasData, error: turmasError } = await query;
      
      if (turmasError) throw turmasError;

      // Buscar presenças do período
      const { data: presencasData, error: presencasError } = await supabase
        .from('presencas')
        .select(`
          aluno_id,
          data,
          alunos!inner(
            matriculas!inner(
              turmas_config!inner(id, nome, turno)
            )
          )
        `)
        .gte('data', dataInicial)
        .lte('data', dataFinal);

      if (presencasError) throw presencasError;

      // Calcular dias úteis no período
      const diasUteis = calcularDiasUteis(new Date(dataInicial), new Date(dataFinal));

      // Processar dados por turma
      const statsPorTurma = new Map<string, TurmaStats>();

      turmasData?.forEach((turma: any) => {
        const totalAlunos = turma.matriculas?.length || 0;
        
        statsPorTurma.set(turma.id, {
          id: turma.id,
          nome: turma.nome,
          turno: turma.turno,
          total_alunos: totalAlunos,
          total_presencas: 0,
          total_aulas: diasUteis * totalAlunos,
          frequencia_media: 0,
          alunos_frequentes: 0,
          alunos_risco: 0,
          ranking: 0
        });
      });

      // Calcular presenças por turma
      const presencasPorAlunoTurma = new Map<string, Map<string, number>>();

      presencasData?.forEach((presenca: any) => {
        const turmaId = presenca.alunos?.matriculas?.[0]?.turmas_config?.id;
        const alunoId = presenca.aluno_id;

        if (turmaId && alunoId) {
          if (!presencasPorAlunoTurma.has(turmaId)) {
            presencasPorAlunoTurma.set(turmaId, new Map());
          }
          
          const presencasAluno = presencasPorAlunoTurma.get(turmaId)!;
          presencasAluno.set(alunoId, (presencasAluno.get(alunoId) || 0) + 1);
        }
      });

      // Calcular estatísticas finais
      presencasPorAlunoTurma.forEach((presencasAlunos, turmaId) => {
        const stats = statsPorTurma.get(turmaId);
        if (!stats) return;

        let totalPresencas = 0;
        let alunosFrequentes = 0;
        let alunosRisco = 0;

        presencasAlunos.forEach((presencas, alunoId) => {
          totalPresencas += presencas;
          const frequenciaAluno = diasUteis > 0 ? (presencas / diasUteis) * 100 : 0;
          
          if (frequenciaAluno >= 75) {
            alunosFrequentes++;
          } else {
            alunosRisco++;
          }
        });

        stats.total_presencas = totalPresencas;
        stats.frequencia_media = stats.total_aulas > 0 
          ? (totalPresencas / stats.total_aulas) * 100 
          : 0;
        stats.alunos_frequentes = alunosFrequentes;
        stats.alunos_risco = alunosRisco;
      });

      // Adicionar turmas sem presenças (com frequência 0)
      statsPorTurma.forEach((stats, turmaId) => {
        if (!presencasPorAlunoTurma.has(turmaId)) {
          stats.alunos_risco = stats.total_alunos;
        }
      });

      // Converter para array e ordenar por frequência
      const dadosArray = Array.from(statsPorTurma.values())
        .sort((a, b) => b.frequencia_media - a.frequencia_media)
        .map((dados, index) => ({
          ...dados,
          ranking: index + 1
        }));

      setDadosTurmas(dadosArray);

      // Calcular dados por turno
      const statsPorTurno = new Map<string, TurnoStats>();
      
      dadosArray.forEach(turma => {
        if (!statsPorTurno.has(turma.turno)) {
          statsPorTurno.set(turma.turno, {
            turno: turma.turno,
            total_turmas: 0,
            total_alunos: 0,
            frequencia_media: 0,
            color: getTurnoColor(turma.turno)
          });
        }
        
        const stats = statsPorTurno.get(turma.turno)!;
        stats.total_turmas++;
        stats.total_alunos += turma.total_alunos;
      });

      // Calcular média de frequência por turno
      statsPorTurno.forEach((stats, turno) => {
        const turmasDoTurno = dadosArray.filter(t => t.turno === turno);
        stats.frequencia_media = turmasDoTurno.length > 0
          ? turmasDoTurno.reduce((acc, curr) => acc + curr.frequencia_media, 0) / turmasDoTurno.length
          : 0;
      });

      setDadosTurnos(Array.from(statsPorTurno.values()));

    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularDiasUteis = (inicio: Date, fim: Date): number => {
    let diasUteis = 0;
    const atual = new Date(inicio);
    
    while (atual <= fim) {
      const diaSemana = atual.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) { // Não é domingo nem sábado
        diasUteis++;
      }
      atual.setDate(atual.getDate() + 1);
    }
    
    return diasUteis;
  };

  const getTurnoColor = (turno: string): string => {
    switch (turno.toLowerCase()) {
      case 'manhã': return '#f59e0b';
      case 'tarde': return '#3b82f6';
      case 'noite': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getTurnoIcon = (turno: string) => {
    switch (turno.toLowerCase()) {
      case 'manhã': return <Sun className="w-5 h-5" />;
      case 'tarde': return <Sunset className="w-5 h-5" />;
      case 'noite': return <Moon className="w-5 h-5" />;
      default: return <Users className="w-5 h-5" />;
    }
  };

  const dadosFiltrados = turnoFiltro
    ? dadosTurmas.filter(turma => turma.turno === turnoFiltro)
    : dadosTurmas;

  const estatisticasGerais = {
    totalTurmas: dadosTurmas.length,
    totalAlunos: dadosTurmas.reduce((acc, curr) => acc + curr.total_alunos, 0),
    frequenciaGeral: dadosTurmas.length > 0
      ? dadosTurmas.reduce((acc, curr) => acc + curr.frequencia_media, 0) / dadosTurmas.length
      : 0,
    melhorTurma: dadosTurmas[0]?.nome || '-'
  };

  const exportarCSV = () => {
    const headers = ['Ranking', 'Turma', 'Turno', 'Total Alunos', 'Frequência %', 'Frequentes', 'Em Risco'];
    const csvContent = [
      headers.join(','),
      ...dadosFiltrados.map(turma => [
        turma.ranking,
        `"${turma.nome}"`,
        turma.turno,
        turma.total_alunos,
        turma.frequencia_media.toFixed(1),
        turma.alunos_frequentes,
        turma.alunos_risco
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-turmas-${dataInicial}-${dataFinal}.csv`;
    link.click();
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(18);
    doc.text('Relatório por Turma', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Período: ${new Date(dataInicial).toLocaleDateString('pt-BR')} a ${new Date(dataFinal).toLocaleDateString('pt-BR')}`, 20, 35);
    
    // Estatísticas
    doc.text(`Total de Turmas: ${estatisticasGerais.totalTurmas}`, 20, 50);
    doc.text(`Total de Alunos: ${estatisticasGerais.totalAlunos}`, 20, 60);
    doc.text(`Frequência Geral: ${estatisticasGerais.frequenciaGeral.toFixed(1)}%`, 20, 70);
    doc.text(`Melhor Turma: ${estatisticasGerais.melhorTurma}`, 20, 80);
    
    // Ranking
    let y = 100;
    doc.setFontSize(10);
    doc.text('Pos', 20, y);
    doc.text('Turma', 40, y);
    doc.text('Turno', 100, y);
    doc.text('Alunos', 130, y);
    doc.text('Freq%', 160, y);
    
    dadosFiltrados.slice(0, 25).forEach((turma, index) => {
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(turma.ranking.toString(), 20, y);
      doc.text(turma.nome.substring(0, 20), 40, y);
      doc.text(turma.turno, 100, y);
      doc.text(turma.total_alunos.toString(), 130, y);
      doc.text(`${turma.frequencia_media.toFixed(1)}%`, 160, y);
    });
    
    doc.save(`relatorio-turmas-${dataInicial}-${dataFinal}.pdf`);
  };

  return (
    <AuthGuard>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard/relatorios"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Relatórios
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Relatório por Turma</h1>
              <p className="text-gray-600 mt-1">Comparativo de performance entre turmas</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={exportarCSV}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={exportarPDF}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={dataInicial}
                onChange={(e) => setDataInicial(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={dataFinal}
                onChange={(e) => setDataFinal(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turno
              </label>
              <select
                value={turnoFiltro}
                onChange={(e) => setTurnoFiltro(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Todos os turnos</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
                <option value="Noite">Noite</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Turmas</p>
                <p className="text-2xl font-bold text-gray-800">{estatisticasGerais.totalTurmas}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-gray-800">{estatisticasGerais.totalAlunos}</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Frequência Geral</p>
                <p className="text-2xl font-bold text-gray-800">{estatisticasGerais.frequenciaGeral.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Melhor Turma</p>
                <p className="text-lg font-bold text-gray-800">{estatisticasGerais.melhorTurma}</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Gráfico de Barras - Frequência por Turma */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Frequência por Turma</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosFiltrados.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="nome" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Frequência']}
                  />
                  <Bar 
                    dataKey="frequencia_media" 
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico Pizza - Distribuição por Turno */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição por Turno</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosTurnos}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="total_alunos"
                    label={({ turno, total_alunos }) => `${turno}: ${total_alunos}`}
                  >
                    {dadosTurnos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Estatísticas por Turno */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance por Turno</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dadosTurnos.map((turno) => (
              <div key={turno.turno} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div style={{ color: turno.color }}>
                    {getTurnoIcon(turno.turno)}
                  </div>
                  <h4 className="font-semibold text-gray-800">{turno.turno}</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Turmas:</span>
                    <span className="font-medium">{turno.total_turmas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Alunos:</span>
                    <span className="font-medium">{turno.total_alunos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Frequência:</span>
                    <span className="font-medium">{turno.frequencia_media.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking de Turmas */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Ranking de Turmas</h3>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Carregando dados...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Turma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Turno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alunos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequência
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequentes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Em Risco
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dadosFiltrados.map((turma) => (
                    <tr key={turma.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {turma.ranking <= 3 && (
                            <Award className={`w-5 h-5 mr-2 ${
                              turma.ranking === 1 ? 'text-yellow-500' :
                              turma.ranking === 2 ? 'text-gray-400' :
                              'text-orange-500'
                            }`} />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            #{turma.ranking}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{turma.nome}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div style={{ color: getTurnoColor(turma.turno) }}>
                            {getTurnoIcon(turma.turno)}
                          </div>
                          <span className="text-sm text-gray-900">{turma.turno}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {turma.total_alunos}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(turma.frequencia_media, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {turma.frequencia_media.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {turma.alunos_frequentes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center text-sm font-medium ${
                          turma.alunos_risco > 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {turma.alunos_risco > 0 && <AlertTriangle className="w-4 h-4 mr-1" />}
                          {turma.alunos_risco}
                        </span>
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
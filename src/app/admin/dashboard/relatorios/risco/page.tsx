'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  AlertTriangle, 
  Clock, 
  Calendar,
  Phone,
  Mail,
  User,
  Download,
  FileText,
  Filter,
  Search,
  MessageSquare,
  Target,
  TrendingDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AuthGuard from '@/components/admin/AuthGuard';
import { supabase } from '@/lib/supabase-client';
import { formatCPF } from '@/lib/utils/cpf';
import jsPDF from 'jspdf';

interface AlunoRisco {
  id: string;
  nome: string;
  cpf: string;
  telefone?: string;
  email?: string;
  turma: string;
  turno: string;
  total_aulas: number;
  presencas: number;
  faltas: number;
  frequencia: number;
  faltas_consecutivas: number;
  ultimo_comparecimento?: string;
  dias_sem_comparecer: number;
  nivel_risco: 'critico' | 'alerta' | 'moderado';
}

interface EstatisticasRisco {
  total_alunos_risco: number;
  criticos: number;
  alertas: number;
  moderados: number;
  media_frequencia: number;
}

export default function RelatorioRiscoPage() {
  const [loading, setLoading] = useState(true);
  const [alunosRisco, setAlunosRisco] = useState<AlunoRisco[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasRisco>({
    total_alunos_risco: 0,
    criticos: 0,
    alertas: 0,
    moderados: 0,
    media_frequencia: 0
  });
  const [dataInicial, setDataInicial] = useState(() => {
    const data = new Date();
    data.setDate(data.getDate() - 30);
    return data.toISOString().split('T')[0];
  });
  const [dataFinal, setDataFinal] = useState(new Date().toISOString().split('T')[0]);
  const [nivelFiltro, setNivelFiltro] = useState('');
  const [turmaFiltro, setTurmaFiltro] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [turmas, setTurmas] = useState<any[]>([]);

  useEffect(() => {
    carregarTurmas();
    carregarAlunosRisco();
  }, [dataInicial, dataFinal, nivelFiltro, turmaFiltro]);

  const carregarTurmas = async () => {
    try {
      const { data, error } = await supabase
        .from('turmas_config')
        .select('id, nome, turno')
        .order('nome');
      
      if (error) throw error;
      setTurmas(data || []);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const carregarAlunosRisco = async () => {
    setLoading(true);
    try {
      // Buscar todos os alunos ativos com suas matrículas
      let queryAlunos = supabase
        .from('alunos')
        .select(`
          id,
          nome,
          cpf,
          telefone,
          email,
          matriculas!inner(
            turmas_config!inner(id, nome, turno)
          )
        `);

      if (turmaFiltro) {
        queryAlunos = queryAlunos.eq('matriculas.turmas_config.id', turmaFiltro);
      }

      const { data: alunosData, error: alunosError } = await queryAlunos;
      
      if (alunosError) throw alunosError;

      // Buscar presenças do período
      const { data: presencasData, error: presencasError } = await supabase
        .from('presencas')
        .select('aluno_id, data')
        .gte('data', dataInicial)
        .lte('data', dataFinal)
        .order('data', { ascending: true });

      if (presencasError) throw presencasError;

      // Calcular dias úteis no período
      const diasUteis = calcularDiasUteis(new Date(dataInicial), new Date(dataFinal));

      // Agrupar presenças por aluno
      const presencasPorAluno = new Map<string, string[]>();
      presencasData?.forEach(presenca => {
        if (!presencasPorAluno.has(presenca.aluno_id)) {
          presencasPorAluno.set(presenca.aluno_id, []);
        }
        presencasPorAluno.get(presenca.aluno_id)!.push(presenca.data);
      });

      // Processar dados de risco
      const alunosComRisco: AlunoRisco[] = [];
      const hoje = new Date().toISOString().split('T')[0];

      alunosData?.forEach((aluno: any) => {
        const matricula = aluno.matriculas[0];
        const turma = matricula?.turmas_config;
        const presencasAluno = presencasPorAluno.get(aluno.id) || [];
        
        const presencas = presencasAluno.length;
        const faltas = diasUteis - presencas;
        const frequencia = diasUteis > 0 ? (presencas / diasUteis) * 100 : 0;

        // Calcular faltas consecutivas
        const faltasConsecutivas = calcularFaltasConsecutivas(presencasAluno, dataInicial, dataFinal);
        
        // Último comparecimento
        const ultimoComparecimento = presencasAluno.length > 0 
          ? presencasAluno[presencasAluno.length - 1]
          : null;
        
        // Dias sem comparecer
        const diasSemComparecer = ultimoComparecimento
          ? calcularDiasEntre(ultimoComparecimento, hoje)
          : calcularDiasEntre(dataInicial, hoje);

        // Determinar nível de risco
        let nivelRisco: 'critico' | 'alerta' | 'moderado' = 'moderado';
        if (frequencia < 50 || faltasConsecutivas >= 7 || diasSemComparecer >= 7) {
          nivelRisco = 'critico';
        } else if (frequencia < 75 || faltasConsecutivas >= 3 || diasSemComparecer >= 3) {
          nivelRisco = 'alerta';
        }

        // Incluir apenas alunos com frequência < 75%
        if (frequencia < 75) {
          alunosComRisco.push({
            id: aluno.id,
            nome: aluno.nome,
            cpf: aluno.cpf,
            telefone: aluno.telefone,
            email: aluno.email,
            turma: turma?.nome || '',
            turno: turma?.turno || '',
            total_aulas: diasUteis,
            presencas,
            faltas,
            frequencia,
            faltas_consecutivas: faltasConsecutivas,
            ultimo_comparecimento: ultimoComparecimento,
            dias_sem_comparecer: diasSemComparecer,
            nivel_risco: nivelRisco
          });
        }
      });

      // Ordenar por nível de risco e frequência
      alunosComRisco.sort((a, b) => {
        const nivelPrioridade = { critico: 3, alerta: 2, moderado: 1 };
        const prioridadeA = nivelPrioridade[a.nivel_risco];
        const prioridadeB = nivelPrioridade[b.nivel_risco];
        
        if (prioridadeA !== prioridadeB) {
          return prioridadeB - prioridadeA;
        }
        return a.frequencia - b.frequencia;
      });

      setAlunosRisco(alunosComRisco);

      // Calcular estatísticas
      const stats: EstatisticasRisco = {
        total_alunos_risco: alunosComRisco.length,
        criticos: alunosComRisco.filter(a => a.nivel_risco === 'critico').length,
        alertas: alunosComRisco.filter(a => a.nivel_risco === 'alerta').length,
        moderados: alunosComRisco.filter(a => a.nivel_risco === 'moderado').length,
        media_frequencia: alunosComRisco.length > 0
          ? alunosComRisco.reduce((acc, curr) => acc + curr.frequencia, 0) / alunosComRisco.length
          : 0
      };

      setEstatisticas(stats);

    } catch (error) {
      console.error('Erro ao carregar alunos em risco:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularDiasUteis = (inicio: Date, fim: Date): number => {
    let diasUteis = 0;
    const atual = new Date(inicio);
    
    while (atual <= fim) {
      const diaSemana = atual.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) {
        diasUteis++;
      }
      atual.setDate(atual.getDate() + 1);
    }
    
    return diasUteis;
  };

  const calcularFaltasConsecutivas = (presencas: string[], inicio: string, fim: string): number => {
    if (presencas.length === 0) return calcularDiasUteis(new Date(inicio), new Date(fim));

    const datasOrdenadas = presencas.sort();
    const ultimaPresenca = datasOrdenadas[datasOrdenadas.length - 1];
    
    return calcularDiasUteis(new Date(ultimaPresenca), new Date(fim));
  };

  const calcularDiasEntre = (dataInicio: string, dataFim: string): number => {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const dadosFiltrados = alunosRisco.filter(aluno => {
    const matchNivel = !nivelFiltro || aluno.nivel_risco === nivelFiltro;
    const matchSearch = !searchTerm || 
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.cpf.includes(searchTerm);
    
    return matchNivel && matchSearch;
  });

  const dadosGrafico = [
    { nivel: 'Crítico', quantidade: estatisticas.criticos, cor: '#ef4444' },
    { nivel: 'Alerta', quantidade: estatisticas.alertas, cor: '#f59e0b' },
    { nivel: 'Moderado', quantidade: estatisticas.moderados, cor: '#3b82f6' }
  ];

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'critico': return 'bg-red-100 text-red-800';
      case 'alerta': return 'bg-yellow-100 text-yellow-800';
      case 'moderado': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNivelIcon = (nivel: string) => {
    switch (nivel) {
      case 'critico': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'alerta': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'moderado': return <Target className="w-4 h-4 text-blue-600" />;
      default: return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const exportarCSV = () => {
    const headers = ['Nome', 'CPF', 'Turma', 'Frequência %', 'Faltas', 'Nível Risco', 'Último Comparecimento', 'Telefone'];
    const csvContent = [
      headers.join(','),
      ...dadosFiltrados.map(aluno => [
        `"${aluno.nome}"`,
        formatCPF(aluno.cpf),
        `"${aluno.turma}"`,
        aluno.frequencia.toFixed(1),
        aluno.faltas,
        aluno.nivel_risco,
        aluno.ultimo_comparecimento || 'Nunca',
        aluno.telefone || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alunos-risco-${dataInicial}-${dataFinal}.csv`;
    link.click();
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Relatório de Alunos em Risco', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Período: ${new Date(dataInicial).toLocaleDateString('pt-BR')} a ${new Date(dataFinal).toLocaleDateString('pt-BR')}`, 20, 35);
    
    doc.text(`Total em Risco: ${estatisticas.total_alunos_risco}`, 20, 50);
    doc.text(`Críticos: ${estatisticas.criticos}`, 20, 60);
    doc.text(`Alertas: ${estatisticas.alertas}`, 20, 70);
    doc.text(`Moderados: ${estatisticas.moderados}`, 20, 80);
    
    let y = 100;
    doc.setFontSize(10);
    doc.text('Nome', 20, y);
    doc.text('Turma', 80, y);
    doc.text('Freq%', 130, y);
    doc.text('Risco', 160, y);
    
    dadosFiltrados.slice(0, 25).forEach((aluno) => {
      y += 10;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(aluno.nome.substring(0, 25), 20, y);
      doc.text(aluno.turma.substring(0, 15), 80, y);
      doc.text(`${aluno.frequencia.toFixed(1)}%`, 130, y);
      doc.text(aluno.nivel_risco, 160, y);
    });
    
    doc.save(`alunos-risco-${dataInicial}-${dataFinal}.pdf`);
  };

  const enviarNotificacao = async (aluno: AlunoRisco) => {
    // Buscar template de notificação de ausência
    const { data: templates } = await supabase
      .from('whatsapp_templates')
      .select('*')
      .eq('type', 'absence')
      .eq('is_active', true)
      .limit(1);
    
    if (!templates || templates.length === 0) {
      alert('Nenhum template de notificação de ausência encontrado. Configure um template primeiro.');
      return;
    }
    
    const template = templates[0];
    let mensagem = template.template;
    
    // Substituir variáveis
    mensagem = mensagem.replace(/{nome_aluno}/g, aluno.nome);
    mensagem = mensagem.replace(/{nome_responsavel}/g, 'Responsável');
    mensagem = mensagem.replace(/{data}/g, new Date().toLocaleDateString('pt-BR'));
    
    // Determinar número de destino
    const numeroDestino = aluno.telefone;
    
    if (!numeroDestino) {
      alert('Aluno não possui número de telefone cadastrado');
      return;
    }
    
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: numeroDestino,
          message: mensagem,
          type: 'notification',
          aluno_id: aluno.id
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Notificação enviada com sucesso!');
      } else {
        alert(`Erro ao enviar notificação: ${data.error}`);
      }
    } catch (error) {
      alert('Erro ao enviar notificação');
      console.error(error);
    }
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
              <h1 className="text-3xl font-bold text-gray-800">Alunos em Risco</h1>
              <p className="text-gray-600 mt-1">Identificação e acompanhamento de alunos com baixa frequência</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                Nível de Risco
              </label>
              <select
                value={nivelFiltro}
                onChange={(e) => setNivelFiltro(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Todos os níveis</option>
                <option value="critico">Crítico</option>
                <option value="alerta">Alerta</option>
                <option value="moderado">Moderado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turma
              </label>
              <select
                value={turmaFiltro}
                onChange={(e) => setTurmaFiltro(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Todas as turmas</option>
                {turmas.map(turma => (
                  <option key={turma.id} value={turma.id}>
                    {turma.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Aluno
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total em Risco</p>
                <p className="text-2xl font-bold text-gray-800">{estatisticas.total_alunos_risco}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{estatisticas.criticos}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas</p>
                <p className="text-2xl font-bold text-yellow-600">{estatisticas.alertas}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Freq. Média</p>
                <p className="text-2xl font-bold text-gray-800">{estatisticas.media_frequencia.toFixed(1)}%</p>
              </div>
              <TrendingDown className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Gráfico de Distribuição por Nível */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição por Nível de Risco</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nivel" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de Alunos em Risco */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Lista de Alunos em Risco</h3>
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
                      Aluno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Turma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequência
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risco
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Comp.
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dias Ausente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dadosFiltrados.map((aluno) => (
                    <tr key={aluno.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{aluno.nome}</div>
                          <div className="text-sm text-gray-500">{formatCPF(aluno.cpf)}</div>
                          {aluno.telefone && (
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <Phone className="w-3 h-3 mr-1" />
                              {aluno.telefone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{aluno.turma}</div>
                        <div className="text-sm text-gray-500">{aluno.turno}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(aluno.frequencia, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {aluno.frequencia.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {aluno.faltas} faltas de {aluno.total_aulas} aulas
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNivelColor(aluno.nivel_risco)}`}>
                          {getNivelIcon(aluno.nivel_risco)}
                          <span className="ml-1 capitalize">{aluno.nivel_risco}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {aluno.ultimo_comparecimento 
                          ? new Date(aluno.ultimo_comparecimento).toLocaleDateString('pt-BR')
                          : 'Nunca'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          aluno.dias_sem_comparecer >= 7 ? 'text-red-600' :
                          aluno.dias_sem_comparecer >= 3 ? 'text-yellow-600' :
                          'text-gray-600'
                        }`}>
                          {aluno.dias_sem_comparecer} dias
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/dashboard/relatorios/aluno/${aluno.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver relatório individual"
                          >
                            <User className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => enviarNotificacao(aluno)}
                            className="text-green-600 hover:text-green-900"
                            title="Enviar notificação"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          {aluno.telefone && (
                            <a
                              href={`tel:${aluno.telefone}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ligar"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}
                          {aluno.email && (
                            <a
                              href={`mailto:${aluno.email}`}
                              className="text-purple-600 hover:text-purple-900"
                              title="Enviar email"
                            >
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {dadosFiltrados.length === 0 && (
                <div className="p-6 text-center">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum aluno em risco encontrado no período selecionado</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
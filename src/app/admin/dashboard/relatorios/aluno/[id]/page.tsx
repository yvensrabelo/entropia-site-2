'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  TrendingUp,
  Download,
  FileText,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AuthGuard from '@/components/admin/AuthGuard';
import { supabase } from '@/lib/supabase-singleton';
import { formatCPF } from '@/lib/utils/cpf';
import jsPDF from 'jspdf';

interface AlunoDetalhado {
  id: string;
  nome: string;
  cpf: string;
  telefone?: string;
  email?: string;
  data_nascimento?: string;
  endereco?: string;
  turma: string;
  turno: string;
  total_presencas: number;
  total_aulas: number;
  frequencia: number;
  primeira_presenca?: string;
  ultima_presenca?: string;
  observacoes?: string;
}

interface PresencaDetalhada {
  data: string;
  hora_entrada: string;
  tipo: string;
  observacoes?: string;
}

interface FrequenciaMensal {
  mes: string;
  presencas: number;
  aulas: number;
  frequencia: number;
}

interface CalendarioData {
  data: string;
  presente: boolean;
  observacoes?: string;
}

export default function RelatorioIndividualPage() {
  const params = useParams();
  const alunoId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [aluno, setAluno] = useState<AlunoDetalhado | null>(null);
  const [presencas, setPresencas] = useState<PresencaDetalhada[]>([]);
  const [frequenciaMensal, setFrequenciaMensal] = useState<FrequenciaMensal[]>([]);
  const [calendarioData, setCalendarioData] = useState<CalendarioData[]>([]);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [dataInicial, setDataInicial] = useState(() => {
    const data = new Date();
    data.setMonth(data.getMonth() - 3);
    return data.toISOString().split('T')[0];
  });
  const [dataFinal, setDataFinal] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (alunoId) {
      carregarDadosAluno();
    }
  }, [alunoId, dataInicial, dataFinal]);

  useEffect(() => {
    if (presencas.length > 0) {
      gerarCalendario();
      gerarFrequenciaMensal();
    }
  }, [presencas, mesAtual, anoAtual]);

  const carregarDadosAluno = async () => {
    setLoading(true);
    try {
      // Carregar dados básicos do aluno
      const { data: alunoData, error: alunoError } = await supabase
        .from('alunos')
        .select(`
          id,
          nome,
          cpf,
          telefone,
          email,
          data_nascimento,
          endereco,
          observacoes,
          matriculas!inner(
            turmas_config!inner(nome, turno)
          )
        `)
        .eq('id', alunoId)
        .single();

      if (alunoError) throw alunoError;

      // Carregar presenças do período
      const { data: presencasData, error: presencasError } = await supabase
        .from('presencas')
        .select('data, hora_entrada, tipo, observacoes')
        .eq('aluno_id', alunoId)
        .gte('data', dataInicial)
        .lte('data', dataFinal)
        .order('data', { ascending: false });

      if (presencasError) throw presencasError;

      // Calcular estatísticas
      const diasUteis = calcularDiasUteis(new Date(dataInicial), new Date(dataFinal));
      const totalPresencas = presencasData?.length || 0;
      const frequencia = diasUteis > 0 ? (totalPresencas / diasUteis) * 100 : 0;

      const matricula = alunoData.matriculas[0];
      const turmaConfig = Array.isArray(matricula?.turmas_config) 
        ? matricula.turmas_config[0] 
        : matricula?.turmas_config;

      const alunoCompleto: AlunoDetalhado = {
        id: alunoData.id,
        nome: alunoData.nome,
        cpf: alunoData.cpf,
        telefone: alunoData.telefone,
        email: alunoData.email,
        data_nascimento: alunoData.data_nascimento,
        endereco: alunoData.endereco,
        turma: turmaConfig?.nome || '',
        turno: turmaConfig?.turno || '',
        total_presencas: totalPresencas,
        total_aulas: diasUteis,
        frequencia: frequencia,
        primeira_presenca: presencasData?.[presencasData.length - 1]?.data,
        ultima_presenca: presencasData?.[0]?.data,
        observacoes: alunoData.observacoes
      };

      setAluno(alunoCompleto);
      setPresencas(presencasData || []);

    } catch (error) {
      console.error('Erro ao carregar dados do aluno:', error);
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

  const gerarFrequenciaMensal = () => {
    const frequenciaPorMes = new Map<string, { presencas: number; aulas: number }>();
    
    // Inicializar meses do período
    const inicio = new Date(dataInicial);
    const fim = new Date(dataFinal);
    const atual = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
    
    while (atual <= fim) {
      const chave = `${atual.getFullYear()}-${atual.getMonth().toString().padStart(2, '0')}`;
      const nomeMs = atual.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      const inicioMes = new Date(atual.getFullYear(), atual.getMonth(), 1);
      const fimMes = new Date(atual.getFullYear(), atual.getMonth() + 1, 0);
      const aulasMes = calcularDiasUteis(inicioMes, fimMes);
      
      frequenciaPorMes.set(chave, { presencas: 0, aulas: aulasMes });
      atual.setMonth(atual.getMonth() + 1);
    }
    
    // Contar presenças por mês
    presencas.forEach(presenca => {
      const data = new Date(presenca.data);
      const chave = `${data.getFullYear()}-${data.getMonth().toString().padStart(2, '0')}`;
      
      if (frequenciaPorMes.has(chave)) {
        frequenciaPorMes.get(chave)!.presencas++;
      }
    });
    
    // Converter para array
    const dadosMensais = Array.from(frequenciaPorMes.entries()).map(([chave, dados]) => {
      const [ano, mes] = chave.split('-');
      const data = new Date(parseInt(ano), parseInt(mes), 1);
      const nomeMs = data.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      return {
        mes: nomeMs,
        presencas: dados.presencas,
        aulas: dados.aulas,
        frequencia: dados.aulas > 0 ? (dados.presencas / dados.aulas) * 100 : 0
      };
    });
    
    setFrequenciaMensal(dadosMensais);
  };

  const gerarCalendario = () => {
    const calendario: CalendarioData[] = [];
    const presencasMap = new Map(presencas.map(p => [p.data, p]));
    
    const primeiroDia = new Date(anoAtual, mesAtual, 1);
    const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
    
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const dataAtual = new Date(anoAtual, mesAtual, dia);
      const dataString = dataAtual.toISOString().split('T')[0];
      const presenca = presencasMap.get(dataString);
      
      calendario.push({
        data: dataString,
        presente: !!presenca,
        observacoes: presenca?.observacoes
      });
    }
    
    setCalendarioData(calendario);
  };

  const proximoMes = () => {
    if (mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual(anoAtual + 1);
    } else {
      setMesAtual(mesAtual + 1);
    }
  };

  const mesAnterior = () => {
    if (mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual(anoAtual - 1);
    } else {
      setMesAtual(mesAtual - 1);
    }
  };

  const exportarPDF = () => {
    if (!aluno) return;
    
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(18);
    doc.text('Relatório Individual de Frequência', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Aluno: ${aluno.nome}`, 20, 35);
    doc.text(`CPF: ${formatCPF(aluno.cpf)}`, 20, 45);
    doc.text(`Turma: ${aluno.turma} - ${aluno.turno}`, 20, 55);
    doc.text(`Período: ${new Date(dataInicial).toLocaleDateString('pt-BR')} a ${new Date(dataFinal).toLocaleDateString('pt-BR')}`, 20, 65);
    
    // Estatísticas
    doc.setFontSize(14);
    doc.text('Estatísticas:', 20, 85);
    
    doc.setFontSize(12);
    doc.text(`Total de Presenças: ${aluno.total_presencas}`, 20, 100);
    doc.text(`Total de Aulas: ${aluno.total_aulas}`, 20, 110);
    doc.text(`Frequência: ${aluno.frequencia.toFixed(1)}%`, 20, 120);
    doc.text(`Primeira Presença: ${aluno.primeira_presenca ? new Date(aluno.primeira_presenca).toLocaleDateString('pt-BR') : 'N/A'}`, 20, 130);
    doc.text(`Última Presença: ${aluno.ultima_presenca ? new Date(aluno.ultima_presenca).toLocaleDateString('pt-BR') : 'N/A'}`, 20, 140);
    
    // Histórico de presenças (últimas 10)
    doc.setFontSize(14);
    doc.text('Últimas Presenças:', 20, 160);
    
    doc.setFontSize(10);
    let y = 175;
    presencas.slice(0, 10).forEach(presenca => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(`${new Date(presenca.data).toLocaleDateString('pt-BR')} - ${presenca.hora_entrada} (${presenca.tipo})`, 20, y);
      if (presenca.observacoes) {
        y += 8;
        doc.text(`  Obs: ${presenca.observacoes}`, 20, y);
      }
      y += 12;
    });
    
    doc.save(`relatorio-individual-${aluno.nome.replace(/\s+/g, '-')}-${dataInicial}-${dataFinal}.pdf`);
  };

  const getStatusFrequencia = (frequencia: number) => {
    if (frequencia >= 90) return { cor: 'text-green-600', status: 'Excelente', icon: CheckCircle };
    if (frequencia >= 75) return { cor: 'text-blue-600', status: 'Bom', icon: CheckCircle };
    if (frequencia >= 50) return { cor: 'text-yellow-600', status: 'Alerta', icon: AlertTriangle };
    return { cor: 'text-red-600', status: 'Crítico', icon: XCircle };
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Carregando relatório do aluno...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!aluno) {
    return (
      <AuthGuard>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aluno não encontrado</p>
            <Link href="/admin/dashboard/relatorios/aluno" className="text-green-600 hover:text-green-700 mt-2 inline-block">
              Voltar à seleção
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const statusFreq = getStatusFrequencia(aluno.frequencia);
  const StatusIcon = statusFreq.icon;

  return (
    <AuthGuard>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard/relatorios/aluno"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar à Seleção
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{aluno.nome}</h1>
              <p className="text-gray-600 mt-1">Relatório Individual de Frequência</p>
            </div>
            
            <div className="flex gap-3">
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

        {/* Filtros de Período */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Período de Análise</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Pessoais</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">CPF</p>
                  <p className="font-medium">{formatCPF(aluno.cpf)}</p>
                </div>
              </div>
              
              {aluno.telefone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Telefone</p>
                    <p className="font-medium">{aluno.telefone}</p>
                  </div>
                </div>
              )}
              
              {aluno.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{aluno.email}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Turma</p>
                  <p className="font-medium">{aluno.turma} - {aluno.turno}</p>
                </div>
              </div>
              
              {aluno.endereco && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Endereço</p>
                    <p className="font-medium text-sm">{aluno.endereco}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Estatísticas de Frequência */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas de Frequência</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${statusFreq.cor} mb-2`}>
                  {aluno.frequencia.toFixed(1)}%
                </div>
                <div className="flex items-center justify-center gap-2">
                  <StatusIcon className={`w-5 h-5 ${statusFreq.cor}`} />
                  <span className={`font-medium ${statusFreq.cor}`}>
                    {statusFreq.status}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Presenças:</span>
                  <span className="font-medium">{aluno.total_presencas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de Aulas:</span>
                  <span className="font-medium">{aluno.total_aulas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Faltas:</span>
                  <span className="font-medium">{aluno.total_aulas - aluno.total_presencas}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações de Comparecimento */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Comparecimento</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Primeira Presença</p>
                <p className="font-medium">
                  {aluno.primeira_presenca 
                    ? new Date(aluno.primeira_presenca).toLocaleDateString('pt-BR')
                    : 'Nenhuma presença registrada'
                  }
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600 mb-1">Última Presença</p>
                <p className="font-medium">
                  {aluno.ultima_presenca 
                    ? new Date(aluno.ultima_presenca).toLocaleDateString('pt-BR')
                    : 'Nenhuma presença registrada'
                  }
                </p>
              </div>
              
              {aluno.observacoes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Observações</p>
                  <p className="text-sm bg-gray-50 p-2 rounded">{aluno.observacoes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gráfico de Frequência Mensal */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Frequência Mensal</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequenciaMensal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'presencas' ? `${value} presenças` : 
                    name === 'aulas' ? `${value} aulas` :
                    `${value}%`,
                    name === 'presencas' ? 'Presenças' :
                    name === 'aulas' ? 'Aulas' : 'Frequência'
                  ]}
                />
                <Bar dataKey="presencas" fill="#10b981" name="presencas" />
                <Bar dataKey="aulas" fill="#e5e7eb" name="aulas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calendário Visual */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Calendário de Presenças</h3>
            <div className="flex items-center gap-4">
              <button 
                onClick={mesAnterior}
                className="p-2 hover:bg-gray-100 rounded"
              >
                ←
              </button>
              <span className="font-medium">
                {new Date(anoAtual, mesAtual).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                onClick={proximoMes}
                className="p-2 hover:bg-gray-100 rounded"
              >
                →
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
              <div key={dia} className="text-center text-sm font-medium text-gray-500 p-2">
                {dia}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {/* Espaços vazios para o início do mês */}
            {Array.from({ length: new Date(anoAtual, mesAtual, 1).getDay() }).map((_, index) => (
              <div key={`empty-${index}`} className="h-10"></div>
            ))}
            
            {/* Dias do mês */}
            {calendarioData.map((dia, index) => {
              const diaNum = new Date(dia.data).getDate();
              const diaSemana = new Date(dia.data).getDay();
              const ehFimSemana = diaSemana === 0 || diaSemana === 6;
              
              return (
                <div
                  key={index}
                  className={`h-10 w-10 rounded flex items-center justify-center text-sm font-medium cursor-pointer transition-colors ${
                    ehFimSemana 
                      ? 'bg-gray-100 text-gray-400'
                      : dia.presente
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-100 text-red-600 hover:bg-red-200'
                  }`}
                  title={
                    ehFimSemana 
                      ? 'Fim de semana' 
                      : dia.presente 
                      ? `Presente${dia.observacoes ? ` - ${dia.observacoes}` : ''}`
                      : 'Ausente'
                  }
                >
                  {diaNum}
                </div>
              );
            })}
          </div>
          
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Presente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span>Ausente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-100 rounded"></div>
              <span>Fim de Semana</span>
            </div>
          </div>
        </div>

        {/* Histórico Detalhado */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Histórico de Presenças</h3>
          </div>
          
          {presencas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {presencas.map((presenca, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {new Date(presenca.data).toLocaleDateString('pt-BR', { 
                          weekday: 'short', 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {presenca.hora_entrada}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          presenca.tipo === 'catraca' 
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {presenca.tipo === 'catraca' ? 'Catraca' : 'Manual'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {presenca.observacoes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma presença registrada no período selecionado</p>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
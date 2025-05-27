'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Search, 
  User, 
  Users, 
  Calendar,
  Filter,
  ChevronRight
} from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';
import { supabase } from '@/lib/supabase-singleton';
import { formatCPF } from '@/lib/utils/cpf';

interface AlunoInfo {
  id: string;
  nome: string;
  cpf: string;
  telefone?: string;
  email?: string;
  turma: string;
  turno: string;
  total_presencas: number;
  ultima_presenca?: string;
}

export default function SeletorAlunoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [alunos, setAlunos] = useState<AlunoInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [turmaFiltro, setTurmaFiltro] = useState('');
  const [turmas, setTurmas] = useState<any[]>([]);

  useEffect(() => {
    carregarTurmas();
    if (searchTerm.length >= 3 || turmaFiltro) {
      buscarAlunos();
    } else {
      setAlunos([]);
    }
  }, [searchTerm, turmaFiltro]);

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

  const buscarAlunos = async () => {
    setLoading(true);
    try {
      let query = supabase
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

      if (searchTerm.length >= 3) {
        query = query.or(`nome.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`);
      }

      if (turmaFiltro) {
        query = query.eq('matriculas.turmas_config.id', turmaFiltro);
      }

      query = query.limit(20);

      const { data: alunosData, error: alunosError } = await query;
      
      if (alunosError) throw alunosError;

      // Buscar últimas presenças para cada aluno
      const alunosIds = alunosData?.map(a => a.id) || [];
      
      if (alunosIds.length > 0) {
        const { data: presencasData, error: presencasError } = await supabase
          .from('presencas')
          .select('aluno_id, data')
          .in('aluno_id', alunosIds)
          .order('data', { ascending: false });

        if (presencasError) throw presencasError;

        // Processar dados
        const presencasPorAluno = new Map<string, { total: number; ultima?: string }>();
        
        presencasData?.forEach(presenca => {
          if (!presencasPorAluno.has(presenca.aluno_id)) {
            presencasPorAluno.set(presenca.aluno_id, { total: 0 });
          }
          
          const dados = presencasPorAluno.get(presenca.aluno_id)!;
          dados.total++;
          
          if (!dados.ultima) {
            dados.ultima = presenca.data;
          }
        });

        // Combinar dados
        const alunosCompletos: AlunoInfo[] = alunosData?.map((aluno: any) => {
          const matricula = aluno.matriculas[0];
          const turma = matricula?.turmas_config;
          const presencas = presencasPorAluno.get(aluno.id);
          
          return {
            id: aluno.id,
            nome: aluno.nome,
            cpf: aluno.cpf,
            telefone: aluno.telefone,
            email: aluno.email,
            turma: turma?.nome || '',
            turno: turma?.turno || '',
            total_presencas: presencas?.total || 0,
            ultima_presenca: presencas?.ultima
          };
        }) || [];

        setAlunos(alunosCompletos.sort((a, b) => a.nome.localeCompare(b.nome)));
      }

    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    } finally {
      setLoading(false);
    }
  };

  const selecionarAluno = (alunoId: string) => {
    router.push(`/admin/dashboard/relatorios/aluno/${alunoId}`);
  };

  return (
    <AuthGuard>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard/relatorios"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Relatórios
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <User className="w-8 h-8 text-green-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Relatório Individual</h1>
              <p className="text-gray-600">Selecione um aluno para ver o relatório detalhado</p>
            </div>
          </div>
        </div>

        {/* Filtros de Busca */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-800">Buscar Aluno</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome ou CPF
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Digite o nome ou CPF do aluno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Mínimo 3 caracteres</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por Turma
              </label>
              <select
                value={turmaFiltro}
                onChange={(e) => setTurmaFiltro(e.target.value)}
                className="w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Todas as turmas</option>
                {turmas.map(turma => (
                  <option key={turma.id} value={turma.id}>
                    {turma.nome} - {turma.turno}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resultados da Busca */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Resultados da Busca
              {alunos.length > 0 && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({alunos.length} aluno{alunos.length !== 1 ? 's' : ''} encontrado{alunos.length !== 1 ? 's' : ''})
                </span>
              )}
            </h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Buscando alunos...</p>
            </div>
          ) : alunos.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {alunos.map((aluno) => (
                <button
                  key={aluno.id}
                  onClick={() => selecionarAluno(aluno.id)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                          {aluno.nome}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>CPF: {formatCPF(aluno.cpf)}</span>
                          <span>•</span>
                          <span>{aluno.turma} - {aluno.turno}</span>
                        </div>
                        {aluno.telefone && (
                          <p className="text-sm text-gray-500 mt-1">
                            📞 {aluno.telefone}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{aluno.total_presencas} presenças</span>
                        </div>
                        {aluno.ultima_presenca && (
                          <p className="text-xs text-gray-400 mt-1">
                            Última: {new Date(aluno.ultima_presenca).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : searchTerm.length >= 3 || turmaFiltro ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum aluno encontrado</p>
              <p className="text-sm text-gray-400 mt-1">
                Tente ajustar os filtros de busca
              </p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Digite o nome ou CPF do aluno para começar</p>
              <p className="text-sm text-gray-400 mt-1">
                Ou selecione uma turma para ver todos os alunos
              </p>
            </div>
          )}
        </div>

        {/* Atalhos Rápidos */}
        {!loading && alunos.length === 0 && !searchTerm && !turmaFiltro && (
          <div className="mt-6 bg-blue-50 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-3">Atalhos Rápidos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/admin/dashboard/relatorios/risco"
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Alunos em Risco</p>
                    <p className="text-sm text-gray-500">Ver lista de alunos com baixa frequência</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
              
              <Link
                href="/admin/dashboard/alunos"
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Gerenciar Alunos</p>
                    <p className="text-sm text-gray-500">Acessar lista completa de alunos</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
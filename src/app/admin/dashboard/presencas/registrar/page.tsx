'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase-client';
import { ArrowLeft, Save, Loader2, Search, UserPlus, Calendar, Clock } from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';
import { Toast } from '@/components/Toast';
import { formatCPF } from '@/lib/utils/cpf';

interface AlunoComTurma {
  id: string;
  nome: string;
  cpf: string;
  matricula?: {
    turma: {
      nome: string;
      turno: string;
    };
  };
}

export default function RegistrarPresencaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<AlunoComTurma[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedAlunos, setSelectedAlunos] = useState<AlunoComTurma[]>([]);
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [horaEntrada, setHoraEntrada] = useState(new Date().toTimeString().slice(0, 5));
  const [observacoes, setObservacoes] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (searchTerm.length >= 3) {
      searchAlunos();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const searchAlunos = async () => {
    setSearching(true);
    try {
      const { data: rawData, error } = await supabase
        .from('alunos')
        .select(`
          id,
          nome,
          cpf,
          matriculas!inner(
            id,
            status,
            turmas_config!inner(nome, turno)
          )
        `)
        .or(`nome.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`)
        .eq('matriculas.status', 'ativa')
        .limit(10);

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData: AlunoComTurma[] = (rawData || []).map((item: any) => {
        const matricula = item.matriculas?.[0];
        const turma = matricula?.turmas_config?.[0] || matricula?.turmas_config;
        
        return {
          id: item.id,
          nome: item.nome,
          cpf: item.cpf,
          matricula: matricula ? {
            turma: {
              nome: turma?.nome || '',
              turno: turma?.turno || ''
            }
          } : undefined
        };
      });

      setSearchResults(transformedData);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    } finally {
      setSearching(false);
    }
  };

  const addAluno = (aluno: AlunoComTurma) => {
    if (!selectedAlunos.find(a => a.id === aluno.id)) {
      setSelectedAlunos([...selectedAlunos, aluno]);
      setSearchTerm('');
      setSearchResults([]);
    }
  };

  const removeAluno = (alunoId: string) => {
    setSelectedAlunos(selectedAlunos.filter(a => a.id !== alunoId));
  };

  const handleSubmit = async () => {
    if (selectedAlunos.length === 0) {
      setToast({ message: 'Selecione pelo menos um aluno', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Verificar presenças existentes
      const { data: presencasExistentes } = await supabase
        .from('presencas')
        .select('aluno_id')
        .eq('data', data)
        .in('aluno_id', selectedAlunos.map(a => a.id));

      const alunosComPresenca = presencasExistentes?.map(p => p.aluno_id) || [];
      const alunosParaRegistrar = selectedAlunos.filter(a => !alunosComPresenca.includes(a.id));

      if (alunosParaRegistrar.length === 0) {
        setToast({ 
          message: 'Todos os alunos selecionados já têm presença registrada nesta data', 
          type: 'error' 
        });
        setLoading(false);
        return;
      }

      // Registrar presenças
      const presencas = alunosParaRegistrar.map(aluno => ({
        aluno_id: aluno.id,
        data,
        hora_entrada: horaEntrada + ':00',
        tipo: 'manual',
        observacoes: observacoes || 'Registro manual'
      }));

      const { error } = await supabase
        .from('presencas')
        .insert(presencas);

      if (error) throw error;

      setToast({ 
        message: `${alunosParaRegistrar.length} presença(s) registrada(s) com sucesso!`, 
        type: 'success' 
      });

      setTimeout(() => {
        router.push('/admin/dashboard/presencas');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao registrar presenças:', error);
      setToast({ 
        message: error.message || 'Erro ao registrar presenças', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href="/admin/dashboard/presencas"
            className="inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Registrar Presença Manual</h1>

        <div className="space-y-6">
          {/* Data e Hora */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Data e Hora</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Entrada
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="time"
                    value={horaEntrada}
                    onChange={(e) => setHoraEntrada(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Busca de Alunos */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Selecionar Alunos</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {searching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                </div>
              )}
            </div>

            {/* Resultados da busca */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg mb-4 max-h-48 overflow-y-auto">
                {searchResults.map(aluno => (
                  <button
                    key={aluno.id}
                    onClick={() => addAluno(aluno)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{aluno.nome}</p>
                      <p className="text-sm text-gray-500">
                        CPF: {formatCPF(aluno.cpf)} | {aluno.matricula?.turma.nome} ({aluno.matricula?.turma.turno})
                      </p>
                    </div>
                    <UserPlus className="w-5 h-5 text-green-500" />
                  </button>
                ))}
              </div>
            )}

            {/* Alunos selecionados */}
            {selectedAlunos.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Alunos selecionados ({selectedAlunos.length})
                </p>
                <div className="space-y-2">
                  {selectedAlunos.map(aluno => (
                    <div
                      key={aluno.id}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{aluno.nome}</p>
                        <p className="text-sm text-gray-500">
                          {aluno.matricula?.turma.nome} ({aluno.matricula?.turma.turno})
                        </p>
                      </div>
                      <button
                        onClick={() => removeAluno(aluno.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Observações</h2>
            
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Observações sobre o registro manual..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/dashboard/presencas"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedAlunos.length === 0}
              className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Registrando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Registrar Presenças
                </>
              )}
            </button>
          </div>
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </AuthGuard>
  );
}
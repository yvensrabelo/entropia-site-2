'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Aluno } from '@/types/aluno';
import { formatCPF } from '@/lib/utils/cpf';
import { Users, Plus, Search, Edit, Trash2, Loader2, Eye, Upload, Zap, Rocket, FileCheck, FileX } from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { Toast } from '@/components/Toast';

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [contratoFilter, setContratoFilter] = useState<'todos' | 'entregue' | 'pendente'>('todos');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; aluno: Aluno | null }>({ 
    isOpen: false, 
    aluno: null 
  });
  const [deletingAluno, setDeletingAluno] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchAlunos();
  }, []);

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setAlunos(data || []);
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.aluno) return;

    setDeletingAluno(true);
    try {
      const { error } = await supabase
        .from('alunos')
        .delete()
        .eq('id', deleteModal.aluno.id);

      if (error) throw error;
      
      // Atualizar lista local
      setAlunos(alunos.filter(a => a.id !== deleteModal.aluno?.id));
      setToast({ message: 'Aluno excluído com sucesso!', type: 'success' });
      setDeleteModal({ isOpen: false, aluno: null });
    } catch (error: any) {
      console.error('Erro ao excluir aluno:', error);
      setToast({ 
        message: error.message || 'Erro ao excluir aluno. Verifique se não há matrículas vinculadas.', 
        type: 'error' 
      });
    } finally {
      setDeletingAluno(false);
    }
  };

  const filteredAlunos = alunos.filter(aluno => {
    // Filtro de busca
    const matchesSearch = aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      aluno.cpf.includes(searchTerm) ||
      aluno.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro de contrato
    const matchesContrato = contratoFilter === 'todos' ||
      (contratoFilter === 'entregue' && aluno.contrato_entregue) ||
      (contratoFilter === 'pendente' && !aluno.contrato_entregue);
    
    return matchesSearch && matchesContrato;
  });

  const formatPhone = (phone?: string) => {
    if (!phone) return '-';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <AuthGuard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Alunos</h1>
            <p className="text-gray-600 mt-1">Gerencie os alunos cadastrados</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/admin/dashboard/alunos/importar-flexivel"
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors font-medium"
            >
              <Rocket className="w-5 h-5" />
              Super Flexível
            </Link>
            <Link
              href="/admin/dashboard/alunos/importar"
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Upload className="w-5 h-5" />
              Importar
            </Link>
            <Link
              href="/admin/dashboard/alunos/importar-avancado"
              className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              <Zap className="w-5 h-5" />
              Avançado
            </Link>
            <Link
              href="/admin/dashboard/alunos/novo"
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Novo Aluno
            </Link>
          </div>
        </div>

        {/* Barra de busca e filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou email..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setContratoFilter('todos')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  contratoFilter === 'todos'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos ({alunos.length})
              </button>
              <button
                onClick={() => setContratoFilter('entregue')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  contratoFilter === 'entregue'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                Entregues ({alunos.filter(a => a.contrato_entregue).length})
              </button>
              <button
                onClick={() => setContratoFilter('pendente')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  contratoFilter === 'pendente'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileX className="w-4 h-4" />
                Pendentes ({alunos.filter(a => !a.contrato_entregue).length})
              </button>
            </div>
          </div>
        </div>

        {/* Lista de alunos */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
          ) : filteredAlunos.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CPF
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Responsável
                    </th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contrato
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAlunos.map((aluno) => (
                    <tr key={aluno.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{aluno.nome}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatCPF(aluno.cpf)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatPhone(aluno.telefone)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{aluno.email || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{aluno.nome_responsavel || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {aluno.contrato_entregue ? (
                          <div className="flex justify-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FileCheck className="w-3 h-3 mr-1" />
                              Entregue
                            </span>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <FileX className="w-3 h-3 mr-1" />
                              Pendente
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/dashboard/alunos/${aluno.id}`}
                            className="text-gray-600 hover:text-gray-900"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/dashboard/alunos/${aluno.id}/editar`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, aluno })}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de confirmação de exclusão */}
        <DeleteConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, aluno: null })}
          onConfirm={handleDelete}
          title="Excluir Aluno"
          message={`Tem certeza que deseja excluir o aluno ${deleteModal.aluno?.nome}? Esta ação não pode ser desfeita.`}
          loading={deletingAluno}
        />

        {/* Toast */}
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
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FileText, CloudUpload, Trash2, Edit, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { Prova } from '@/lib/types/prova';
import AuthGuard from '@/components/admin/AuthGuard';

export default function AdminProvasPage() {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProvas();
  }, []);

  const fetchProvas = async () => {
    try {
      const { data, error } = await supabase
        .from('provas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProvas(data || []);
    } catch (error) {
      console.error('Erro ao buscar provas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta prova?')) return;

    try {
      const { error } = await supabase
        .from('provas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Atualiza a lista
      setProvas(provas.filter(p => p.id !== id));
      alert('Prova excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir prova');
    }
  };

  return (
    <AuthGuard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gerenciar Provas</h1>
            <p className="text-gray-600">Adicione e gerencie provas do banco</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/admin/dashboard/provas/upload-multiplo"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <CloudUpload className="w-5 h-5" />
              Upload Múltiplo
            </Link>
            <Link
              href="/admin/dashboard/provas/nova"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nova Prova
            </Link>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : provas.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma prova cadastrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instituição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visualizações
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {provas.map((prova) => (
                  <tr key={prova.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {prova.titulo}
                      </div>
                      {prova.etapa && (
                        <div className="text-sm text-gray-500">{prova.etapa}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prova.instituicao}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prova.tipo_prova}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prova.ano}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prova.visualizacoes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <a
                          href={prova.url_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                          title="Visualizar"
                        >
                          <Eye className="w-5 h-5" />
                        </a>
                        <Link
                          href={`/admin/dashboard/provas/${prova.id}/editar`}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(prova.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          <Trash2 className="w-5 h-5" />
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
      </div>
    </AuthGuard>
  );
}
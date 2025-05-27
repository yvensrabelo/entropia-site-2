'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  FileText, 
  CloudUpload, 
  Trash2, 
  Edit, 
  Eye, 
  Filter, 
  Search,
  CheckSquare,
  Square,
  MinusSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabase-singleton';
import { Prova, SUBCATEGORIAS, AREAS_MACRO } from '@/lib/types/prova';
import AuthGuard from '@/components/admin/AuthGuard';
import DeleteModal from '@/components/admin/DeleteModal';
import { Toast } from '@/components/Toast';

export default function AdminProvasPage() {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroSubcategoria, setFiltroSubcategoria] = useState('');
  const [filtroArea, setFiltroArea] = useState('');
  const [selectedProvas, setSelectedProvas] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProvas, setDeletingProvas] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
      setToast({ message: 'Erro ao carregar provas', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar provas
  const provasFiltradas = useMemo(() => {
    return provas.filter(prova => {
      // Filtro de busca
      if (searchTerm && !prova.titulo.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !prova.instituicao.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filtro de tipo
      if (filtroTipo && prova.tipo_prova !== filtroTipo) {
        return false;
      }
      
      // Filtro de subcategoria
      if (filtroSubcategoria && prova.subcategoria !== filtroSubcategoria) {
        return false;
      }
      
      // Filtro de área
      if (filtroArea && prova.area !== filtroArea) {
        return false;
      }
      
      return true;
    });
  }, [provas, searchTerm, filtroTipo, filtroSubcategoria, filtroArea]);

  // Seleção de provas
  const toggleSelectProva = (id: string) => {
    setSelectedProvas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProvas.size === provasFiltradas.length) {
      setSelectedProvas(new Set());
    } else {
      setSelectedProvas(new Set(provasFiltradas.map(p => p.id)));
    }
  };

  const selectAllFiltered = () => {
    setSelectedProvas(new Set(provasFiltradas.map(p => p.id)));
  };

  const handleDeleteSingle = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta prova?')) return;

    try {
      // Buscar URLs dos arquivos
      const prova = provas.find(p => p.id === id);
      if (!prova) return;

      // Deletar arquivos do storage
      if (prova.url_pdf) {
        const pdfPath = prova.url_pdf.split('/').pop();
        if (pdfPath) {
          await supabase.storage.from('provas').remove([pdfPath]);
        }
      }

      if (prova.url_gabarito) {
        const gabaritoPath = prova.url_gabarito.split('/').pop();
        if (gabaritoPath) {
          await supabase.storage.from('provas').remove([gabaritoPath]);
        }
      }

      // Deletar do banco
      const { error } = await supabase
        .from('provas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Atualiza a lista
      setProvas(provas.filter(p => p.id !== id));
      setToast({ message: 'Prova excluída com sucesso!', type: 'success' });
    } catch (error) {
      console.error('Erro ao excluir:', error);
      setToast({ message: 'Erro ao excluir prova', type: 'error' });
    }
  };

  const handleDeleteMultiple = async () => {
    setDeletingProvas(true);
    
    try {
      const provasToDelete = provas.filter(p => selectedProvas.has(p.id));
      
      // Deletar arquivos do storage em lote
      const filesToDelete: string[] = [];
      
      provasToDelete.forEach(prova => {
        if (prova.url_pdf) {
          const pdfPath = prova.url_pdf.split('/').pop();
          if (pdfPath) filesToDelete.push(pdfPath);
        }
        
        if (prova.url_gabarito) {
          const gabaritoPath = prova.url_gabarito.split('/').pop();
          if (gabaritoPath) filesToDelete.push(gabaritoPath);
        }
      });

      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('provas')
          .remove(filesToDelete);
          
        if (storageError) {
          console.error('Erro ao deletar arquivos:', storageError);
        }
      }

      // Deletar registros do banco
      const { error } = await supabase
        .from('provas')
        .delete()
        .in('id', Array.from(selectedProvas));

      if (error) throw error;
      
      // Atualiza a lista e limpa seleção
      setProvas(provas.filter(p => !selectedProvas.has(p.id)));
      setSelectedProvas(new Set());
      setShowDeleteModal(false);
      setToast({ 
        message: `${selectedProvas.size} prova${selectedProvas.size > 1 ? 's' : ''} excluída${selectedProvas.size > 1 ? 's' : ''} com sucesso!`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Erro ao excluir múltiplas provas:', error);
      setToast({ message: 'Erro ao excluir provas selecionadas', type: 'error' });
    } finally {
      setDeletingProvas(false);
    }
  };

  const selectedProvasDetails = useMemo(() => {
    return provas
      .filter(p => selectedProvas.has(p.id))
      .map(p => p.titulo);
  }, [provas, selectedProvas]);

  const isAllSelected = provasFiltradas.length > 0 && selectedProvas.size === provasFiltradas.length;
  const isPartiallySelected = selectedProvas.size > 0 && selectedProvas.size < provasFiltradas.length;

  return (
    <AuthGuard>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gerenciar Provas</h1>
            <p className="text-gray-600">Adicione e gerencie provas do banco</p>
          </div>
          <div className="flex gap-2">
            {selectedProvas.size > 0 && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Excluir {selectedProvas.size} selecionada{selectedProvas.size > 1 ? 's' : ''}
              </button>
            )}
            <Link
              href="/admin/dashboard/provas/upload-massa"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <CloudUpload className="w-5 h-5" />
              Upload em Massa
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

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por tipo */}
            <select
              value={filtroTipo}
              onChange={(e) => {
                setFiltroTipo(e.target.value);
                setFiltroSubcategoria('');
                setFiltroArea('');
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os tipos</option>
              <option value="PSC">PSC</option>
              <option value="MACRO">MACRO</option>
              <option value="SIS">SIS</option>
              <option value="ENEM">ENEM</option>
              <option value="PSI">PSI</option>
            </select>

            {/* Filtro por subcategoria */}
            {filtroTipo && SUBCATEGORIAS[filtroTipo] && (
              <select
                value={filtroSubcategoria}
                onChange={(e) => {
                  setFiltroSubcategoria(e.target.value);
                  if (e.target.value !== 'DIA 2') {
                    setFiltroArea('');
                  }
                }}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas subcategorias</option>
                {SUBCATEGORIAS[filtroTipo].map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            )}

            {/* Filtro por área */}
            {filtroTipo === 'MACRO' && filtroSubcategoria === 'DIA 2' && (
              <select
                value={filtroArea}
                onChange={(e) => setFiltroArea(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as áreas</option>
                {AREAS_MACRO.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            )}
          </div>

          {/* Contador e ações em lote */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {provasFiltradas.length} de {provas.length} provas
            </div>
            {provasFiltradas.length > 0 && (
              <button
                onClick={selectAllFiltered}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Selecionar todos os filtrados
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : provasFiltradas.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma prova encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : isPartiallySelected ? (
                        <MinusSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
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
                {provasFiltradas.map((prova) => (
                  <tr key={prova.id} className={selectedProvas.has(prova.id) ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleSelectProva(prova.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {selectedProvas.has(prova.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {prova.subcategoria || prova.tipo_prova}
                      </div>
                      {prova.area && (
                        <div className="text-xs text-purple-600">{prova.area}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prova.ano}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {prova.visualizacoes}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {prova.url_pdf && (
                          <a
                            href={prova.url_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            title="Visualizar Prova"
                          >
                            PROVA
                          </a>
                        )}
                        {prova.url_gabarito && (
                          <a
                            href={prova.url_gabarito}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                            title="Visualizar Gabarito"
                          >
                            GAB
                          </a>
                        )}
                        <Link
                          href={`/admin/dashboard/provas/${prova.id}/editar`}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Editar"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteSingle(prova.id)}
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

        {/* Modal de exclusão */}
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteMultiple}
          title="Excluir provas selecionadas"
          message={`Tem certeza que deseja excluir ${selectedProvas.size} prova${selectedProvas.size > 1 ? 's' : ''}?`}
          items={selectedProvasDetails}
          isDeleting={deletingProvas}
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
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import { Plus, Upload, Edit, Trash2, Eye, EyeOff, FileText, CheckCircle, CheckSquare, Square, X, Check, Save, XCircle } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AuthGuard from '@/components/admin/AuthGuard';
import { useToast } from '@/components/ui/toast';

interface Prova {
  id: string;
  instituicao: string;
  tipo_prova: string;
  ano: number;
  grupo_id: string;
  ordem: number;
  titulo: string;
  subtitulo?: string;
  subcategoria?: string;
  area?: string;
  url_prova?: string;
  url_gabarito?: string;
  visualizacoes: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface GrupoProvas {
  grupo_id: string;
  tipo_prova: string;
  instituicao: string;
  ano: number;
  titulo_principal: string;
  provas: Prova[];
}

interface EditForm {
  titulo: string;
  subtitulo: string;
  instituicao: string;
  tipo_prova: string;
  ano: number;
  subcategoria: string;
  area: string;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Algo deu errado</h2>
          <p className="text-gray-600 mb-4">Ocorreu um erro ao carregar a página.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function ProvasContent() {
  const [grupos, setGrupos] = useState<GrupoProvas[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState('todos');
  const [selecionadas, setSelecionadas] = useState<string[]>([]);
  const [modoSelecao, setModoSelecao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [editandoProva, setEditandoProva] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [salvando, setSalvando] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchProvas();
  }, []);

  // Debug effect
  useEffect(() => {
    console.log('Estados:', {
      editandoProva,
      provas: grupos.flatMap(g => g.provas).length,
      carregando: loading
    });
  }, [editandoProva, grupos, loading]);

  const fetchProvas = async () => {
    try {
      const { data, error } = await supabase
        .from('provas')
        .select('*')
        .order('ano', { ascending: false })
        .order('grupo_id')
        .order('ordem');

      if (error) throw error;

      // Agrupar provas por grupo_id
      const gruposMap = new Map<string, GrupoProvas>();
      
      data?.forEach(prova => {
        if (!gruposMap.has(prova.grupo_id)) {
          gruposMap.set(prova.grupo_id, {
            grupo_id: prova.grupo_id,
            tipo_prova: prova.tipo_prova,
            instituicao: prova.instituicao,
            ano: prova.ano,
            titulo_principal: `${prova.tipo_prova} ${prova.ano} - ${prova.instituicao}`,
            provas: []
          });
        }
        gruposMap.get(prova.grupo_id)!.provas.push(prova);
      });

      setGrupos(Array.from(gruposMap.values()));
    } catch (error) {
      console.error('Erro ao carregar provas:', error);
      toast.showToast('Erro ao carregar provas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicao = (prova: Prova) => {
    setEditandoProva(prova.id);
    setEditForm({
      titulo: prova.titulo,
      subtitulo: prova.subtitulo || '',
      instituicao: prova.instituicao,
      tipo_prova: prova.tipo_prova,
      ano: prova.ano,
      subcategoria: prova.subcategoria || '',
      area: prova.area || ''
    });
  };

  const cancelarEdicao = () => {
    setEditandoProva(null);
    setEditForm(null);
  };

  const salvarEdicao = async (provaId: string) => {
    if (!editForm) return;

    setSalvando(true);
    try {
      console.log('🔧 Salvando prova ID:', provaId);
      console.log('📝 Dados para salvamento:', editForm);
      
      // Usar API route para melhor controle de erros
      const response = await fetch(`/api/provas/${provaId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          titulo: editForm.titulo,
          subtitulo: editForm.subtitulo || null,
          instituicao: editForm.instituicao,
          tipo_prova: editForm.tipo_prova,
          ano: editForm.ano,
          subcategoria: editForm.subcategoria || null,
          area: editForm.area || null
        })
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Tratamento especial para erro de múltiplas linhas
        if (responseData.error?.includes('duplicado') || responseData.error?.includes('multiple')) {
          throw new Error('ID duplicado encontrado no banco. Por favor, execute a verificação de duplicatas no Supabase.');
        }
        throw new Error(responseData.error || `Erro ${response.status}`);
      }
      
      console.log('✅ Prova atualizada:', responseData);
      
      // Atualizar lista local com dados retornados da API
      setGrupos(prevGrupos => 
        prevGrupos.map(grupo => ({
          ...grupo,
          provas: grupo.provas.map(p => 
            p.id === provaId ? responseData : p
          )
        }))
      );
      
      cancelarEdicao();
      toast.showToast('Prova atualizada com sucesso!', 'success');
    } catch (error: any) {
      console.error('❌ Erro ao salvar:', error);
      toast.showToast(error.message || 'Erro ao atualizar prova', 'error');
    } finally {
      setSalvando(false);
    }
  };

  const toggleProvaAtiva = async (provaId: string, ativo: boolean) => {
    try {
      const { error } = await supabase
        .from('provas')
        .update({ ativo: !ativo })
        .eq('id', provaId);

      if (error) throw error;
      
      await fetchProvas();
      toast.showToast(ativo ? 'Prova desativada' : 'Prova ativada', 'success');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.showToast('Erro ao atualizar status', 'error');
    }
  };

  const deleteProva = async (provaId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta prova?')) return;

    try {
      // Buscar URLs dos arquivos
      const { data: prova } = await supabase
        .from('provas')
        .select('url_prova, url_gabarito')
        .eq('id', provaId)
        .single();

      if (prova) {
        // Deletar arquivos do storage
        const arquivosParaDeletar: string[] = [];
        
        if (prova.url_prova) {
          const path = prova.url_prova.split('/').slice(-2).join('/');
          arquivosParaDeletar.push(path);
        }
        
        if (prova.url_gabarito) {
          const path = prova.url_gabarito.split('/').slice(-2).join('/');
          arquivosParaDeletar.push(path);
        }
        
        if (arquivosParaDeletar.length > 0) {
          await supabase.storage.from('provas').remove(arquivosParaDeletar);
        }
      }

      const { error } = await supabase
        .from('provas')
        .delete()
        .eq('id', provaId);

      if (error) throw error;
      
      await fetchProvas();
      toast.showToast('Prova excluída com sucesso', 'success');
    } catch (error) {
      console.error('Erro ao excluir prova:', error);
      toast.showToast('Erro ao excluir prova', 'error');
    }
  };

  const toggleSelecao = (provaId: string) => {
    setSelecionadas(prev => 
      prev.includes(provaId) 
        ? prev.filter(id => id !== provaId)
        : [...prev, provaId]
    );
  };

  const selecionarTodas = () => {
    const todasIds = gruposFiltrados.flatMap(g => g.provas.map(p => p.id));
    setSelecionadas(todasIds);
  };

  const limparSelecao = () => {
    setSelecionadas([]);
    setModoSelecao(false);
  };

  const excluirSelecionadas = async () => {
    if (selecionadas.length === 0) return;
    
    const confirmar = confirm(`Deseja excluir ${selecionadas.length} prova(s)? Esta ação não pode ser desfeita.`);
    if (!confirmar) return;

    setExcluindo(true);

    try {
      // Buscar URLs dos arquivos para deletar do storage
      const { data: provasParaDeletar } = await supabase
        .from('provas')
        .select('url_prova, url_gabarito')
        .in('id', selecionadas);

      // Coletar todos os arquivos para deletar
      const arquivosParaDeletar: string[] = [];
      
      for (const prova of provasParaDeletar || []) {
        if (prova.url_prova) {
          const path = prova.url_prova.split('/').slice(-2).join('/');
          arquivosParaDeletar.push(path);
        }
        if (prova.url_gabarito) {
          const path = prova.url_gabarito.split('/').slice(-2).join('/');
          arquivosParaDeletar.push(path);
        }
      }

      // Deletar arquivos do storage em lote
      if (arquivosParaDeletar.length > 0) {
        await supabase.storage.from('provas').remove(arquivosParaDeletar);
      }

      // Deletar registros do banco
      const { error } = await supabase
        .from('provas')
        .delete()
        .in('id', selecionadas);

      if (error) throw error;

      // Recarregar lista
      await fetchProvas();
      limparSelecao();
      toast.showToast(`${selecionadas.length} prova(s) excluída(s) com sucesso!`, 'success');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.showToast('Erro ao excluir provas', 'error');
    } finally {
      setExcluindo(false);
    }
  };

  const gruposFiltrados = filtroAtivo === 'todos' 
    ? grupos 
    : grupos.filter(g => g.tipo_prova === filtroAtivo);

  const totalProvasSelecionadas = selecionadas.length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Provas</h1>
            <p className="text-gray-600 mt-1">Administre o banco de provas do sistema</p>
          </div>
          <div className="flex gap-3">
            {modoSelecao ? (
              <>
                <button
                  onClick={selecionarTodas}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Selecionar Todas ({gruposFiltrados.flatMap(g => g.provas).length})
                </button>
                <button
                  onClick={excluirSelecionadas}
                  disabled={totalProvasSelecionadas === 0 || excluindo}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {excluindo ? 'Excluindo...' : `Excluir (${totalProvasSelecionadas})`}
                </button>
                <button
                  onClick={limparSelecao}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setModoSelecao(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <CheckSquare className="w-4 h-4" />
                  Selecionar
                </button>
                <Link
                  href="/admin/dashboard/provas/upload-massa"
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload em Massa
                </Link>
                <Link
                  href="/admin/dashboard/provas/nova"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nova Prova
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['todos', 'PSC', 'PSI', 'SIS', 'MACRO', 'ENEM', 'UERR', 'UFRR'].map(tipo => (
            <button
              key={tipo}
              onClick={() => setFiltroAtivo(tipo)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                filtroAtivo === tipo
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {tipo === 'todos' ? 'Todas' : tipo}
            </button>
          ))}
        </div>

        {/* Lista de Provas */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-white rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {gruposFiltrados.map((grupo) => (
              <motion.div
                key={grupo.grupo_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                {/* Header do Grupo */}
                <div className="bg-gray-50 p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {grupo.titulo_principal}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {grupo.provas.length} {grupo.provas.length === 1 ? 'prova' : 'provas'} • 
                        {grupo.provas.reduce((acc, p) => acc + p.visualizacoes, 0)} visualizações totais
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {grupo.tipo_prova}
                    </span>
                  </div>
                </div>

                {/* Lista de Provas do Grupo */}
                <div className="divide-y">
                  {grupo.provas.map((prova) => (
                    <div key={prova.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {modoSelecao && (
                            <input
                              type="checkbox"
                              checked={selecionadas.includes(prova.id)}
                              onChange={() => toggleSelecao(prova.id)}
                              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-gray-900">
                                {prova.titulo}
                              </h4>
                              {prova.subtitulo && (
                                <span className="text-sm text-gray-600">
                                  ({prova.subtitulo})
                                </span>
                              )}
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                prova.ativo 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {prova.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                            {editandoProva === prova.id ? (
                              /* Modo de Edição Inline */
                              <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Título
                                    </label>
                                    <input
                                      type="text"
                                      value={editForm?.titulo || ''}
                                      onChange={(e) => setEditForm({ ...editForm!, titulo: e.target.value })}
                                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Subtítulo
                                    </label>
                                    <input
                                      type="text"
                                      value={editForm?.subtitulo || ''}
                                      onChange={(e) => setEditForm({ ...editForm!, subtitulo: e.target.value })}
                                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                      placeholder="Opcional"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Instituição
                                    </label>
                                    <select
                                      value={editForm?.instituicao || ''}
                                      onChange={(e) => setEditForm({ ...editForm!, instituicao: e.target.value })}
                                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                      <option value="UFAM">UFAM</option>
                                      <option value="UEA">UEA</option>
                                      <option value="UFRR">UFRR</option>
                                      <option value="UERR">UERR</option>
                                      <option value="ENEM">ENEM</option>
                                      <option value="OUTRAS">OUTRAS</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Tipo de Prova
                                    </label>
                                    <select
                                      value={editForm?.tipo_prova || ''}
                                      onChange={(e) => setEditForm({ ...editForm!, tipo_prova: e.target.value })}
                                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                      <option value="PSC">PSC</option>
                                      <option value="PSI">PSI</option>
                                      <option value="SIS">SIS</option>
                                      <option value="MACRO">MACRO</option>
                                      <option value="PSS">PSS</option>
                                      <option value="UERR">UERR</option>
                                      <option value="ENEM">ENEM</option>
                                      <option value="OUTROS">OUTROS</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Ano
                                    </label>
                                    <input
                                      type="number"
                                      value={editForm?.ano || ''}
                                      onChange={(e) => setEditForm({ ...editForm!, ano: parseInt(e.target.value) })}
                                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                      min="2000"
                                      max="2030"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Subcategoria
                                    </label>
                                    <input
                                      type="text"
                                      value={editForm?.subcategoria || ''}
                                      onChange={(e) => setEditForm({ ...editForm!, subcategoria: e.target.value })}
                                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                      placeholder="Ex: 1, 2, 3, DIA 1, CG"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Área
                                    </label>
                                    <input
                                      type="text"
                                      value={editForm?.area || ''}
                                      onChange={(e) => setEditForm({ ...editForm!, area: e.target.value })}
                                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                      placeholder="Ex: HUMANAS, EXATAS, BIOLÓGICAS"
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-3">
                                  <button
                                    onClick={cancelarEdicao}
                                    disabled={salvando}
                                    className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                                  >
                                    <XCircle className="w-4 h-4 inline mr-1" />
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={() => salvarEdicao(prova.id)}
                                    disabled={salvando}
                                    className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                                  >
                                    {salvando ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                        Salvando...
                                      </>
                                    ) : (
                                      <>
                                        <Save className="w-4 h-4 mr-1" />
                                        Salvar
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* Modo de Visualização */
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {prova.visualizacoes} visualizações
                                </span>
                                <span>
                                  Criado em {new Date(prova.created_at).toLocaleDateString('pt-BR')}
                                </span>
                                {(prova.subcategoria || prova.area) && (
                                  <span className="text-xs">
                                    {prova.subcategoria && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded mr-1">Sub: {prova.tipo_prova === 'MACRO' && prova.subcategoria === 'CG' ? 'DIA 1' : prova.subcategoria}</span>}
                                    {prova.area && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">Área: {prova.area}</span>}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* URLs */}
                            <div className="flex gap-4 mt-2">
                              {prova.url_prova && (
                                <a
                                  href={prova.url_prova}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700"
                                >
                                  <FileText className="w-4 h-4" />
                                  Ver Prova
                                </a>
                              )}
                              {prova.url_gabarito && (
                                <a
                                  href={prova.url_gabarito}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Ver Gabarito
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Ações */}
                        {!modoSelecao && (
                          <div className="flex items-center gap-2">
                            {editandoProva !== prova.id && (
                              <>
                                <button
                                  onClick={() => toggleProvaAtiva(prova.id, prova.ativo)}
                                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                  title={prova.ativo ? 'Desativar' : 'Ativar'}
                                >
                                  {prova.ativo ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                                <button
                                  onClick={() => iniciarEdicao(prova)}
                                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Editar inline"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => deleteProva(prova.id)}
                                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && gruposFiltrados.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhuma prova encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProvasPage() {
  return (
    <AuthGuard>
      <ErrorBoundary>
        <ProvasContent />
      </ErrorBoundary>
    </AuthGuard>
  );
}
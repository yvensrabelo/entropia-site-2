'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  FileText, 
  Send, 
  Eye, 
  Edit3, 
  Lock, 
  Unlock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  Search,
  Clock,
  DollarSign
} from 'lucide-react';

interface Turma {
  id: string;
  codigo: string;
  nome: string;
  turno: string;
}

interface Descritor {
  id: string;
  data: string;
  turma_codigo: string;
  turma_nome: string;
  turno: string;
  materia_nome: string;
  professor_nome: string;
  professor_cpf: string;
  tempo: number;
  hora_inicio: string;
  hora_fim: string;
  topico_nome?: string;
  descricao_livre: string;
  minutos_aula: number;
  enviado: boolean;
  status_envio: string;
  editavel: boolean;
  editado_admin: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminDescritoresPage() {
  const [loading, setLoading] = useState(false);
  const [descritores, setDescritores] = useState<Descritor[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [filtros, setFiltros] = useState({
    data: new Date().toISOString().split('T')[0],
    turma_id: '',
    status: 'todos', // todos, preenchidos, pendentes, enviados
    professor: ''
  });
  const [modalEnvio, setModalEnvio] = useState<{
    aberto: boolean;
    turma?: Turma;
    descritores: Descritor[];
  }>({ aberto: false, descritores: [] });
  const [modalEdicao, setModalEdicao] = useState<{
    aberto: boolean;
    descritor?: Descritor;
  }>({ aberto: false });
  const [edicaoForm, setEdicaoForm] = useState({
    topico_id: '',
    descricao_livre: ''
  });

  // ====================================================================
  // CARREGAR DADOS
  // ====================================================================
  const carregarTurmas = async () => {
    try {
      const response = await fetch('/api/admin/turmas-sistema');
      const data = await response.json();
      if (response.ok) {
        setTurmas(data.turmas || []);
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const carregarDescritores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        admin: 'true',
        data: filtros.data
      });

      if (filtros.turma_id) {
        params.append('turma_id', filtros.turma_id);
      }

      const response = await fetch(`/api/descritores-v2?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        let descritoresFiltrados = data.descritores || [];

        // Aplicar filtros
        if (filtros.status !== 'todos') {
          switch (filtros.status) {
            case 'preenchidos':
              descritoresFiltrados = descritoresFiltrados.filter((d: Descritor) => d.descricao_livre);
              break;
            case 'pendentes':
              descritoresFiltrados = descritoresFiltrados.filter((d: Descritor) => !d.descricao_livre);
              break;
            case 'enviados':
              descritoresFiltrados = descritoresFiltrados.filter((d: Descritor) => d.enviado);
              break;
          }
        }

        if (filtros.professor) {
          descritoresFiltrados = descritoresFiltrados.filter((d: Descritor) => 
            d.professor_nome.toLowerCase().includes(filtros.professor.toLowerCase())
          );
        }

        setDescritores(descritoresFiltrados);
      }
    } catch (error) {
      console.error('Erro ao carregar descritores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTurmas();
  }, []);

  useEffect(() => {
    carregarDescritores();
  }, [filtros]);

  // ====================================================================
  // FUNCÕES DE AÇÃO
  // ====================================================================
  const prepararEnvio = async (turma: Turma) => {
    try {
      const response = await fetch('/api/descritores-v2', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'preparar_envio',
          turma_id: turma.id,
          data: filtros.data
        })
      });

      const data = await response.json();
      if (response.ok) {
        setModalEnvio({
          aberto: true,
          turma,
          descritores: data.descritores
        });
      }
    } catch (error) {
      console.error('Erro ao preparar envio:', error);
    }
  };

  const confirmarEnvio = async () => {
    try {
      const descritoresIds = modalEnvio.descritores.map(d => d.descritor_id);
      
      const response = await fetch('/api/descritores-v2', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirmar_envio',
          descritor_ids: descritoresIds,
          turma_id: modalEnvio.turma?.id,
          data: filtros.data
        })
      });

      if (response.ok) {
        setModalEnvio({ aberto: false, descritores: [] });
        carregarDescritores();
      }
    } catch (error) {
      console.error('Erro ao confirmar envio:', error);
    }
  };

  const bloquearEdicao = async (descritores: string[]) => {
    try {
      const response = await fetch('/api/descritores-v2', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bloquear_edicao',
          descritor_ids: descritores
        })
      });

      if (response.ok) {
        carregarDescritores();
      }
    } catch (error) {
      console.error('Erro ao bloquear edição:', error);
    }
  };

  const editarDescritor = (descritor: Descritor) => {
    setEdicaoForm({
      topico_id: descritor.topico_nome || '',
      descricao_livre: descritor.descricao_livre
    });
    setModalEdicao({ aberto: true, descritor });
  };

  const salvarEdicao = async () => {
    if (!modalEdicao.descritor) return;

    try {
      const response = await fetch('/api/descritores-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horario_id: modalEdicao.descritor.id, // Ajustar conforme necessário
          professor_cpf: modalEdicao.descritor.professor_cpf,
          data: modalEdicao.descritor.data,
          topico_id: edicaoForm.topico_id || null,
          descricao_livre: edicaoForm.descricao_livre,
          is_admin: true
        })
      });

      if (response.ok) {
        setModalEdicao({ aberto: false });
        carregarDescritores();
      }
    } catch (error) {
      console.error('Erro ao salvar edição:', error);
    }
  };

  // ====================================================================
  // ESTATÍSTICAS
  // ====================================================================
  const estatisticas = {
    total: descritores.length,
    preenchidos: descritores.filter(d => d.descricao_livre).length,
    enviados: descritores.filter(d => d.enviado).length,
    totalMinutos: descritores.reduce((sum, d) => sum + (d.minutos_aula || 0), 0)
  };

  const porcentagemPreenchidos = estatisticas.total > 0 
    ? Math.round((estatisticas.preenchidos / estatisticas.total) * 100) 
    : 0;

  // ====================================================================
  // RENDER
  // ====================================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestão de Descritores
          </h1>
          <p className="text-gray-600">
            Acompanhe e gerencie os descritores de aulas preenchidos pelos professores
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{estatisticas.total}</p>
                <p className="text-gray-600">Total de Aulas</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{estatisticas.preenchidos}</p>
                <p className="text-gray-600">Preenchidos ({porcentagemPreenchidos}%)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Send className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{estatisticas.enviados}</p>
                <p className="text-gray-600">Enviados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{estatisticas.totalMinutos}</p>
                <p className="text-gray-600">Minutos Registrados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <input
                type="date"
                value={filtros.data}
                onChange={(e) => setFiltros({ ...filtros, data: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Turma
              </label>
              <select
                value={filtros.turma_id}
                onChange={(e) => setFiltros({ ...filtros, turma_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas as turmas</option>
                {turmas.map(turma => (
                  <option key={turma.id} value={turma.id}>
                    {turma.codigo} - {turma.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="preenchidos">Preenchidos</option>
                <option value="pendentes">Pendentes</option>
                <option value="enviados">Enviados</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professor
              </label>
              <input
                type="text"
                placeholder="Buscar professor..."
                value={filtros.professor}
                onChange={(e) => setFiltros({ ...filtros, professor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lista de Descritores */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Descritores ({descritores.length})
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const preenchidos = descritores.filter(d => d.descricao_livre && d.editavel);
                    if (preenchidos.length > 0) {
                      bloquearEdicao(preenchidos.map(d => d.id));
                    }
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <Lock className="w-4 h-4 mr-2 inline" />
                  Bloquear Edição
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando descritores...</p>
            </div>
          ) : descritores.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum descritor encontrado para os filtros selecionados</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {descritores.map((descritor, index) => (
                <motion.div
                  key={descritor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                          {descritor.tempo}º Tempo
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          {descritor.hora_inicio} - {descritor.hora_fim}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">
                          ({descritor.minutos_aula} min)
                        </span>
                      </div>

                      <h4 className="font-semibold text-gray-900 mb-1">
                        {descritor.materia_nome} - {descritor.turma_codigo}
                      </h4>
                      <p className="text-gray-600 mb-2">
                        Professor: {descritor.professor_nome}
                      </p>

                      {descritor.descricao_livre ? (
                        <div className="bg-gray-50 rounded-lg p-3 mb-2">
                          {descritor.topico_nome && (
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              Tópico: {descritor.topico_nome}
                            </p>
                          )}
                          <p className="text-sm text-gray-700">
                            {descritor.descricao_livre}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                          <div className="flex items-center">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                            <span className="text-yellow-700 text-sm">
                              Descritor não preenchido
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          Criado: {new Date(descritor.created_at).toLocaleString('pt-BR')}
                        </span>
                        {descritor.updated_at !== descritor.created_at && (
                          <span>
                            Atualizado: {new Date(descritor.updated_at).toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {/* Status */}
                      {descritor.enviado ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          Enviado
                        </span>
                      ) : descritor.descricao_livre ? (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Preenchido
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Pendente
                        </span>
                      )}

                      {/* Ações */}
                      {descritor.descricao_livre && (
                        <>
                          <button
                            onClick={() => editarDescritor(descritor)}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          {descritor.editavel ? (
                            <button
                              onClick={() => bloquearEdicao([descritor.id])}
                              className="p-2 text-gray-600 hover:text-yellow-600 transition-colors"
                              title="Bloquear edição"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="p-2 text-gray-400" title="Edição bloqueada">
                              <Lock className="w-4 h-4" />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Ações por Turma */}
        {turmas.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Envio por Turma
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {turmas.map(turma => {
                const descritoresTurma = descritores.filter(d => d.turma_codigo === turma.codigo);
                const preenchidos = descritoresTurma.filter(d => d.descricao_livre).length;
                const total = descritoresTurma.length;
                const podeEnviar = preenchidos === total && total > 0;

                return (
                  <div key={turma.id} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {turma.codigo}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {turma.nome}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      {preenchidos}/{total} descritores preenchidos
                    </p>
                    
                    <button
                      onClick={() => prepararEnvio(turma)}
                      disabled={!podeEnviar}
                      className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                        podeEnviar
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-4 h-4 mr-2 inline" />
                      Enviar Descritores
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Envio */}
      {modalEnvio.aberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Confirmar Envio - {modalEnvio.turma?.codigo}
              </h3>
              
              <div className="space-y-3 mb-6">
                {modalEnvio.descritores.map(descritor => (
                  <div key={descritor.descritor_id} className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-gray-900">
                      {descritor.materia_nome} - {descritor.professor_nome}
                    </p>
                    <p className="text-sm text-gray-600">
                      {descritor.topico_nome && `Tópico: ${descritor.topico_nome} | `}
                      {descritor.hora_inicio} - {descritor.hora_fim}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setModalEnvio({ aberto: false, descritores: [] })}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEnvio}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirmar Envio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {modalEdicao.aberto && modalEdicao.descritor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Editar Descritor
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Professor: {modalEdicao.descritor.professor_nome}
                  </label>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aula: {modalEdicao.descritor.materia_nome} - {modalEdicao.descritor.tempo}º Tempo
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição da Aula
                  </label>
                  <textarea
                    value={edicaoForm.descricao_livre}
                    onChange={(e) => setEdicaoForm({ ...edicaoForm, descricao_livre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Descrição da aula..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setModalEdicao({ aberto: false })}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarEdicao}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
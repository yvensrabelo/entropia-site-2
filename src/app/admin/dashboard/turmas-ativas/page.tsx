'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, GripVertical, Calendar, Users, Sun, Cloud, Moon } from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';
import { turmasService } from '@/services/turmasService';

interface TurmaAtiva {
  id: string;
  nome: string;
  turno: 'manhã' | 'tarde' | 'noite';
  tipo: 'intensiva' | 'extensiva' | 'sis-psc';
  serie?: '1ª série' | '2ª série' | '3ª série' | 'Extensivo';
  ativa: boolean;
  ordem: number;
}

const TURMAS_PADRAO: Omit<TurmaAtiva, 'id' | 'ordem'>[] = [
  { nome: 'INTENSIVA', turno: 'manhã', tipo: 'intensiva', ativa: true },
  { nome: 'EXTENSIVA MATUTINA 1', turno: 'manhã', tipo: 'extensiva', serie: '1ª série', ativa: true },
  { nome: 'EXTENSIVA MATUTINA 2', turno: 'manhã', tipo: 'extensiva', serie: '2ª série', ativa: true },
  { nome: 'EXTENSIVA VESPERTINA 1', turno: 'tarde', tipo: 'extensiva', serie: '1ª série', ativa: true },
  { nome: 'EXTENSIVA VESPERTINA 2', turno: 'tarde', tipo: 'extensiva', serie: '2ª série', ativa: true },
  { nome: 'EXTENSIVA NOTURNA 1', turno: 'noite', tipo: 'extensiva', serie: '3ª série', ativa: true },
  { nome: 'TURMA SIS/PSC 1', turno: 'manhã', tipo: 'sis-psc', serie: 'Extensivo', ativa: true },
  { nome: 'TURMA SIS/PSC 2', turno: 'tarde', tipo: 'sis-psc', serie: 'Extensivo', ativa: true },
];

// Função para converter TurmaSimples em TurmaAtiva
const convertTurmasSimplesToAtivas = (turmasSimples: any[]): TurmaAtiva[] => {
  return turmasSimples.map((turma, index) => ({
    id: turma.id,
    nome: turma.nome,
    turno: 'manhã' as 'manhã' | 'tarde' | 'noite',
    tipo: turma.foco as 'intensiva' | 'extensiva' | 'sis-psc',
    serie: turma.serie === '1' ? '1ª série' : 
           turma.serie === '2' ? '2ª série' : 
           turma.serie === '3' ? '3ª série' : 'Extensivo',
    ativa: turma.ativa || false,
    ordem: index
  }));
};

export default function TurmasAtivasPage() {
  const [turmas, setTurmas] = useState<TurmaAtiva[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTurma, setEditingTurma] = useState<TurmaAtiva | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    turno: 'manhã' as 'manhã' | 'tarde' | 'noite',
    tipo: 'extensiva' as 'intensiva' | 'extensiva' | 'sis-psc',
    serie: '' as '1ª série' | '2ª série' | '3ª série' | 'Extensivo' | '',
    ativa: true
  });

  useEffect(() => {
    loadTurmas();
  }, []);

  const loadTurmas = async () => {
    try {
      const turmasDB = await turmasService.listarTurmas();
      
      if (turmasDB.length === 0) {
        // Inicializar com turmas padrão - não incluir campos que não existem em TurmaSimples
        for (const turma of TURMAS_PADRAO) {
          await turmasService.criarTurma({
            nome: turma.nome,
            foco: turma.tipo, // Mapear tipo para foco
            serie: '1', // Default 
            beneficios: [] // Vazio por padrão
          });
        }
        // Recarregar após inserir
        const novasTurmas = await turmasService.listarTurmas();
        setTurmas(convertTurmasSimplesToAtivas(novasTurmas));
      } else {
        setTurmas(convertTurmasSimplesToAtivas(turmasDB));
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dadosTurma = {
      nome: formData.nome,
      foco: formData.tipo, // Mapear tipo para foco
      serie: (formData.serie === '1ª série' ? '1' : 
             formData.serie === '2ª série' ? '2' : 
             formData.serie === '3ª série' ? '3' : 'formado') as '1' | '2' | '3' | 'formado',
      beneficios: [], // Vazio por padrão
      ativa: formData.ativa
    };

    try {
      if (editingTurma) {
        await turmasService.atualizarTurma(editingTurma.id, dadosTurma);
      } else {
        await turmasService.criarTurma(dadosTurma);
      }
      
      // Recarregar lista
      const turmasAtualizadas = await turmasService.listarTurmas();
      setTurmas(convertTurmasSimplesToAtivas(turmasAtualizadas));
      
      setShowModal(false);
      setEditingTurma(null);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
      alert('Erro ao salvar turma');
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      turno: 'manhã',
      tipo: 'extensiva',
      serie: '',
      ativa: true
    });
  };

  const handleEdit = (turma: TurmaAtiva) => {
    setEditingTurma(turma);
    setFormData({
      nome: turma.nome,
      turno: turma.turno,
      tipo: turma.tipo,
      serie: turma.serie || '',
      ativa: turma.ativa
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      try {
        await turmasService.excluirTurma(id);
        const turmasAtualizadas = await turmasService.listarTurmas();
        setTurmas(convertTurmasSimplesToAtivas(turmasAtualizadas));
      } catch (error) {
        console.error('Erro ao excluir turma:', error);
        alert('Erro ao excluir turma');
      }
    }
  };

  const toggleAtiva = async (id: string) => {
    try {
      const turma = turmas.find(t => t.id === id);
      if (turma) {
        await turmasService.atualizarTurma(id, { ativa: !turma.ativa });
        const turmasAtualizadas = await turmasService.listarTurmas();
        setTurmas(convertTurmasSimplesToAtivas(turmasAtualizadas));
      }
    } catch (error) {
      console.error('Erro ao atualizar status da turma:', error);
      alert('Erro ao atualizar status da turma');
    }
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    // Simplificado - apenas recarregar as turmas (ordem não é suportada em TurmaSimples)
    console.log('Reordenação não implementada para TurmaSimples');
  };

  const moveDown = async (index: number) => {
    if (index === turmas.length - 1) return;
    // Simplificado - apenas recarregar as turmas (ordem não é suportada em TurmaSimples)
    console.log('Reordenação não implementada para TurmaSimples');
  };

  const getTurnoIcon = (turno: string) => {
    switch (turno) {
      case 'manhã': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'tarde': return <Cloud className="w-4 h-4 text-orange-500" />;
      case 'noite': return <Moon className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'intensiva': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'extensiva': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sis-psc': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const turmasAtivas = turmas.filter(t => t.ativa).length;
  const turmasInativas = turmas.filter(t => !t.ativa).length;

  return (
    <AuthGuard>
      <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Turmas Ativas</h1>
        <p className="text-gray-600 mt-1">Gerencie as turmas operacionais do curso</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total de Turmas</p>
              <p className="text-2xl font-bold text-gray-800">{turmas.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Turmas Ativas</p>
              <p className="text-2xl font-bold text-green-600">{turmasAtivas}</p>
            </div>
            <ToggleRight className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Turmas Inativas</p>
              <p className="text-2xl font-bold text-gray-600">{turmasInativas}</p>
            </div>
            <ToggleLeft className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => {
            setEditingTurma(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Turma
        </button>
      </div>

      {/* Lista de Turmas */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ordem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome da Turma
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Turno
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Série
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {turmas.map((turma, index) => (
              <tr key={turma.id} className={turma.ativa ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-60'}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === turmas.length - 1}
                      className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ↓
                    </button>
                    <span className="text-sm text-gray-500 ml-1">{index + 1}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{turma.nome}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getTurnoIcon('manhã')}
                    <span className="text-sm text-gray-700 capitalize">manhã</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTipoColor(turma.tipo)}`}>
                    {turma.tipo.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {turma.serie || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleAtiva(turma.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      turma.ativa 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {turma.ativa ? (
                      <>
                        <ToggleRight className="w-4 h-4" />
                        Ativa
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4" />
                        Inativa
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(turma)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(turma.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {turmas.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma turma cadastrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando uma nova turma operacional.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingTurma ? 'Editar Turma' : 'Nova Turma'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Turma *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    placeholder="Ex: EXTENSIVA MATUTINA 1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Turno *
                  </label>
                  <select
                    value={formData.turno}
                    onChange={(e) => setFormData({ ...formData, turno: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="manhã">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="intensiva">Intensiva</option>
                    <option value="extensiva">Extensiva</option>
                    <option value="sis-psc">SIS/PSC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Série (opcional)
                  </label>
                  <select
                    value={formData.serie}
                    onChange={(e) => setFormData({ ...formData, serie: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="">Não especificada</option>
                    <option value="1ª série">1ª série</option>
                    <option value="2ª série">2ª série</option>
                    <option value="3ª série">3ª série</option>
                    <option value="Extensivo">Extensivo</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.ativa}
                      onChange={(e) => setFormData({ ...formData, ativa: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Turma ativa</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTurma(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingTurma ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AuthGuard>
  );
}
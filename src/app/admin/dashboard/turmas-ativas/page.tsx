'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, GripVertical, Calendar, Users, Sun, Cloud, Moon } from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';
import { turmasService } from '@/services/turmasService';
import { Serie } from '@/lib/types/turma';

interface TurmaAtiva {
  id: string;
  nome: string;
  turnos: ('matutino' | 'vespertino' | 'noturno')[];
  tipo: 'intensiva' | 'extensiva' | 'sis-psc';
  seriesAtendidas?: ('1ª série' | '2ª série' | '3ª série' | 'Extensivo')[];
  ativa: boolean;
  ordem: number;
}

const TURMAS_PADRAO: Omit<TurmaAtiva, 'id' | 'ordem'>[] = [
  // Turmas para 1ª série (apenas vespertino)
  { nome: 'PSC UFAM - 1ª SÉRIE VESPERTINA', turnos: ['vespertino'], tipo: 'extensiva', seriesAtendidas: ['1ª série'], ativa: true },
  
  // Turmas para 2ª série  
  { nome: 'ENEM PRO - 2ª SÉRIE MATUTINA', turnos: ['matutino'], tipo: 'extensiva', seriesAtendidas: ['2ª série'], ativa: true },
  { nome: 'ENEM PRO - 2ª SÉRIE VESPERTINA', turnos: ['vespertino'], tipo: 'extensiva', seriesAtendidas: ['2ª série'], ativa: true },
  { nome: 'ENEM PRO - 2ª SÉRIE NOTURNA', turnos: ['noturno'], tipo: 'extensiva', seriesAtendidas: ['2ª série'], ativa: true },
  
  // Turmas para 3ª série (mantendo as existentes)
  { nome: 'PSC UFAM - 3ª SÉRIE INTENSIVA', turnos: ['matutino'], tipo: 'intensiva', seriesAtendidas: ['3ª série'], ativa: true },
  { nome: 'PSC UFAM - 3ª SÉRIE MATUTINA', turnos: ['matutino'], tipo: 'extensiva', seriesAtendidas: ['3ª série'], ativa: true },
  { nome: 'PSC UFAM - 3ª SÉRIE VESPERTINA', turnos: ['vespertino'], tipo: 'extensiva', seriesAtendidas: ['3ª série'], ativa: true },
  { nome: 'PSC UFAM - 3ª SÉRIE NOTURNA', turnos: ['noturno'], tipo: 'extensiva', seriesAtendidas: ['3ª série'], ativa: true },
  
  // Turmas para formados/extensivo (mantendo as existentes)
  { nome: 'TURMA SIS/PSC MATUTINA', turnos: ['matutino'], tipo: 'sis-psc', seriesAtendidas: ['Extensivo'], ativa: true },
  { nome: 'TURMA SIS/PSC VESPERTINA', turnos: ['vespertino'], tipo: 'sis-psc', seriesAtendidas: ['Extensivo'], ativa: true },
];

// Função para converter TurmaSimples em TurmaAtiva
const convertTurmasSimplesToAtivas = (turmasSimples: any[]): TurmaAtiva[] => {
  return turmasSimples.map((turma, index) => ({
    id: turma.id,
    nome: turma.nome,
    turnos: turma.turnos || ['matutino'],
    tipo: turma.foco as 'intensiva' | 'extensiva' | 'sis-psc',
    seriesAtendidas: turma.seriesAtendidas?.map((s: string) => 
      s === '1' ? '1ª série' : 
      s === '2' ? '2ª série' : 
      s === '3' ? '3ª série' : 'Extensivo'
    ) || ['1ª série'],
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
    turnos: ['matutino'] as ('matutino' | 'vespertino' | 'noturno')[],
    tipo: 'extensiva' as 'intensiva' | 'extensiva' | 'sis-psc',
    seriesAtendidas: [''] as ('1ª série' | '2ª série' | '3ª série' | 'Extensivo' | '')[],
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
            serie: '1' as Serie, // Default 
            turnos: turma.turnos, // NOVO - array de turnos
            seriesAtendidas: turma.seriesAtendidas?.map(s => 
              s === '1ª série' ? '1' : 
              s === '2ª série' ? '2' : 
              s === '3ª série' ? '3' : 'formado'
            ) as Serie[] || ['1'], // NOVO - array de séries
            beneficios: [], // Vazio por padrão
            // NOVOS CAMPOS OBRIGATÓRIOS
            precoMensal: 180.00, // Valor padrão
            duracaoMeses: 12 // Duração padrão
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
      serie: '1' as Serie, // Default
      turnos: formData.turnos, // NOVO - array de turnos
      seriesAtendidas: formData.seriesAtendidas.filter(s => s !== '').map(s => 
        s === '1ª série' ? '1' : 
        s === '2ª série' ? '2' : 
        s === '3ª série' ? '3' : 'formado'
      ) as Serie[], // NOVO - array de séries
      beneficios: [], // Vazio por padrão
      ativa: formData.ativa,
      // NOVOS CAMPOS OBRIGATÓRIOS
      precoMensal: 180.00, // Valor padrão
      duracaoMeses: 12 // Duração padrão
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
      turnos: ['matutino'],
      tipo: 'extensiva',
      seriesAtendidas: [''],
      ativa: true
    });
  };

  const handleEdit = (turma: TurmaAtiva) => {
    setEditingTurma(turma);
    setFormData({
      nome: turma.nome,
      turnos: turma.turnos,
      tipo: turma.tipo,
      seriesAtendidas: turma.seriesAtendidas || [''],
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
      case 'matutino': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'vespertino': return <Cloud className="w-4 h-4 text-orange-500" />;
      case 'noturno': return <Moon className="w-4 h-4 text-blue-500" />;
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
                Turnos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Séries Atendidas
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
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {turma.turnos?.map(turno => (
                      <span key={turno} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {getTurnoIcon(turno)}
                        <span className="capitalize">{turno}</span>
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getTipoColor(turma.tipo)}`}>
                    {turma.tipo.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {turma.seriesAtendidas?.map(serie => (
                      <span key={serie} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {serie}
                      </span>
                    ))}
                  </div>
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
                    value={formData.turnos[0] || 'matutino'}
                    onChange={(e) => setFormData({ ...formData, turnos: [e.target.value as any] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  >
                    <option value="matutino">🌅 Matutino</option>
                    <option value="vespertino">☁️ Vespertino</option>
                    <option value="noturno">🌙 Noturno</option>
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
                    value={formData.seriesAtendidas[0] || ''}
                    onChange={(e) => setFormData({ ...formData, seriesAtendidas: [e.target.value as any] })}
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
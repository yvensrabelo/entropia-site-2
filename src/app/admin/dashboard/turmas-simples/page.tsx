'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { TurmaSimples } from '@/lib/types/turma';
import AuthGuard from '@/components/admin/AuthGuard';

export default function TurmasSimples() {
  const [turmas, setTurmas] = useState<TurmaSimples[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<TurmaSimples | null>(null);
  const [formData, setFormData] = useState<Omit<TurmaSimples, 'id'>>({
    nome: '',
    foco: '',
    serie: '3',
    beneficios: [],
    ativa: true
  });
  const [newBeneficio, setNewBeneficio] = useState('');

  useEffect(() => {
    loadTurmas();
  }, []);

  const loadTurmas = () => {
    try {
      const stored = localStorage.getItem('turmas_simples');
      if (stored) {
        setTurmas(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const saveTurmas = (novasTurmas: TurmaSimples[]) => {
    localStorage.setItem('turmas_simples', JSON.stringify(novasTurmas));
    setTurmas(novasTurmas);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.foco.trim()) {
      alert('Nome da turma e foco são obrigatórios');
      return;
    }

    const novaTurma: TurmaSimples = {
      ...formData,
      id: editingTurma?.id || Date.now().toString()
    };

    let novasTurmas: TurmaSimples[];
    if (editingTurma) {
      novasTurmas = turmas.map(t => t.id === editingTurma.id ? novaTurma : t);
    } else {
      novasTurmas = [...turmas, novaTurma];
    }

    saveTurmas(novasTurmas);
    handleCloseModal();
  };

  const handleEdit = (turma: TurmaSimples) => {
    setEditingTurma(turma);
    setFormData({
      nome: turma.nome,
      foco: turma.foco,
      serie: turma.serie,
      beneficios: [...turma.beneficios],
      ativa: turma.ativa ?? true
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      const novasTurmas = turmas.filter(t => t.id !== id);
      saveTurmas(novasTurmas);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTurma(null);
    setFormData({
      nome: '',
      foco: '',
      serie: '3',
      beneficios: [],
      ativa: true
    });
    setNewBeneficio('');
  };

  const toggleAtiva = (id: string) => {
    const novasTurmas = turmas.map(t => 
      t.id === id ? { ...t, ativa: !t.ativa } : t
    );
    saveTurmas(novasTurmas);
  };

  const addBeneficio = () => {
    if (newBeneficio.trim()) {
      setFormData({
        ...formData,
        beneficios: [...formData.beneficios, { texto: newBeneficio.trim(), destaquePlatinado: false }]
      });
      setNewBeneficio('');
    }
  };

  const removeBeneficio = (index: number) => {
    setFormData({
      ...formData,
      beneficios: formData.beneficios.filter((_, i) => i !== index)
    });
  };

  const toggleDestaquePlatinado = (index: number) => {
    const newBeneficios = [...formData.beneficios];
    newBeneficios[index].destaquePlatinado = !newBeneficios[index].destaquePlatinado;
    setFormData({ ...formData, beneficios: newBeneficios });
  };

  const getSerieLabel = (serie: string) => {
    switch (serie) {
      case '1': return '1ª Série';
      case '2': return '2ª Série';
      case '3': return '3ª Série';
      case 'formado': return 'Já Formado';
      default: return serie;
    }
  };

  const getSerieColor = (serie: string) => {
    switch (serie) {
      case '1': return 'bg-blue-100 text-blue-800';
      case '2': return 'bg-green-100 text-green-800';
      case '3': return 'bg-purple-100 text-purple-800';
      case 'formado': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AuthGuard>
      <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turmas</h1>
          <p className="text-gray-600">Sistema simplificado de gerenciamento de turmas</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Turma
        </button>
      </div>

      {/* Lista de Turmas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome da Turma
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Foco
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Série
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Benefícios
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
            {turmas.map((turma) => (
              <tr key={turma.id} className={turma.ativa === false ? 'opacity-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{turma.nome}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-700 max-w-xs">
                    {turma.foco}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSerieColor(turma.serie)}`}>
                    {getSerieLabel(turma.serie)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600">
                    {turma.beneficios.length} benefício(s)
                    {turma.beneficios.some(b => b.destaquePlatinado) && (
                      <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                        ⭐ Destaque
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleAtiva(turma.id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      turma.ativa !== false
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {turma.ativa !== false ? (
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma turma cadastrada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comece criando uma nova turma.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingTurma ? 'Editar Turma' : 'Nova Turma'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome da Turma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Turma *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: PSC INTENSIVO"
                />
              </div>

              {/* Foco da Turma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Foco da Turma *
                </label>
                <input
                  type="text"
                  required
                  value={formData.foco}
                  onChange={(e) => setFormData({ ...formData, foco: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: PREPARAÇÃO COMPLETA PARA O PSC"
                />
              </div>

              {/* Série Vinculada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Série Vinculada *
                </label>
                <select
                  value={formData.serie}
                  onChange={(e) => setFormData({ ...formData, serie: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="1">1ª Série</option>
                  <option value="2">2ª Série</option>
                  <option value="3">3ª Série</option>
                  <option value="formado">Já Formado</option>
                </select>
              </div>

              {/* Benefícios da Turma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefícios da Turma
                </label>
                
                {/* Adicionar novo benefício */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newBeneficio}
                    onChange={(e) => setNewBeneficio(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBeneficio())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Digite um benefício..."
                  />
                  <button
                    type="button"
                    onClick={addBeneficio}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Adicionar
                  </button>
                </div>

                {/* Lista de benefícios */}
                <div className="space-y-3">
                  {formData.beneficios.map((beneficio, index) => (
                    <div key={index} className={`p-4 border rounded-lg transition-all ${
                      beneficio.destaquePlatinado 
                        ? 'beneficio-platinado-form border-purple-200 shadow-sm' 
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <span className={beneficio.destaquePlatinado ? 'text-purple-600 text-lg' : 'text-green-600 text-lg'}>
                            {beneficio.destaquePlatinado ? '✦' : '✓'}
                          </span>
                          <span className={`text-sm ${beneficio.destaquePlatinado ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                            {beneficio.texto}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleDestaquePlatinado(index)}
                            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                              beneficio.destaquePlatinado 
                                ? 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200' 
                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {beneficio.destaquePlatinado ? '✦ Platinado' : 'Normal'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeBeneficio(index)}
                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                            title="Remover benefício"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* CSS para efeito platinado no formulário */}
                <style jsx>{`
                  .beneficio-platinado-form {
                    background: linear-gradient(to right, 
                      rgba(74, 222, 128, 0.15),  /* green */
                      rgba(96, 165, 250, 0.15),  /* blue */
                      rgba(196, 181, 253, 0.15)  /* purple */
                    );
                    backdrop-filter: blur(4px);
                  }
                `}</style>
              </div>

              {/* Preview do Card */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Preview - Como aparece na página inicial</h4>
                <div className="max-w-sm mx-auto bg-white p-6 rounded-2xl shadow-lg">
                  {/* Nome da Turma */}
                  <h3 className="text-3xl font-black text-gray-900 mb-2 text-center">
                    {formData.nome || 'Nome da Turma'}
                  </h3>
                  
                  {/* Foco da Turma */}
                  <p className="text-lg font-medium text-gray-600 text-center mb-6">
                    {formData.foco || 'FOCO DA TURMA'}
                  </p>

                  {/* Lista de Benefícios */}
                  {formData.beneficios.length > 0 ? (
                    <ul className="space-y-3 mb-6">
                      {formData.beneficios.map((beneficio, idx) => (
                        <li key={idx} className={
                          beneficio.destaquePlatinado 
                            ? "beneficio-platinado-preview p-3 rounded-lg shadow-sm border border-white/20 backdrop-blur-sm"
                            : "flex items-center gap-3 text-gray-800 font-medium"
                        }>
                          {beneficio.destaquePlatinado ? (
                            <div className="flex items-center gap-3 text-gray-900 font-semibold">
                              <span className="text-purple-600 text-lg">✦</span>
                              {beneficio.texto}
                            </div>
                          ) : (
                            <>
                              <span className="text-green-600 text-lg">✓</span> 
                              {beneficio.texto}
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center text-gray-500 mb-6">
                      <p className="text-sm">Configure os benefícios</p>
                    </div>
                  )}

                  {/* Botão Reservar Minha Vaga */}
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-default">
                    RESERVAR MINHA VAGA
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    ↗️ Redireciona para o formulário de matrícula
                  </p>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  ℹ️ Aparecerá na aba: <strong>{getSerieLabel(formData.serie)}</strong>
                </p>
                
                {/* CSS para efeito platinado no preview */}
                <style jsx>{`
                  .beneficio-platinado-preview {
                    background: linear-gradient(to right, 
                      rgba(74, 222, 128, 0.2),  /* green */
                      rgba(96, 165, 250, 0.2),  /* blue */
                      rgba(196, 181, 253, 0.2)  /* purple */
                    );
                    backdrop-filter: blur(8px);
                  }
                `}</style>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
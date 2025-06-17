'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight, GripVertical, Sun, Cloud, Moon, Check } from 'lucide-react';
import { TurmaSimples, Turno, Serie } from '@/lib/types/turma';
import AuthGuard from '@/components/admin/AuthGuard';
import { turmasService } from '@/services/turmasService';

export default function TurmasSimples() {
  const [turmas, setTurmas] = useState<TurmaSimples[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<TurmaSimples | null>(null);
  const [formData, setFormData] = useState<Omit<TurmaSimples, 'id'>>({
    nome: '',
    foco: '',
    serie: '3', // mantido para compatibilidade
    turnos: ['matutino'], // NOVO - array de turnos
    seriesAtendidas: ['3'], // NOVO - array de séries - campo principal
    beneficios: [],
    ativa: true,
    // NOVOS CAMPOS DE VALOR E DURAÇÃO
    precoMensal: 0,
    duracaoMeses: 12
  });
  const [newBeneficio, setNewBeneficio] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const carregarTurmas = async () => {
      setIsLoading(true);
      try {
        const turmasDB = await turmasService.listarTurmas(false); // false para mostrar todas
        
        // Validar dados antes de usar
        const turmasValidas = turmasDB.filter(turma => {
          if (!turma.nome || !turma.id) {
            console.warn('Turma inválida encontrada:', turma);
            return false;
          }
          
          // Garantir que beneficios é um array válido
          if (!Array.isArray(turma.beneficios)) {
            turma.beneficios = [];
          }
          
          return true;
        });
        
        setTurmas(turmasValidas);
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
        alert('Erro ao carregar turmas. Recarregue a página.');
      } finally {
        setIsLoading(false);
      }
    };
    carregarTurmas();
  }, []);

  const salvarTurma = async (turma: TurmaSimples) => {
    setIsSaving(true);
    try {
      let sucesso = false;
      
      if (turma.id && turmas.find(t => t.id === turma.id)) {
        // Atualizar turma existente
        sucesso = await turmasService.atualizarTurma(turma.id, turma);
      } else {
        // Criar nova turma
        const turmaCriada = await turmasService.criarTurma(turma);
        sucesso = !!turmaCriada;
      }
      
      if (sucesso) {
        // Recarregar lista atualizada
        const turmasAtualizadas = await turmasService.listarTurmas(false);
        setTurmas(turmasAtualizadas);
      } else {
        throw new Error('Falha ao salvar turma');
      }
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
      alert('Erro ao salvar turma. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const salvarTodasTurmas = async () => {
    console.log('Iniciando salvamento de todas as turmas...');
    console.log('Total de turmas a salvar:', turmas.length);
    console.log('Turmas:', turmas);
    
    setIsSaving(true);
    let sucesso = true;
    
    try {
      // Para CADA turma no array
      for (const turma of turmas) {
        try {
          console.log('Processando turma:', turma.nome, 'ID:', turma.id);
          
          if (turma.id && turma.id !== '' && !turma.id.toString().startsWith('temp_')) {
            // Turma existente - ATUALIZAR
            console.log('Atualizando turma existente:', turma.nome);
            const resultado = await turmasService.atualizarTurma(turma.id, {
              nome: turma.nome,
              foco: turma.foco,
              // Usar primeira série atendida como série padrão para compatibilidade
              serie: turma.seriesAtendidas?.[0] || '3',
              turnos: turma.turnos || ['matutino'], // NOVO - array de turnos
              seriesAtendidas: turma.seriesAtendidas || ['3'], // PRINCIPAL - array de séries
              beneficios: turma.beneficios || [],
              ativa: turma.ativa !== false, // default true
              // NOVOS CAMPOS OBRIGATÓRIOS
              precoMensal: turma.precoMensal || 0,
              duracaoMeses: turma.duracaoMeses || 12
            });
            
            if (!resultado) {
              console.error('Falha ao atualizar turma:', turma.nome);
              sucesso = false;
            } else {
              console.log('✅ Turma atualizada:', turma.nome);
            }
          } else {
            // Turma nova - CRIAR
            console.log('Criando nova turma:', turma.nome);
            const novaTurma = await turmasService.criarTurma({
              nome: turma.nome,
              foco: turma.foco,
              // Usar primeira série atendida como série padrão para compatibilidade
              serie: turma.seriesAtendidas?.[0] || '3',
              turnos: turma.turnos || ['matutino'], // NOVO - array de turnos
              seriesAtendidas: turma.seriesAtendidas || ['3'], // PRINCIPAL - array de séries
              beneficios: turma.beneficios || [],
              ativa: turma.ativa !== false,
              // NOVOS CAMPOS OBRIGATÓRIOS
              precoMensal: turma.precoMensal || 0,
              duracaoMeses: turma.duracaoMeses || 12
            });
            
            if (!novaTurma) {
              console.error('Falha ao criar turma:', turma.nome);
              sucesso = false;
            } else {
              console.log('✅ Turma criada:', turma.nome, 'Novo ID:', novaTurma.id);
              // Atualizar o ID local com o ID do banco
              turma.id = novaTurma.id;
            }
          }
        } catch (error) {
          console.error('Erro ao processar turma:', turma.nome, error);
          sucesso = false;
        }
      }
      
      // Recarregar todas as turmas do banco
      console.log('Recarregando turmas do banco...');
      const turmasAtualizadas = await turmasService.listarTurmas(false);
      setTurmas(turmasAtualizadas);
      
      if (sucesso) {
        alert(`✅ ${turmas.length} turmas salvas com sucesso!`);
        console.log('✅ Todas as turmas foram salvas com sucesso!');
      } else {
        alert('⚠️ Algumas turmas não foram salvas corretamente. Verifique o console.');
        console.warn('⚠️ Algumas turmas falharam ao salvar');
      }
    } catch (error) {
      console.error('Erro geral ao salvar turmas:', error);
      alert('❌ Erro ao salvar as turmas.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.foco.trim()) {
      alert('Nome da turma e foco são obrigatórios');
      return;
    }

    if (!formData.turnos || formData.turnos.length === 0) {
      alert('Selecione pelo menos um turno');
      return;
    }

    if (!formData.seriesAtendidas || formData.seriesAtendidas.length === 0) {
      alert('Selecione pelo menos uma série/público');
      return;
    }

    const novaTurma: TurmaSimples = {
      ...formData,
      id: editingTurma?.id || Date.now().toString()
    };

    await salvarTurma(novaTurma);
    handleCloseModal();
  };

  const handleEdit = (turma: TurmaSimples) => {
    setEditingTurma(turma);
    setFormData({
      nome: turma.nome,
      foco: turma.foco,
      serie: turma.seriesAtendidas?.[0] || turma.serie || '3', // compatibilidade
      turnos: turma.turnos || ['matutino'], // NOVO - array de turnos
      seriesAtendidas: turma.seriesAtendidas || [turma.serie] || ['3'], // PRINCIPAL - array de séries
      beneficios: [...turma.beneficios],
      ativa: turma.ativa ?? true,
      // NOVOS CAMPOS DE VALOR E DURAÇÃO
      precoMensal: turma.precoMensal || 0,
      duracaoMeses: turma.duracaoMeses || 12
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta turma?')) return;
    
    try {
      const sucesso = await turmasService.excluirTurma(id);
      if (sucesso) {
        const turmasAtualizadas = await turmasService.listarTurmas(false);
        setTurmas(turmasAtualizadas);
      } else {
        throw new Error('Falha ao excluir turma');
      }
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      alert('Erro ao excluir turma. Tente novamente.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTurma(null);
    setFormData({
      nome: '',
      foco: '',
      serie: '3',
      turnos: ['matutino'], // NOVO - array de turnos
      seriesAtendidas: ['3'], // NOVO - array de séries
      beneficios: [],
      ativa: true,
      // NOVOS CAMPOS DE VALOR E DURAÇÃO
      precoMensal: 0,
      duracaoMeses: 12
    });
    setNewBeneficio('');
  };

  const toggleAtiva = async (id: string) => {
    const turma = turmas.find(t => t.id === id);
    if (!turma) return;
    
    const turmaAtualizada = { ...turma, ativa: !turma.ativa };
    await salvarTurma(turmaAtualizada);
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

  // Drag and Drop functions
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newBeneficios = [...formData.beneficios];
    const draggedItem = newBeneficios[draggedIndex];
    
    // Remove item from original position
    newBeneficios.splice(draggedIndex, 1);
    
    // Insert item at new position
    newBeneficios.splice(dropIndex, 0, draggedItem);
    
    setFormData({ ...formData, beneficios: newBeneficios });
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
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
        <div className="flex gap-3">
          <button
            onClick={salvarTodasTurmas}
            disabled={isSaving || turmas.length === 0}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
              isSaving || turmas.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </>
            ) : (
              <>
                💾 Salvar Todas ({turmas.length})
              </>
            )}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Turma
          </button>
        </div>
      </div>

      {/* Lista de Turmas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">Carregando turmas...</span>
          </div>
        ) : (
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
                  Séries Atendidas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turnos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Benefícios
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor Mensal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
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
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {turma.seriesAtendidas?.map(serie => (
                      <span key={serie} className={`px-2 py-1 text-xs font-medium rounded-full ${getSerieColor(serie)}`}>
                        {getSerieLabel(serie)}
                      </span>
                    ))}
                    {(!turma.seriesAtendidas || turma.seriesAtendidas.length === 0) && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSerieColor(turma.serie)}`}>
                        {getSerieLabel(turma.serie)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {turma.turnos?.map(turno => (
                      <span key={turno} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {turno === 'matutino' && <Sun className="w-3 h-3 text-yellow-500" />}
                        {turno === 'vespertino' && <Cloud className="w-3 h-3 text-orange-500" />}
                        {turno === 'noturno' && <Moon className="w-3 h-3 text-blue-500" />}
                        <span className="capitalize">{turno}</span>
                      </span>
                    ))}
                    {(!turma.turnos || turma.turnos.length === 0) && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                        <Sun className="w-3 h-3 text-yellow-500" />
                        <span className="capitalize">matutino</span>
                      </span>
                    )}
                  </div>
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
                  <div className="text-sm font-medium text-gray-900">
                    R$ {(turma.precoMensal || 0).toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-700">
                    {turma.duracaoMeses || 12} meses
                  </div>
                  <div className="text-xs text-gray-500">
                    Total: R$ {((turma.precoMensal || 0) * (turma.duracaoMeses || 12)).toFixed(2)}
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
        )}

        {!isLoading && turmas.length === 0 && (
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="Ex: PREPARAÇÃO COMPLETA PARA O PSC"
                />
              </div>

              {/* CAMPO REMOVIDO - USAMOS APENAS "SÉRIES/PÚBLICOS ATENDIDOS" AGORA */}

              {/* Seleção Múltipla de Turnos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Turnos Disponíveis *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'matutino' as Turno, label: 'Matutino', icon: Sun, color: 'text-yellow-500' },
                    { value: 'vespertino' as Turno, label: 'Vespertino', icon: Cloud, color: 'text-orange-500' },
                    { value: 'noturno' as Turno, label: 'Noturno', icon: Moon, color: 'text-blue-500' }
                  ].map((turno) => {
                    const selecionado = formData.turnos?.includes(turno.value) || false
                    const Icon = turno.icon
                    
                    return (
                      <button
                        key={turno.value}
                        type="button"
                        onClick={() => {
                          const turnosAtuais = formData.turnos || []
                          const novosTurnos = selecionado
                            ? turnosAtuais.filter(t => t !== turno.value)
                            : [...turnosAtuais, turno.value]
                          
                          setFormData({ ...formData, turnos: novosTurnos })
                        }}
                        className={`
                          flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all
                          ${selecionado 
                            ? 'bg-green-50 border-green-500 text-green-700' 
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <Icon className={`w-4 h-4 ${selecionado ? 'text-green-600' : turno.color}`} />
                        <span className="text-sm font-medium">{turno.label}</span>
                        {selecionado && <Check className="w-3 h-3 text-green-600" />}
                      </button>
                    )
                  })}
                </div>
                {(!formData.turnos || formData.turnos.length === 0) && (
                  <p className="text-sm text-red-500 mt-1">Selecione pelo menos um turno</p>
                )}
              </div>

              {/* Seleção Múltipla de Séries/Públicos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Séries/Públicos Atendidos *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: '1' as Serie, label: '1ª Série' },
                    { value: '2' as Serie, label: '2ª Série' },
                    { value: '3' as Serie, label: '3ª Série' },
                    { value: 'formado' as Serie, label: 'Já Formado' }
                  ].map((serie) => {
                    const selecionado = formData.seriesAtendidas?.includes(serie.value) || false
                    
                    return (
                      <button
                        key={serie.value}
                        type="button"
                        onClick={() => {
                          const seriesAtuais = formData.seriesAtendidas || []
                          const novasSeries = selecionado
                            ? seriesAtuais.filter(s => s !== serie.value)
                            : [...seriesAtuais, serie.value]
                          
                          setFormData({ ...formData, seriesAtendidas: novasSeries })
                        }}
                        className={`
                          flex items-center justify-between p-3 rounded-lg border-2 transition-all
                          ${selecionado 
                            ? 'bg-blue-50 border-blue-500 text-blue-700' 
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                          }
                        `}
                      >
                        <span className="text-sm font-medium">{serie.label}</span>
                        {selecionado && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    )
                  })}
                </div>
                {(!formData.seriesAtendidas || formData.seriesAtendidas.length === 0) && (
                  <p className="text-sm text-red-500 mt-1">Selecione pelo menos uma série/público</p>
                )}
              </div>

              {/* Valor Mensal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Mensal (R$) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precoMensal || 0}
                    onChange={(e) => setFormData({ ...formData, precoMensal: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Duração em Meses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (meses) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={formData.duracaoMeses || 12}
                  onChange={(e) => setFormData({ ...formData, duracaoMeses: parseInt(e.target.value) || 12 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="12"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💰 Valor total do curso: <span className="font-semibold text-green-600">
                    R$ {((formData.precoMensal || 0) * (formData.duracaoMeses || 12)).toFixed(2)}
                  </span>
                </p>
              </div>

              {/* Benefícios da Turma */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefícios da Turma
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  ℹ️ Arraste os benefícios com o ícone ⋮⋮ para reordenar
                </p>
                
                {/* Adicionar novo benefício */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newBeneficio}
                    onChange={(e) => setNewBeneficio(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBeneficio())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder-gray-400"
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
                    <div 
                      key={index} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`p-4 border rounded-lg transition-all cursor-move ${
                        beneficio.destaquePlatinado 
                          ? 'beneficio-platinado-form border-purple-200 shadow-sm' 
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      } ${
                        draggedIndex === index ? 'opacity-50 scale-95' : ''
                      } hover:shadow-md`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" />
                            <span className={beneficio.destaquePlatinado ? 'text-purple-600 text-lg' : 'text-green-600 text-lg'}>
                              {beneficio.destaquePlatinado ? '✦' : '✓'}
                            </span>
                          </div>
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
                  
                  {formData.beneficios.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm">Nenhum benefício adicionado ainda</p>
                      <p className="text-xs mt-1">Use o campo acima para adicionar benefícios</p>
                    </div>
                  )}
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
                  disabled={isSaving}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Salvando...' : (editingTurma ? 'Atualizar' : 'Criar')}
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
'use client';

import React, { useState, useEffect } from 'react';
import { User, Edit, Trash, Plus, Search, Phone, BookOpen } from 'lucide-react';
import { formatWhatsAppMask, validateWhatsApp, cleanPhoneNumber } from '@/lib/utils/phone';
import { professoresService } from '@/services/professoresService';

interface Professor {
  id: string;
  numero: string;
  nome: string;
  cpf: string;
  whatsapp?: string;
  materias?: string[];
  email?: string;
  reconhecimento: string;
  valor_por_minuto?: number;
  status: 'ativo' | 'inativo';
}

const MATERIAS_DISPONIVEIS = [
  'Matemática',
  'Física', 
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Português',
  'Gramática',
  'Literatura',
  'Linguagens',
  'Redação',
  'Inglês',
  'Filosofia',
  'Sociologia'
];

interface ProfessoresTabProps {
  refetchTrigger: number;
}

export default function ProfessoresTab({ refetchTrigger }: ProfessoresTabProps) {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [formData, setFormData] = useState({
    numero: '',
    nome: '',
    cpf: '',
    whatsapp: '',
    reconhecimento: '',
    valor_por_minuto: 1.00,
    materias: [] as string[]
  });
  const [whatsappError, setWhatsappError] = useState('');

  // Carregar professores
  const carregarProfessores = async () => {
    setLoading(true);
    try {
      const professoresDB = await professoresService.listarProfessores();
      setProfessores(professoresDB);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
      alert('Erro ao carregar professores. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProfessores();
  }, [refetchTrigger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.whatsapp) {
      const validation = validateWhatsApp(formData.whatsapp);
      if (!validation.isValid) {
        setWhatsappError(validation.error || 'WhatsApp inválido');
        return;
      }
      
      const whatsappRegex = /^\\(\\d{2}\\) 9\\d{4}-\\d{4}$/;
      if (!whatsappRegex.test(formData.whatsapp)) {
        setWhatsappError('WhatsApp deve estar no formato (XX) 9XXXX-XXXX');
        return;
      }
    }
    
    setIsSaving(true);
    try {
      const professorData = {
        numero: formData.numero,
        nome: formData.nome,
        cpf: formData.cpf,
        whatsapp: formData.whatsapp || undefined,
        materias: formData.materias.length > 0 ? formData.materias : undefined,
        reconhecimento: formData.reconhecimento,
        valor_por_minuto: formData.valor_por_minuto || 1.00,
        status: 'ativo' as const
      };

      if (editingProfessor) {
        await professoresService.atualizarProfessor(editingProfessor.id!, professorData);
      } else {
        const professoresExistentes = await professoresService.listarProfessores();
        if (professoresExistentes.some(p => p.numero === formData.numero)) {
          alert('Já existe um professor com este número!');
          return;
        }
        await professoresService.criarProfessor(professorData);
      }
      
      carregarProfessores();
      setShowModal(false);
      setEditingProfessor(null);
      setFormData({ numero: '', nome: '', cpf: '', whatsapp: '', reconhecimento: '', valor_por_minuto: 1.00, materias: [] });
      setWhatsappError('');
      
      alert(editingProfessor ? 'Professor atualizado com sucesso!' : 'Professor adicionado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar professor:', error);
      alert('Erro ao salvar professor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor);
    setFormData({
      numero: professor.numero,
      nome: professor.nome,
      cpf: professor.cpf,
      whatsapp: professor.whatsapp || '',
      reconhecimento: professor.reconhecimento || '',
      valor_por_minuto: professor.valor_por_minuto || 1.00,
      materias: professor.materias || []
    });
    setWhatsappError('');
    setShowModal(true);
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsAppMask(e.target.value);
    setFormData({ ...formData, whatsapp: formatted });
    
    if (!formatted) {
      setWhatsappError('');
    } else {
      const numbers = cleanPhoneNumber(formatted);
      if (numbers.length === 11) {
        const validation = validateWhatsApp(formatted);
        setWhatsappError(validation.isValid ? '' : validation.error || '');
      } else {
        setWhatsappError('');
      }
    }
  };

  const handleMateriaToggle = (materia: string) => {
    const currentMaterias = formData.materias;
    if (currentMaterias.includes(materia)) {
      setFormData({
        ...formData,
        materias: currentMaterias.filter(m => m !== materia)
      });
    } else {
      setFormData({
        ...formData,
        materias: [...currentMaterias, materia]
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este professor?')) return;

    try {
      await professoresService.excluirProfessor(id);
      carregarProfessores();
      alert('Professor excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir professor:', error);
      alert('Erro ao excluir professor');
    }
  };

  const filteredProfessores = professores.filter(prof =>
    prof.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.cpf.includes(searchTerm) ||
    prof.numero.includes(searchTerm) ||
    (prof.whatsapp && prof.whatsapp.includes(searchTerm)) ||
    (prof.materias && prof.materias.some(m => m.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\\d{3})(\\d{3})(\\d{3})(\\d{2})/, '$1.$2.$3-$4');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Professores Cadastrados</h2>
          <p className="text-gray-600">Gerencie o cadastro de professores</p>
        </div>
        <button
          onClick={() => {
            setEditingProfessor(null);
            setFormData({ numero: '', nome: '', cpf: '', whatsapp: '', reconhecimento: '', valor_por_minuto: 1.00, materias: [] });
            setWhatsappError('');
            setShowModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Professor
        </button>
      </div>

      {/* Barra de busca */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, número, WhatsApp ou matéria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <User className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Professores</p>
              <p className="text-2xl font-bold text-gray-900">{professores.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPF
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                WhatsApp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reconhecimento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matérias
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProfessores.map((professor) => (
              <tr key={professor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{professor.numero}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {professor.nome}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCPF(professor.cpf)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {professor.whatsapp ? (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-600" />
                      {professor.whatsapp}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {professor.reconhecimento || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {professor.materias && professor.materias.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {professor.materias.slice(0, 3).map((materia, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          {materia}
                        </span>
                      ))}
                      {professor.materias.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{professor.materias.length - 3} mais
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(professor)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(professor.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProfessores.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum professor encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Tente ajustar sua busca.' : 'Comece criando um novo professor.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingProfessor ? 'Editar Professor' : 'Novo Professor'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.numero}
                      onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPF *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value.replace(/\\D/g, '') })}
                      maxLength={11}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Apenas números"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      value={formData.whatsapp}
                      onChange={handleWhatsAppChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        whatsappError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                      }`}
                      placeholder="(92) 99999-9999"
                    />
                    {whatsappError && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {whatsappError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reconhecimento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.reconhecimento}
                    onChange={(e) => setFormData({ ...formData, reconhecimento: e.target.value })}
                    placeholder="Ex: WALTER [MAT]"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Como aparece nas planilhas de horário
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Matérias que leciona
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {MATERIAS_DISPONIVEIS.map((materia) => (
                      <label
                        key={materia}
                        className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={formData.materias.includes(materia)}
                          onChange={() => handleMateriaToggle(materia)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">{materia}</span>
                      </label>
                    ))}
                  </div>
                  {formData.materias.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {formData.materias.map((materia, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          <BookOpen className="w-3 h-3 mr-1" />
                          {materia}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setWhatsappError('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!!whatsappError || isSaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Salvando...' : (editingProfessor ? 'Atualizar' : 'Criar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
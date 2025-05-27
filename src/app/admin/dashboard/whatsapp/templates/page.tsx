'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  FileText, 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  MessageSquare,
  Code
} from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';
import { supabase } from '@/lib/supabase-singleton';
import { Toast } from '@/components/Toast';

interface Template {
  id?: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  type: 'absence' | 'arrival' | 'reminder' | 'custom';
  is_active: boolean;
}

const DEFAULT_TEMPLATES = {
  absence: `Olá {nome_responsavel}, {nome_aluno} não compareceu hoje às aulas do Entropia Cursinho. Em caso de dúvidas, entre em contato conosco.`,
  arrival: `✅ {nome_aluno} chegou às {hora} - Entropia Cursinho`,
  reminder: `Olá {nome_responsavel}, identificamos uma pendência financeira referente ao aluno {nome_aluno}. Por favor, regularize sua situação para manter o acesso às aulas.`,
  custom: ``
};

const AVAILABLE_VARIABLES = [
  { key: '{nome_aluno}', description: 'Nome do aluno' },
  { key: '{nome_responsavel}', description: 'Nome do responsável' },
  { key: '{data}', description: 'Data atual' },
  { key: '{hora}', description: 'Hora atual' },
  { key: '{turma}', description: 'Turma do aluno' },
  { key: '{valor}', description: 'Valor (para lembretes)' },
  { key: '{vencimento}', description: 'Data de vencimento' }
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState<Template>({
    name: '',
    description: '',
    template: '',
    variables: [],
    type: 'custom',
    is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type: Template['type']) => {
    setFormData({
      ...formData,
      type,
      template: DEFAULT_TEMPLATES[type] || ''
    });
  };

  const extractVariables = (template: string): string[] => {
    const matches = template.match(/{[^}]+}/g) || [];
    return [...new Set(matches)];
  };

  const handleTemplateChange = (template: string) => {
    const variables = extractVariables(template);
    setFormData({
      ...formData,
      template,
      variables
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.template) {
      setToast({ message: 'Preencha todos os campos obrigatórios', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      if (editingTemplate?.id) {
        // Atualizar template existente
        const { error } = await supabase
          .from('whatsapp_templates')
          .update({
            name: formData.name,
            description: formData.description,
            template: formData.template,
            variables: formData.variables,
            type: formData.type,
            is_active: formData.is_active
          })
          .eq('id', editingTemplate.id);
        
        if (error) throw error;
        setToast({ message: 'Template atualizado com sucesso!', type: 'success' });
      } else {
        // Criar novo template
        const { error } = await supabase
          .from('whatsapp_templates')
          .insert({
            name: formData.name,
            description: formData.description,
            template: formData.template,
            variables: formData.variables,
            type: formData.type,
            is_active: formData.is_active
          });
        
        if (error) throw error;
        setToast({ message: 'Template criado com sucesso!', type: 'success' });
      }

      setShowForm(false);
      setEditingTemplate(null);
      setFormData({
        name: '',
        description: '',
        template: '',
        variables: [],
        type: 'custom',
        is_active: true
      });
      loadTemplates();
    } catch (error: any) {
      console.error('Erro ao salvar template:', error);
      setToast({ 
        message: error.message || 'Erro ao salvar template', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData(template);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      const { error } = await supabase
        .from('whatsapp_templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setToast({ message: 'Template excluído com sucesso!', type: 'success' });
      loadTemplates();
    } catch (error: any) {
      console.error('Erro ao excluir template:', error);
      setToast({ 
        message: error.message || 'Erro ao excluir template', 
        type: 'error' 
      });
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('whatsapp_templates')
        .update({ is_active: !is_active })
        .eq('id', id);
      
      if (error) throw error;
      loadTemplates();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'absence': return 'bg-red-100 text-red-800';
      case 'arrival': return 'bg-green-100 text-green-800';
      case 'reminder': return 'bg-yellow-100 text-yellow-800';
      case 'custom': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'absence': return 'Notificação de Falta';
      case 'arrival': return 'Confirmação de Chegada';
      case 'reminder': return 'Lembrete Financeiro';
      case 'custom': return 'Personalizado';
      default: return type;
    }
  };

  return (
    <AuthGuard>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard/whatsapp"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Templates de Mensagens</h1>
                <p className="text-gray-600 mt-1">Gerencie templates reutilizáveis para suas mensagens</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Template
            </button>
          </div>
        </div>

        {/* Formulário de Template */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingTemplate ? 'Editar Template' : 'Novo Template'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingTemplate(null);
                  setFormData({
                    name: '',
                    description: '',
                    template: '',
                    variables: [],
                    type: 'custom',
                    is_active: true
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Template *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Notificação de Falta Personalizada"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descrição do template"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleTypeChange(e.target.value as Template['type'])}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="custom">Personalizado</option>
                  <option value="absence">Notificação de Falta</option>
                  <option value="arrival">Confirmação de Chegada</option>
                  <option value="reminder">Lembrete Financeiro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem *
                </label>
                <textarea
                  value={formData.template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  rows={6}
                  placeholder="Digite o template da mensagem..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use variáveis entre chaves. Ex: {'{nome_aluno}'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Variáveis Detectadas
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.variables.length > 0 ? (
                    formData.variables.map(variable => (
                      <span key={variable} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                        {variable}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">Nenhuma variável detectada</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-green-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Template ativo
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingTemplate(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Salvar Template
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Variáveis Disponíveis */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-800">Variáveis Disponíveis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {AVAILABLE_VARIABLES.map(variable => (
              <div key={variable.key} className="flex items-center gap-2">
                <code className="px-2 py-1 bg-white text-blue-600 text-sm rounded">
                  {variable.key}
                </code>
                <span className="text-sm text-blue-700">{variable.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lista de Templates */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Templates Salvos</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando templates...</p>
            </div>
          ) : templates.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {templates.map((template) => (
                <div key={template.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(template.type)}`}>
                          {getTypeText(template.type)}
                        </span>
                        {!template.is_active && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            Inativo
                          </span>
                        )}
                      </div>
                      
                      {template.description && (
                        <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      )}
                      
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                          {template.template}
                        </pre>
                      </div>
                      
                      {template.variables && template.variables.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Variáveis:</span>
                          <div className="flex gap-1">
                            {template.variables.map(variable => (
                              <span key={variable} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {variable}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => toggleActive(template.id!, template.is_active)}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          template.is_active 
                            ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {template.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(template.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum template cadastrado</p>
              <p className="text-sm text-gray-400 mt-1">
                Crie seu primeiro template para começar
              </p>
            </div>
          )}
        </div>

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
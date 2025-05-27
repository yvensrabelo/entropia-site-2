'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Bot, 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  Clock,
  Calendar,
  Bell,
  AlertCircle
} from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';
import { supabase } from '@/lib/supabase-singleton';
import { Toast } from '@/components/Toast';

interface Automation {
  id?: string;
  name: string;
  description: string;
  type: 'absence_notification' | 'arrival_notification' | 'payment_reminder';
  template_id: string;
  is_active: boolean;
  schedule_time?: string;
  days_of_week?: number[];
}

interface Template {
  id: string;
  name: string;
  type: string;
}

const AUTOMATION_TYPES = [
  {
    value: 'absence_notification',
    label: 'Notificação de Ausência',
    description: 'Notifica responsáveis quando o aluno não comparece',
    icon: AlertCircle,
    color: 'text-red-600'
  },
  {
    value: 'arrival_notification',
    label: 'Notificação de Chegada',
    description: 'Confirma chegada do aluno ao cursinho',
    icon: Bell,
    color: 'text-green-600'
  },
  {
    value: 'payment_reminder',
    label: 'Lembrete de Pagamento',
    description: 'Envia lembretes de pagamentos pendentes',
    icon: Calendar,
    color: 'text-yellow-600'
  }
];

const WEEKDAYS = [
  { value: 0, label: 'Dom', short: 'D' },
  { value: 1, label: 'Seg', short: 'S' },
  { value: 2, label: 'Ter', short: 'T' },
  { value: 3, label: 'Qua', short: 'Q' },
  { value: 4, label: 'Qui', short: 'Q' },
  { value: 5, label: 'Sex', short: 'S' },
  { value: 6, label: 'Sáb', short: 'S' }
];

export default function AutomacoesPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);
  const [formData, setFormData] = useState<Automation>({
    name: '',
    description: '',
    type: 'absence_notification',
    template_id: '',
    is_active: false,
    schedule_time: '10:00',
    days_of_week: [1, 2, 3, 4, 5] // Segunda a Sexta
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadAutomations();
    loadTemplates();
  }, []);

  const loadAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_automations')
        .select(`
          *,
          template:template_id(
            id,
            name,
            type
          )
        `)
        .order('name');
      
      if (error) throw error;
      setAutomations(data || []);
    } catch (error) {
      console.error('Erro ao carregar automações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('id, name, type')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  };

  const getFilteredTemplates = () => {
    switch (formData.type) {
      case 'absence_notification':
        return templates.filter(t => t.type === 'absence');
      case 'arrival_notification':
        return templates.filter(t => t.type === 'arrival');
      case 'payment_reminder':
        return templates.filter(t => t.type === 'reminder');
      default:
        return templates;
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.template_id) {
      setToast({ message: 'Preencha todos os campos obrigatórios', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const dataToSave = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        template_id: formData.template_id,
        is_active: formData.is_active,
        schedule_time: formData.schedule_time,
        days_of_week: formData.days_of_week
      };

      if (editingAutomation?.id) {
        // Atualizar automação existente
        const { error } = await supabase
          .from('whatsapp_automations')
          .update(dataToSave)
          .eq('id', editingAutomation.id);
        
        if (error) throw error;
        setToast({ message: 'Automação atualizada com sucesso!', type: 'success' });
      } else {
        // Criar nova automação
        const { error } = await supabase
          .from('whatsapp_automations')
          .insert(dataToSave);
        
        if (error) throw error;
        setToast({ message: 'Automação criada com sucesso!', type: 'success' });
      }

      setShowForm(false);
      setEditingAutomation(null);
      setFormData({
        name: '',
        description: '',
        type: 'absence_notification',
        template_id: '',
        is_active: false,
        schedule_time: '10:00',
        days_of_week: [1, 2, 3, 4, 5]
      });
      loadAutomations();
    } catch (error: any) {
      console.error('Erro ao salvar automação:', error);
      setToast({ 
        message: error.message || 'Erro ao salvar automação', 
        type: 'error' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (automation: Automation) => {
    setEditingAutomation(automation);
    setFormData(automation);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta automação?')) return;

    try {
      const { error } = await supabase
        .from('whatsapp_automations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setToast({ message: 'Automação excluída com sucesso!', type: 'success' });
      loadAutomations();
    } catch (error: any) {
      console.error('Erro ao excluir automação:', error);
      setToast({ 
        message: error.message || 'Erro ao excluir automação', 
        type: 'error' 
      });
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('whatsapp_automations')
        .update({ is_active: !is_active })
        .eq('id', id);
      
      if (error) throw error;
      
      setToast({ 
        message: is_active ? 'Automação desativada' : 'Automação ativada', 
        type: 'success' 
      });
      loadAutomations();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      setToast({ message: 'Erro ao atualizar status', type: 'error' });
    }
  };

  const toggleWeekday = (day: number) => {
    const days = formData.days_of_week || [];
    if (days.includes(day)) {
      setFormData({
        ...formData,
        days_of_week: days.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        days_of_week: [...days, day].sort()
      });
    }
  };

  const getAutomationType = (type: string) => {
    return AUTOMATION_TYPES.find(t => t.value === type);
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
              <Bot className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Automações</h1>
                <p className="text-gray-600 mt-1">Configure notificações automáticas via WhatsApp</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Automação
            </button>
          </div>
        </div>

        {/* Formulário de Automação */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingAutomation ? 'Editar Automação' : 'Nova Automação'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAutomation(null);
                  setFormData({
                    name: '',
                    description: '',
                    type: 'absence_notification',
                    template_id: '',
                    is_active: false,
                    schedule_time: '10:00',
                    days_of_week: [1, 2, 3, 4, 5]
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
                  Nome da Automação *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Notificar faltas às 10h"
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
                  placeholder="Descrição da automação"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Automação
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {AUTOMATION_TYPES.map(type => {
                    const Icon = type.icon;
                    return (
                      <label
                        key={type.value}
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.type === type.value 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={formData.type === type.value}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as Automation['type'] })}
                          className="text-green-500"
                        />
                        <Icon className={`w-5 h-5 ${type.color}`} />
                        <div>
                          <p className="font-medium text-gray-900">{type.label}</p>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template *
                </label>
                <select
                  value={formData.template_id}
                  onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Selecione um template...</option>
                  {getFilteredTemplates().map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                {getFilteredTemplates().length === 0 && (
                  <p className="text-sm text-yellow-600 mt-1">
                    Nenhum template compatível encontrado. Crie um template primeiro.
                  </p>
                )}
              </div>

              {formData.type !== 'arrival_notification' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horário de Envio
                    </label>
                    <input
                      type="time"
                      value={formData.schedule_time || '10:00'}
                      onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dias da Semana
                    </label>
                    <div className="flex gap-2">
                      {WEEKDAYS.map(day => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => toggleWeekday(day.value)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            formData.days_of_week?.includes(day.value)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {day.short}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Selecione os dias em que a automação deve ser executada
                    </p>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-green-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Ativar automação imediatamente
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingAutomation(null);
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
                    Salvar Automação
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Lista de Automações */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Automações Configuradas</h3>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Carregando automações...</p>
            </div>
          ) : automations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {automations.map((automation) => {
                const type = getAutomationType(automation.type);
                const Icon = type?.icon || Bot;
                
                return (
                  <div key={automation.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className={`w-5 h-5 ${type?.color || 'text-gray-600'}`} />
                          <h4 className="font-medium text-gray-900">{automation.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            automation.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {automation.is_active ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                        
                        {automation.description && (
                          <p className="text-sm text-gray-600 mb-2">{automation.description}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{type?.label}</span>
                          
                          {automation.schedule_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {automation.schedule_time}
                            </div>
                          )}
                          
                          {automation.days_of_week && automation.days_of_week.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {automation.days_of_week.map(day => 
                                WEEKDAYS.find(w => w.value === day)?.short
                              ).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toggleActive(automation.id!, automation.is_active)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={automation.is_active ? 'Desativar' : 'Ativar'}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 ${
                            automation.is_active 
                              ? 'bg-green-600 border-green-600' 
                              : 'bg-white border-gray-400'
                          }`}>
                            {automation.is_active && (
                              <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                        <button
                          onClick={() => handleEdit(automation)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(automation.id!)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma automação configurada</p>
              <p className="text-sm text-gray-400 mt-1">
                Crie sua primeira automação para começar
              </p>
            </div>
          )}
        </div>

        {/* Aviso sobre horários */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-800 font-medium">Importante sobre horários</p>
              <p className="text-yellow-700 text-sm mt-1">
                As automações respeitam o horário permitido de envio (8h às 20h). 
                Mensagens fora desse horário serão agendadas para o próximo período permitido.
              </p>
            </div>
          </div>
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
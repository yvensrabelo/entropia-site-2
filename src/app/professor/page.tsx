'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Lock, 
  ArrowRight, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Menu,
  LogOut,
  DollarSign,
  FileText
} from 'lucide-react';

interface Professor {
  id: number;
  nome: string;
  cpf: string;
  materia: string;
  cor_materia: string;
}

interface Aula {
  horario_id: string;
  tempo: number;
  hora_inicio: string;
  hora_fim: string;
  turma_nome: string;
  materia_nome: string;
  descritor_preenchido: boolean;
  descritor?: any;
  pode_preencher: boolean;
}

export default function ProfessorPage() {
  const router = useRouter();
  const [step, setStep] = useState<'login' | 'dashboard' | 'descritor'>('login');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [selectedAula, setSelectedAula] = useState<Aula | null>(null);
  const [topicos, setTopicos] = useState<any[]>([]);
  const [descritor, setDescritor] = useState({
    topico_id: '',
    descricao_livre: ''
  });

  // ====================================================================
  // LOGIN
  // ====================================================================
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return value;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cpfLimpo = cpf.replace(/\D/g, '');
      
      if (cpfLimpo.length !== 11) {
        setError('CPF deve ter 11 dígitos');
        return;
      }

      const response = await fetch('/api/professor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpfLimpo, action: 'login' })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro no login');
        return;
      }

      setProfessor(data.professor);
      setStep('dashboard');
      localStorage.setItem('professor_cpf', cpfLimpo);

    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  // ====================================================================
  // CARREGAR DADOS DO DASHBOARD
  // ====================================================================
  const carregarAulasDoDia = async (data: string) => {
    if (!professor) return;

    try {
      const response = await fetch(
        `/api/professor?cpf=${professor.cpf}&endpoint=descritores&data=${data}`
      );
      const resultado = await response.json();

      if (response.ok) {
        setAulas(resultado.aulas || []);
      }
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
    }
  };

  useEffect(() => {
    if (step === 'dashboard' && professor) {
      carregarAulasDoDia(selectedDate);
    }
  }, [step, professor, selectedDate]);

  // ====================================================================
  // PREENCHER DESCRITOR
  // ====================================================================
  const abrirDescritor = async (aula: Aula) => {
    if (!aula.pode_preencher) {
      setError('Este descritor só pode ser preenchido após o horário da aula');
      return;
    }

    setSelectedAula(aula);
    setDescritor({
      topico_id: aula.descritor?.topico_id || '',
      descricao_livre: aula.descritor?.descricao_livre || ''
    });

    // Carregar tópicos da matéria
    try {
      const response = await fetch('/api/professor', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'buscar_topicos', 
          materia_id: aula.materia_id 
        })
      });

      const data = await response.json();
      if (response.ok) {
        setTopicos(data.topicos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar tópicos:', error);
    }

    setStep('descritor');
  };

  const salvarDescritor = async () => {
    if (!selectedAula || !professor) return;

    if (descritor.descricao_livre.length < 10) {
      setError('Descrição deve ter pelo menos 10 caracteres');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/descritores-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horario_id: selectedAula.horario_id,
          professor_cpf: professor.cpf,
          data: selectedDate,
          topico_id: descritor.topico_id || null,
          descricao_livre: descritor.descricao_livre
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erro ao salvar descritor');
        return;
      }

      // Voltar ao dashboard e recarregar
      setStep('dashboard');
      setSelectedAula(null);
      await carregarAulasDoDia(selectedDate);

    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setProfessor(null);
    setCpf('');
    setStep('login');
    localStorage.removeItem('professor_cpf');
  };

  // ====================================================================
  // VERIFICAR LOGIN AUTOMÁTICO
  // ====================================================================
  useEffect(() => {
    const cpfSalvo = localStorage.getItem('professor_cpf');
    if (cpfSalvo && step === 'login') {
      setCpf(cpfSalvo);
      // Auto-login pode ser implementado aqui se desejado
    }
  }, [step]);

  // ====================================================================
  // RENDER LOGIN
  // ====================================================================
  if (step === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Portal do Professor
            </h1>
            <p className="text-gray-600">
              Acesse com seu CPF para gerenciar descritores
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CPF
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  maxLength={14}
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ====================================================================
  // RENDER DESCRITOR
  // ====================================================================
  if (step === 'descritor' && selectedAula) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-md mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep('dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Voltar
              </button>
              <h1 className="font-semibold text-gray-900">Descritor</h1>
              <div></div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto p-4 space-y-6">
          {/* Informações da Aula */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">
              {selectedAula.tempo}º Tempo - {selectedAula.materia_nome}
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>{selectedAula.turma_nome}</p>
              <p>{selectedAula.hora_inicio} - {selectedAula.hora_fim}</p>
              <p>{new Date(selectedDate).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* Formulário */}
          <div className="space-y-4">
            {/* Tópico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tópico da Aula
              </label>
              <select
                value={descritor.topico_id}
                onChange={(e) => setDescritor({ ...descritor, topico_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione um tópico</option>
                {topicos.map(topico => (
                  <option key={topico.id} value={topico.id}>
                    {topico.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição da Aula *
              </label>
              <textarea
                value={descritor.descricao_livre}
                onChange={(e) => setDescritor({ ...descritor, descricao_livre: e.target.value })}
                placeholder="Descreva o conteúdo ministrado, atividades realizadas, observações..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={6}
                minLength={10}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Mínimo 10 caracteres ({descritor.descricao_livre.length}/10)
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            )}

            <button
              onClick={salvarDescritor}
              disabled={loading || descritor.descricao_livre.length < 10}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Salvar Descritor
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ====================================================================
  // RENDER DASHBOARD
  // ====================================================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-gray-900">
                Olá, {professor?.nome.split(' ')[0]}
              </h1>
              <p className="text-sm text-gray-600">{professor?.materia}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Seletor de Data */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Lista de Aulas */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">
            Aulas do Dia ({aulas.length})
          </h2>

          {aulas.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma aula encontrada para esta data</p>
            </div>
          ) : (
            aulas.map((aula, index) => (
              <motion.div
                key={aula.horario_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 shadow-sm border-l-4"
                style={{ borderLeftColor: professor?.cor_materia }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-medium">
                        {aula.tempo}º Tempo
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        {aula.hora_inicio} - {aula.hora_fim}
                      </span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {aula.materia_nome}
                    </h3>
                    <p className="text-sm text-gray-600">{aula.turma_nome}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {aula.descritor_preenchido ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    ) : aula.pode_preencher ? (
                      <button
                        onClick={() => abrirDescritor(aula)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Preencher
                      </button>
                    ) : (
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </div>

                {aula.descritor_preenchido && aula.descritor && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-700">
                      <strong>Tópico:</strong> {aula.descritor.topico_nome || 'Não informado'}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Descrição:</strong> {aula.descritor.descricao_livre}
                    </p>
                    {!aula.descritor.editavel && (
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Lock className="w-3 h-3 mr-1" />
                        Não pode mais ser editado
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
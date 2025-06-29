'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  User, 
  Check, 
  X, 
  AlertTriangle, 
  Settings, 
  RefreshCw,
  Monitor,
  UserCheck,
  UserX,
  Timer,
  Calendar,
  Sunrise,
  Sun,
  Moon
} from 'lucide-react';

interface ProfessorStatus {
  professor_id: number;
  professor_nome: string;
  professor_cpf: string;
  turma_codigo: string;
  turma_nome: string;
  materia_nome: string;
  tempo: number;
  hora_inicio: string;
  hora_fim: string;
  status_presenca: 'ausente' | 'presente' | 'atrasado';
  hora_chegada?: string;
  minutos_atraso: number;
  observacoes?: string;
  horario_id: string;
}

interface StatusPortaria {
  data: string;
  turnos: Record<string, ProfessorStatus[]>;
  total: number;
  ultima_atualizacao: string;
}

export default function PortariaPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusPortaria, setStatusPortaria] = useState<StatusPortaria | null>(null);
  const [turnoSelecionado, setTurnoSelecionado] = useState<string>('manha');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5); // segundos
  const [modalConfig, setModalConfig] = useState(false);

  // ====================================================================
  // AUTENTICAÇÃO
  // ====================================================================
  const verificarSenha = async (senhaInput: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/portaria', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verificar_senha',
          senha: senhaInput
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAuthenticated(true);
        localStorage.setItem('portaria_auth', 'true');
        carregarStatus();
      } else {
        setError('Senha incorreta');
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.trim()) {
      verificarSenha(senha.trim());
    }
  };

  // ====================================================================
  // CARREGAR STATUS
  // ====================================================================
  const carregarStatus = async (turno?: string) => {
    try {
      const params = new URLSearchParams({
        data: new Date().toISOString().split('T')[0]
      });
      
      if (turno) {
        params.append('turno', turno);
      }

      const response = await fetch(`/api/portaria?${params}`);
      const data = await response.json();

      if (response.ok) {
        setStatusPortaria(data);
        
        // Se não há turno selecionado, selecionar o primeiro disponível
        if (!turnoSelecionado && data.turnos) {
          const turnosDisponiveis = Object.keys(data.turnos);
          if (turnosDisponiveis.length > 0) {
            setTurnoSelecionado(turnosDisponiveis[0]);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar status:', error);
    }
  };

  // ====================================================================
  // REGISTRAR PRESENÇA
  // ====================================================================
  const registrarPresenca = async (
    professor: ProfessorStatus, 
    novoStatus: 'presente' | 'atrasado' | 'ausente',
    minutosAtraso: number = 0
  ) => {
    try {
      const response = await fetch('/api/portaria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professor_id: professor.professor_id,
          horario_id: professor.horario_id,
          status_presenca: novoStatus,
          data: statusPortaria?.data,
          minutos_atraso: minutosAtraso,
          registrado_por: 'portaria'
        })
      });

      if (response.ok) {
        // Recarregar status
        carregarStatus();
      }
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
    }
  };

  // ====================================================================
  // AUTO REFRESH
  // ====================================================================
  useEffect(() => {
    if (!authenticated || !autoRefresh) return;

    const interval = setInterval(() => {
      carregarStatus();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [authenticated, autoRefresh, refreshInterval]);

  // ====================================================================
  // VERIFICAR AUTENTICAÇÃO SALVA
  // ====================================================================
  useEffect(() => {
    const authSalva = localStorage.getItem('portaria_auth');
    if (authSalva === 'true') {
      setAuthenticated(true);
      carregarStatus();
    }
  }, []);

  // ====================================================================
  // FUNÇÕES AUXILIARES
  // ====================================================================
  const getTurnoIcon = (turno: string) => {
    switch (turno) {
      case 'manha': return <Sunrise className="w-5 h-5" />;
      case 'tarde': return <Sun className="w-5 h-5" />;
      case 'noite': return <Moon className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getTurnoLabel = (turno: string) => {
    switch (turno) {
      case 'manha': return 'Manhã';
      case 'tarde': return 'Tarde';
      case 'noite': return 'Noite';
      default: return turno;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'presente': return 'bg-green-500';
      case 'atrasado': return 'bg-yellow-500';
      case 'ausente': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'presente': return <UserCheck className="w-6 h-6" />;
      case 'atrasado': return <Timer className="w-6 h-6" />;
      case 'ausente': return <UserX className="w-6 h-6" />;
      default: return <User className="w-6 h-6" />;
    }
  };

  // ====================================================================
  // RENDER LOGIN
  // ====================================================================
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Monitor className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Módulo da Portaria
            </h1>
            <p className="text-gray-600">
              Acesso restrito - Digite a senha
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha de Acesso
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                autoFocus
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-red-700">{error}</span>
                </div>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Acessar Módulo'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ====================================================================
  // RENDER PORTARIA
  // ====================================================================
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Monitor className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold">Módulo da Portaria</h1>
                <p className="text-gray-400">
                  {statusPortaria?.data ? new Date(statusPortaria.data).toLocaleDateString('pt-BR') : ''} | 
                  Última atualização: {statusPortaria?.ultima_atualizacao ? 
                    new Date(statusPortaria.ultima_atualizacao).toLocaleTimeString('pt-BR') : 'Carregando...'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Indicador de auto-refresh */}
              <div className="flex items-center space-x-2">
                <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin text-green-400' : 'text-gray-400'}`} />
                <span className="text-sm text-gray-400">
                  Auto: {autoRefresh ? `${refreshInterval}s` : 'OFF'}
                </span>
              </div>

              {/* Botão de configurações */}
              <button
                onClick={() => setModalConfig(true)}
                className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Botão de logout */}
              <button
                onClick={() => {
                  setAuthenticated(false);
                  localStorage.removeItem('portaria_auth');
                }}
                className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seletor de Turno */}
      {statusPortaria && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-center space-x-4 mb-8">
            {Object.keys(statusPortaria.turnos).map(turno => (
              <button
                key={turno}
                onClick={() => setTurnoSelecionado(turno)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                  turnoSelecionado === turno
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {getTurnoIcon(turno)}
                <span>{getTurnoLabel(turno)}</span>
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-sm">
                  {statusPortaria.turnos[turno].length}
                </span>
              </button>
            ))}
          </div>

          {/* Grid de Professores */}
          {statusPortaria.turnos[turnoSelecionado] && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {statusPortaria.turnos[turnoSelecionado].map((professor, index) => (
                <motion.div
                  key={`${professor.professor_id}-${professor.horario_id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 rounded-lg p-6 border border-gray-700"
                >
                  {/* Header do Card */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(professor.status_presenca)}`}></div>
                      <span className="text-sm font-medium text-gray-400">
                        {professor.tempo}º Tempo
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {professor.hora_inicio} - {professor.hora_fim}
                    </span>
                  </div>

                  {/* Informações do Professor */}
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-white mb-1">
                      {professor.professor_nome}
                    </h3>
                    <p className="text-blue-400 font-medium mb-1">
                      {professor.materia_nome}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {professor.turma_codigo} - {professor.turma_nome}
                    </p>
                  </div>

                  {/* Status Atual */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`p-2 rounded-lg ${getStatusColor(professor.status_presenca)}`}>
                        {getStatusIcon(professor.status_presenca)}
                      </div>
                      <div>
                        <p className="font-semibold text-white capitalize">
                          {professor.status_presenca}
                        </p>
                        {professor.status_presenca === 'atrasado' && professor.minutos_atraso > 0 && (
                          <p className="text-yellow-400 text-sm">
                            {professor.minutos_atraso} min de atraso
                          </p>
                        )}
                        {professor.hora_chegada && (
                          <p className="text-gray-400 text-sm">
                            Chegou às {professor.hora_chegada}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => registrarPresenca(professor, 'presente')}
                      className={`p-2 rounded-lg transition-colors ${
                        professor.status_presenca === 'presente'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white'
                      }`}
                      title="Presente"
                    >
                      <Check className="w-5 h-5 mx-auto" />
                    </button>

                    <button
                      onClick={() => {
                        const minutos = prompt('Quantos minutos de atraso?', '5');
                        if (minutos && !isNaN(Number(minutos))) {
                          registrarPresenca(professor, 'atrasado', Number(minutos));
                        }
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        professor.status_presenca === 'atrasado'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-yellow-600 hover:text-white'
                      }`}
                      title="Atrasado"
                    >
                      <Timer className="w-5 h-5 mx-auto" />
                    </button>

                    <button
                      onClick={() => registrarPresenca(professor, 'ausente')}
                      className={`p-2 rounded-lg transition-colors ${
                        professor.status_presenca === 'ausente'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white'
                      }`}
                      title="Ausente"
                    >
                      <X className="w-5 h-5 mx-auto" />
                    </button>
                  </div>

                  {/* Observações */}
                  {professor.observacoes && (
                    <div className="mt-3 p-2 bg-gray-700 rounded text-sm text-gray-300">
                      {professor.observacoes}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Estatísticas do Turno */}
          {statusPortaria.turnos[turnoSelecionado] && (
            <div className="mt-8 bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Estatísticas - {getTurnoLabel(turnoSelecionado)}
              </h3>
              <div className="grid grid-cols-4 gap-4 text-center">
                {['presente', 'atrasado', 'ausente'].map(status => {
                  const count = statusPortaria.turnos[turnoSelecionado].filter(
                    p => p.status_presenca === status
                  ).length;
                  return (
                    <div key={status} className="bg-gray-700 rounded-lg p-4">
                      <div className={`w-8 h-8 rounded-full ${getStatusColor(status)} mx-auto mb-2`}></div>
                      <p className="text-2xl font-bold text-white">{count}</p>
                      <p className="text-gray-400 capitalize">{status}</p>
                    </div>
                  );
                })}
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 mx-auto mb-2"></div>
                  <p className="text-2xl font-bold text-white">
                    {statusPortaria.turnos[turnoSelecionado].length}
                  </p>
                  <p className="text-gray-400">Total</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Configurações */}
      {modalConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Configurações da Portaria
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Auto-refresh
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300">Ativado</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Intervalo (segundos)
                </label>
                <input
                  type="number"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  min="1"
                  max="60"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setModalConfig(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
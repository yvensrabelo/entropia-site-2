'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Users, Clock, Calendar, Lock, Check, Copy, Link } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProvas: 0,
    totalProfessores: 0,
    aulasHoje: 0,
    turmasAtivas: 0
  });
  const [loading, setLoading] = useState(true);
  const [codigoPortaria, setCodigoPortaria] = useState('');
  const [codigoSalvo, setCodigoSalvo] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    fetchStats();
    
    // Carregar código da portaria
    const codigo = localStorage.getItem('codigo_portaria') || 'PORTARIA';
    setCodigoPortaria(codigo);
  }, []);

  const fetchStats = () => {
    try {
      // Buscar total de provas do localStorage
      const storedProvas = localStorage.getItem('provas');
      const provas = storedProvas ? JSON.parse(storedProvas) : [];
      
      // Buscar total de professores
      const storedProfessores = localStorage.getItem('professores');
      const professores = storedProfessores ? JSON.parse(storedProfessores) : [];
      
      // Buscar aulas de hoje
      const hoje = new Date();
      const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const diaHoje = diasSemana[hoje.getDay()];
      
      const storedHorarios = localStorage.getItem('horarios');
      const horarios = storedHorarios ? JSON.parse(storedHorarios) : [];
      const aulasHoje = horarios.filter((h: any) => h.dia === diaHoje);
      
      // Buscar turmas ativas
      const storedTurmasAtivas = localStorage.getItem('turmas_ativas');
      const turmasAtivas = storedTurmasAtivas ? JSON.parse(storedTurmasAtivas) : [];
      const turmasAtivasCount = turmasAtivas.filter((t: any) => t.ativa).length;

      setStats({
        totalProvas: provas.length,
        totalProfessores: professores.filter((p: any) => p.status === 'ativo').length,
        aulasHoje: aulasHoje.length,
        turmasAtivas: turmasAtivasCount
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const salvarCodigoPortaria = () => {
    if (codigoPortaria.trim()) {
      localStorage.setItem('codigo_portaria', codigoPortaria.toUpperCase());
      setCodigoSalvo(true);
      setTimeout(() => setCodigoSalvo(false), 3000);
    }
  };

  const copiarLinkPortaria = () => {
    const url = window.location.origin + '/portaria';
    navigator.clipboard.writeText(url);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">Visão geral do sistema Entropia</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Provas */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Provas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProvas}</p>
              <p className="text-xs text-gray-500 mt-1">Banco de questões</p>
            </div>
            <FileText className="h-12 w-12 text-blue-500" />
          </div>
        </div>

        {/* Total de Professores */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Professores</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProfessores}</p>
              <p className="text-xs text-gray-500 mt-1">Cadastrados no sistema</p>
            </div>
            <Users className="h-12 w-12 text-green-500" />
          </div>
        </div>

        {/* Aulas Hoje */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aulas Hoje</p>
              <p className="text-3xl font-bold text-gray-900">{stats.aulasHoje}</p>
              <p className="text-xs text-gray-500 mt-1">Programadas para hoje</p>
            </div>
            <Clock className="h-12 w-12 text-orange-500" />
          </div>
        </div>

        {/* Turmas Ativas */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Turmas Ativas</p>
              <p className="text-3xl font-bold text-gray-900">{stats.turmasAtivas}</p>
              <p className="text-xs text-gray-500 mt-1">Turmas operacionais</p>
            </div>
            <Calendar className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Código da Portaria */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">Código de Acesso da Portaria</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Configure o código de acesso para o sistema de visualização da portaria.
        </p>
        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <input
              type="text"
              value={codigoPortaria}
              onChange={(e) => setCodigoPortaria(e.target.value.toUpperCase())}
              className="w-full p-3 border border-gray-300 rounded-lg text-center text-xl font-mono tracking-wider focus:ring-2 focus:ring-green-500 focus:outline-none"
              maxLength={10}
              placeholder="CÓDIGO"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Acesse em: <span className="font-mono text-blue-600">/portaria</span>
              </p>
              <button
                onClick={copiarLinkPortaria}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Copy className="w-4 h-4" />
                {copiado ? 'Copiado!' : 'Copiar link'}
              </button>
            </div>
          </div>
          <button
            onClick={salvarCodigoPortaria}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              codigoSalvo 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {codigoSalvo ? (
              <>
                <Check className="w-4 h-4" />
                Salvo!
              </>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </div>

      {/* Seção de Acesso Rápido */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/dashboard/professores"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Gerenciar Professores</h3>
                <p className="text-sm text-gray-500">Cadastrar e editar professores</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/dashboard/horarios"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Grade de Horários</h3>
                <p className="text-sm text-gray-500">Organizar horários das aulas</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/dashboard/turmas"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Card de Turmas</h3>
                <p className="text-sm text-gray-500">Controlar cards da página inicial</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/dashboard/turmas-ativas"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-indigo-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Turmas Ativas</h3>
                <p className="text-sm text-gray-500">Gerenciar turmas operacionais</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/dashboard/descritores"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Sistema de Descritores</h3>
                <p className="text-sm text-gray-500">Preencher e enviar descritores</p>
              </div>
            </div>
          </a>

          <a
            href="/portaria"
            target="_blank"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <Lock className="h-8 w-8 text-gray-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Visualizar Portaria</h3>
                <p className="text-sm text-gray-500">Abrir tela da portaria</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/dashboard/mapeamento-turmas"
            className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow border border-gray-200"
          >
            <div className="flex items-center">
              <Link className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Mapeamento de Turmas</h3>
                <p className="text-sm text-gray-500">Configurar mapeamento de turmas</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Link, Save, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { TURMAS_CONFIG } from '@/config/turmas';
import AuthGuard from '@/components/admin/AuthGuard';

interface TurmaAtiva {
  id: string;
  nome: string;
  turno: 'manhã' | 'tarde' | 'noite';
  tipo: 'intensiva' | 'extensiva' | 'sis-psc';
  serie?: '1ª série' | '2ª série' | '3ª série' | 'Extensivo';
  ativa: boolean;
  ordem: number;
}

interface MapeamentoTurma {
  turmaAntigaNome: string;
  turmaAtivaId: string;
}

export default function MapeamentoTurmasPage() {
  const [turmasAtivas, setTurmasAtivas] = useState<TurmaAtiva[]>([]);
  const [mapeamentos, setMapeamentos] = useState<MapeamentoTurma[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    // Carregar turmas ativas
    const stored = localStorage.getItem('turmas_ativas');
    if (stored) {
      const turmas = JSON.parse(stored);
      setTurmasAtivas(turmas.filter((t: TurmaAtiva) => t.ativa));
    }

    // Carregar mapeamentos existentes
    const storedMapeamentos = localStorage.getItem('mapeamento_turmas');
    if (storedMapeamentos) {
      setMapeamentos(JSON.parse(storedMapeamentos));
    } else {
      // Inicializar com mapeamentos vazios
      const mapeamentosIniciais = TURMAS_CONFIG.turmas
        .filter(t => t.ativa)
        .map(t => ({
          turmaAntigaNome: t.nome,
          turmaAtivaId: ''
        }));
      setMapeamentos(mapeamentosIniciais);
    }
  };

  const handleMapeamentoChange = (turmaAntigaNome: string, turmaAtivaId: string) => {
    setMapeamentos(prev => 
      prev.map(m => 
        m.turmaAntigaNome === turmaAntigaNome 
          ? { ...m, turmaAtivaId } 
          : m
      )
    );
  };

  const salvarMapeamentos = () => {
    setSalvando(true);
    
    try {
      // Salvar mapeamentos no localStorage
      localStorage.setItem('mapeamento_turmas', JSON.stringify(mapeamentos));
      
      // Criar objeto de lookup para fácil acesso
      const mapeamentoLookup: Record<string, string> = {};
      mapeamentos.forEach(m => {
        if (m.turmaAtivaId) {
          mapeamentoLookup[m.turmaAntigaNome] = m.turmaAtivaId;
        }
      });
      
      localStorage.setItem('mapeamento_turmas_lookup', JSON.stringify(mapeamentoLookup));
      
      setMensagem({ tipo: 'sucesso', texto: 'Mapeamentos salvos com sucesso!' });
      
      // Disparar evento para notificar outras abas
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'mapeamento_turmas',
        newValue: JSON.stringify(mapeamentos),
        url: window.location.href
      }));
      
    } catch (error) {
      console.error('Erro ao salvar mapeamentos:', error);
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar mapeamentos' });
    } finally {
      setSalvando(false);
      setTimeout(() => setMensagem(null), 3000);
    }
  };

  const aplicarMapeamentoAutomatico = () => {
    const novosMapeamentos = mapeamentos.map(m => {
      // Tentar encontrar correspondência automática
      const turmaAtiva = turmasAtivas.find(ta => {
        const nomeNormalizado = ta.nome.toLowerCase();
        const nomeAntigo = m.turmaAntigaNome.toLowerCase();
        
        // Verificar se contém palavras-chave similares
        if (nomeAntigo.includes('intensiva') && nomeNormalizado.includes('intensiva')) return true;
        if (nomeAntigo.includes('extensiva') && nomeNormalizado.includes('extensiva')) return true;
        if (nomeAntigo.includes('sis') && nomeNormalizado.includes('sis')) return true;
        if (nomeAntigo.includes('psc') && nomeNormalizado.includes('psc')) return true;
        
        // Verificar turno
        if (nomeAntigo.includes('matutina') && ta.turno === 'manhã') return true;
        if (nomeAntigo.includes('vespertina') && ta.turno === 'tarde') return true;
        if (nomeAntigo.includes('noturna') && ta.turno === 'noite') return true;
        
        return false;
      });
      
      return {
        ...m,
        turmaAtivaId: turmaAtiva?.id || m.turmaAtivaId
      };
    });
    
    setMapeamentos(novosMapeamentos);
  };

  const getTurnoFromNome = (nome: string): string => {
    if (nome.toLowerCase().includes('matutino')) return 'Manhã';
    if (nome.toLowerCase().includes('vespertino')) return 'Tarde';
    if (nome.toLowerCase().includes('noturno')) return 'Noite';
    return '-';
  };

  return (
    <AuthGuard>
      <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mapeamento de Turmas</h1>
        <p className="text-gray-600 mt-2">
          Configure o mapeamento entre as turmas antigas do sistema e as novas turmas ativas
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Por que fazer o mapeamento?</p>
            <p>
              Este mapeamento garante que as referências às turmas antigas continuem funcionando
              com o novo sistema de turmas ativas. Isso é importante para manter a compatibilidade
              com dados existentes.
            </p>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={aplicarMapeamentoAutomatico}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Sugerir Mapeamento Automático
          </button>
          
          <button
            onClick={salvarMapeamentos}
            disabled={salvando}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {salvando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Mapeamentos
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mensagem de feedback */}
      {mensagem && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          mensagem.tipo === 'sucesso' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {mensagem.tipo === 'sucesso' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {mensagem.texto}
        </div>
      )}

      {/* Tabela de Mapeamento */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Turma Antiga (config/turmas.ts)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Turno
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mapear Para
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {TURMAS_CONFIG.turmas
              .filter(turmaAntiga => turmaAntiga.ativa)
              .map(turmaAntiga => {
                const mapeamento = mapeamentos.find(m => m.turmaAntigaNome === turmaAntiga.nome);
                const turmaAtivaSelecionada = turmasAtivas.find(ta => ta.id === mapeamento?.turmaAtivaId);
                
                return (
                  <tr key={turmaAntiga.codigo} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{turmaAntiga.nome}</div>
                        <div className="text-xs text-gray-500">Código: {turmaAntiga.codigo}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{turmaAntiga.turno}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={mapeamento?.turmaAtivaId || ''}
                        onChange={(e) => handleMapeamentoChange(turmaAntiga.nome, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                      >
                        <option value="">Não mapeada</option>
                        {turmasAtivas.map(ta => (
                          <option key={ta.id} value={ta.id}>
                            {ta.nome} ({ta.turno})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {turmaAtivaSelecionada ? (
                        <span className="flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm">
                          <Link className="w-4 h-4" />
                          Mapeada
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-700 bg-orange-100 px-3 py-1 rounded-full text-sm">
                          <AlertCircle className="w-4 h-4" />
                          Pendente
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Resumo */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Resumo do Mapeamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Total de turmas antigas:</span>
            <span className="ml-2 font-semibold">{TURMAS_CONFIG.turmas.filter(t => t.ativa).length}</span>
          </div>
          <div>
            <span className="text-gray-600">Turmas mapeadas:</span>
            <span className="ml-2 font-semibold text-green-700">
              {mapeamentos.filter(m => m.turmaAtivaId).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Pendentes:</span>
            <span className="ml-2 font-semibold text-orange-700">
              {mapeamentos.filter(m => !m.turmaAtivaId).length}
            </span>
          </div>
        </div>
      </div>
      </div>
    </AuthGuard>
  );
}
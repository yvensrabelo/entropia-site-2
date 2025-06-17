'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import AuthGuard from '@/components/admin/AuthGuard';
import { RefreshCw, Database, Search, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface ProvaLocalStorage {
  nome?: string;
  titulo?: string;
  tipo_prova?: string;
  instituicao?: string;
  ano?: number;
  subcategoria?: string;
  area?: string;
  arquivo_url?: string;
  arquivo_nome?: string;
  url?: string;
  tipo?: string;
  [key: string]: any;
}

export default function SyncPSIPage() {
  const [investigating, setInvestigating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [results, setResults] = useState<{
    localProvas: ProvaLocalStorage[];
    supabaseProvas: any[];
    syncResults?: any;
  } | null>(null);

  const investigateLocalStorage = async () => {
    setInvestigating(true);
    try {
      const todasAsChaves = Object.keys(localStorage);
      const chavesRelevantes = todasAsChaves.filter(key => 
        key.toLowerCase().includes('prova') ||
        key.toLowerCase().includes('psi') ||
        key.toLowerCase().includes('upload') ||
        key.toLowerCase().includes('arquivo')
      );

      const provasEncontradas: ProvaLocalStorage[] = [];

      for (const chave of chavesRelevantes) {
        const dados = localStorage.getItem(chave);
        if (dados) {
          try {
            const parsed = JSON.parse(dados);
            
            if (Array.isArray(parsed)) {
              const provasPSI = parsed.filter((item: any) => 
                item.tipo_prova === 'PSI' || 
                (item.titulo && item.titulo.includes('PSI')) ||
                (item.nome && item.nome.includes('PSI'))
              );
              provasEncontradas.push(...provasPSI);
            } else if (parsed && typeof parsed === 'object' && 
                      (parsed.tipo_prova === 'PSI' || 
                       (parsed.titulo && parsed.titulo.includes('PSI')))) {
              provasEncontradas.push(parsed);
            }
          } catch (e) {
            // Ignorar chaves que não são JSON válido
          }
        }
      }

      // Buscar provas PSI no Supabase
      const { data: supabaseProvas, error } = await supabase
        .from('provas')
        .select('*')
        .eq('tipo_prova', 'PSI')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar provas no Supabase:', error);
      }

      setResults({
        localProvas: provasEncontradas,
        supabaseProvas: supabaseProvas || []
      });

    } catch (error) {
      console.error('Erro na investigação:', error);
    } finally {
      setInvestigating(false);
    }
  };

  const syncProvas = async () => {
    if (!results || results.localProvas.length === 0) return;

    setSyncing(true);
    try {
      // Filtrar provas que não existem no Supabase
      const existentesIds = new Set(
        results.supabaseProvas.map(p => `${p.titulo}-${p.ano}`.toLowerCase())
      );

      const provasNovas = results.localProvas.filter(prova => {
        const id = `${prova.titulo || prova.nome || ''}-${prova.ano || ''}`.toLowerCase();
        return !existentesIds.has(id);
      });

      if (provasNovas.length === 0) {
        setResults(prev => prev ? {
          ...prev,
          syncResults: { message: 'Todas as provas já estão sincronizadas', type: 'info' }
        } : null);
        return;
      }

      // Preparar dados para inserção
      const dadosParaInserir = provasNovas.map(prova => ({
        grupo_id: `psi-${prova.ano || new Date().getFullYear()}`,
        instituicao: prova.instituicao || '',
        tipo_prova: 'PSI',
        ano: prova.ano || new Date().getFullYear(),
        titulo: prova.titulo || prova.nome || `PSI ${prova.ano || new Date().getFullYear()}`,
        subtitulo: prova.subcategoria || '',
        ordem: 1,
        url_prova: prova.arquivo_url || prova.url || '',
        url_gabarito: '',
        ativo: true,
        visualizacoes: 0
      }));

      // Inserir no Supabase
      const { data, error } = await supabase
        .from('provas')
        .insert(dadosParaInserir)
        .select();

      if (error) {
        setResults(prev => prev ? {
          ...prev,
          syncResults: { message: `Erro na sincronização: ${error.message}`, type: 'error' }
        } : null);
      } else {
        setResults(prev => prev ? {
          ...prev,
          syncResults: { 
            message: `${data.length} provas PSI sincronizadas com sucesso!`, 
            type: 'success',
            data 
          }
        } : null);

        // Atualizar lista do Supabase
        const { data: updatedSupabase } = await supabase
          .from('provas')
          .select('*')
          .eq('tipo_prova', 'PSI')
          .order('created_at', { ascending: false });

        setResults(prev => prev ? {
          ...prev,
          supabaseProvas: updatedSupabase || []
        } : null);
      }

    } catch (error) {
      console.error('Erro na sincronização:', error);
      setResults(prev => prev ? {
        ...prev,
        syncResults: { message: `Erro inesperado: ${error}`, type: 'error' }
      } : null);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <AuthGuard>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sincronização de Provas PSI</h1>
          <p className="text-gray-600 mt-2">
            Ferramenta para sincronizar provas PSI do localStorage com o Supabase
          </p>
        </div>

        {/* Ações */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex gap-4">
            <button
              onClick={investigateLocalStorage}
              disabled={investigating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {investigating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {investigating ? 'Investigando...' : 'Investigar localStorage'}
            </button>

            {results && results.localProvas.length > 0 && (
              <button
                onClick={syncProvas}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {syncing ? 'Sincronizando...' : 'Sincronizar com Supabase'}
              </button>
            )}
          </div>
        </div>

        {/* Resultados */}
        {results && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* localStorage */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-600" />
                localStorage ({results.localProvas.length})
              </h2>
              
              {results.localProvas.length === 0 ? (
                <p className="text-gray-500">Nenhuma prova PSI encontrada no localStorage</p>
              ) : (
                <div className="space-y-3">
                  {results.localProvas.map((prova, index) => (
                    <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <h3 className="font-medium text-gray-900">
                        {prova.titulo || prova.nome || 'Sem título'}
                      </h3>
                      <div className="text-sm text-gray-600 mt-1">
                        <p>Ano: {prova.ano || 'Não definido'}</p>
                        <p>Subcategoria: {prova.subcategoria || 'Não definida'}</p>
                        <p>URL: {prova.arquivo_url || prova.url ? '✅ Disponível' : '❌ Não definida'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Supabase */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                Supabase ({results.supabaseProvas.length})
              </h2>
              
              {results.supabaseProvas.length === 0 ? (
                <p className="text-gray-500">Nenhuma prova PSI encontrada no Supabase</p>
              ) : (
                <div className="space-y-3">
                  {results.supabaseProvas.map((prova) => (
                    <div key={prova.id} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="font-medium text-gray-900">{prova.titulo}</h3>
                      <div className="text-sm text-gray-600 mt-1">
                        <p>Ano: {prova.ano}</p>
                        <p>Subtítulo: {prova.subtitulo || 'Não definido'}</p>
                        <p>URL: {prova.url_prova ? '✅ Disponível' : '❌ Não definida'}</p>
                        <p>Criado em: {new Date(prova.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resultado da sincronização */}
        {results?.syncResults && (
          <div className={`mt-6 p-4 rounded-lg border ${
            results.syncResults.type === 'success' ? 'bg-green-50 border-green-200' :
            results.syncResults.type === 'error' ? 'bg-red-50 border-red-200' :
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="flex items-center gap-2">
              {results.syncResults.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {results.syncResults.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {results.syncResults.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600" />}
              <p className={`font-medium ${
                results.syncResults.type === 'success' ? 'text-green-800' :
                results.syncResults.type === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {results.syncResults.message}
              </p>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import ProvaCard from './ProvaCard';
import ProvaGroupCard from './ProvaGroupCard';
import MacroGroupCard from './MacroGroupCard';
import PsiGroupCard from './PsiGroupCard';
import FiltrosModernos from './FiltrosModernos';
import { Prova } from '@/lib/types/prova';
import { Loader2, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 20;

export default function ProvasList() {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAtivo, setFiltroAtivo] = useState({
    tipo: null as string | null,
    subcategoria: null as string | null,
    area: null as string | null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProvas();
  }, []);

  const fetchProvas = async () => {
    try {
      if (!supabase) {
        console.log('Supabase não está configurado');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('provas')
        .select('*')
        .order('ano', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProvas(data || []);
    } catch (error) {
      console.error('Erro ao buscar provas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar e buscar provas
  const provasFiltradas = useMemo(() => {
    let filtered = provas;
    
    // Filtro por tipo
    if (filtroAtivo.tipo) {
      filtered = filtered.filter(prova => prova.tipo_prova === filtroAtivo.tipo);
    }
    
    // Filtro por subcategoria
    if (filtroAtivo.subcategoria) {
      filtered = filtered.filter(prova => prova.subcategoria === filtroAtivo.subcategoria);
    }
    
    // Filtro por área (para MACRO DIA 2)
    if (filtroAtivo.area) {
      filtered = filtered.filter(prova => prova.area === filtroAtivo.area);
    }
    
    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(prova => 
        prova.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prova.instituicao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prova.ano.toString().includes(searchTerm) ||
        (prova.etapa && prova.etapa.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [provas, filtroAtivo, searchTerm]);

  // Agrupar provas e gabaritos do mesmo ano/etapa
  const provasAgrupadas = useMemo(() => {
    const grupos = new Map();
    const macroGrupos = new Map();
    const psiGrupos = new Map();
    
    provasFiltradas.forEach(prova => {
      // Tratamento especial para PSI
      if (prova.tipo_prova === 'PSI') {
        const psiKey = `${prova.instituicao}-PSI-${prova.ano}`;
        
        if (!psiGrupos.has(psiKey)) {
          psiGrupos.set(psiKey, {
            key: psiKey,
            instituicao: prova.instituicao,
            tipo_prova: 'PSI',
            ano: prova.ano,
            dia1: null,
            dia2: null,
            totalVisualizacoes: 0,
            isPsi: true
          });
        }
        
        const psiGrupo = psiGrupos.get(psiKey);
        psiGrupo.totalVisualizacoes += prova.visualizacoes || 0;
        
        // Organizar por DIA
        if (prova.subcategoria === 'DIA 1') {
          if (!psiGrupo.dia1) psiGrupo.dia1 = {};
          if (prova.is_gabarito) {
            psiGrupo.dia1.gabarito = prova;
          } else {
            psiGrupo.dia1.prova = prova;
          }
        } else if (prova.subcategoria === 'DIA 2') {
          if (!psiGrupo.dia2) psiGrupo.dia2 = {};
          if (prova.is_gabarito) {
            psiGrupo.dia2.gabarito = prova;
          } else {
            psiGrupo.dia2.prova = prova;
          }
        }
      }
      // Tratamento especial para MACRO
      else if (prova.tipo_prova === 'MACRO') {
        const macroKey = `${prova.instituicao}-MACRO-${prova.ano}`;
        
        if (!macroGrupos.has(macroKey)) {
          macroGrupos.set(macroKey, {
            key: macroKey,
            instituicao: prova.instituicao,
            tipo_prova: 'MACRO',
            ano: prova.ano,
            dia1: null,
            dia2: {
              biologicas: null,
              humanas: null,
              exatas: null
            },
            totalVisualizacoes: 0,
            isMacro: true
          });
        }
        
        const macroGrupo = macroGrupos.get(macroKey);
        macroGrupo.totalVisualizacoes += prova.visualizacoes || 0;
        
        // Organizar por DIA e área
        if (prova.subcategoria === 'DIA 1') {
          if (!macroGrupo.dia1) macroGrupo.dia1 = {};
          if (prova.is_gabarito) {
            macroGrupo.dia1.gabarito = prova;
          } else {
            macroGrupo.dia1.prova = prova;
          }
        } else if (prova.subcategoria === 'DIA 2' && prova.area) {
          const areaKey = prova.area.toLowerCase().replace('ó', 'o');
          if (!macroGrupo.dia2[areaKey]) macroGrupo.dia2[areaKey] = {};
          
          if (prova.is_gabarito) {
            macroGrupo.dia2[areaKey].gabarito = prova;
          } else {
            macroGrupo.dia2[areaKey].prova = prova;
          }
        }
      } else {
        // Agrupamento normal para outras provas
        const key = `${prova.instituicao}-${prova.tipo_prova}-${prova.subcategoria || ''}-${prova.ano}-${prova.etapa || ''}`;
        
        if (!grupos.has(key)) {
          grupos.set(key, {
            key,
            instituicao: prova.instituicao,
            tipo_prova: prova.tipo_prova,
            subcategoria: prova.subcategoria,
            area: prova.area,
            ano: prova.ano,
            etapa: prova.etapa,
            titulo: prova.titulo,
            prova: null,
            gabarito: null,
            totalVisualizacoes: 0,
            isMacro: false
          });
        }
        
        const grupo = grupos.get(key);
        
        // Adicionar prova ou gabarito ao grupo
        if (prova.is_gabarito) {
          grupo.gabarito = prova;
        } else {
          grupo.prova = prova;
        }
        
        // Somar visualizações
        grupo.totalVisualizacoes += prova.visualizacoes || 0;
        
        // Atualizar título se necessário (preferir título da prova sobre gabarito)
        if (!prova.is_gabarito) {
          grupo.titulo = prova.titulo;
        }
      }
    });
    
    // Combinar grupos normais, PSI e MACRO
    const todosGrupos = [...grupos.values(), ...psiGrupos.values(), ...macroGrupos.values()];
    
    // Ordenar por ano (descendente) e tipo
    return todosGrupos.sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano;
      if (a.tipo_prova !== b.tipo_prova) {
        // MACRO vem depois de PSC e SIS do mesmo ano
        if (a.tipo_prova === 'MACRO') return 1;
        if (b.tipo_prova === 'MACRO') return -1;
      }
      return (a.titulo || '').localeCompare(b.titulo || '');
    });
  }, [provasFiltradas]);

  // Paginação
  const paginatedGroups = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return provasAgrupadas.slice(startIndex, endIndex);
  }, [provasAgrupadas, currentPage]);

  const totalPages = Math.ceil(provasAgrupadas.length / ITEMS_PER_PAGE);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [filtroAtivo, searchTerm]);

  // Contar provas por tipo considerando filtros de busca
  const contadorProvas = useMemo(() => {
    const contador: Record<string, number> = {
      PSC: 0,
      MACRO: 0,
      SIS: 0,
      ENEM: 0,
      PSI: 0,
      UERR: 0,
      UFRR: 0
    };

    // Se há busca, contar apenas as provas filtradas por busca
    const provasParaContar = searchTerm 
      ? provas.filter(prova => 
          prova.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prova.instituicao.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prova.ano.toString().includes(searchTerm) ||
          (prova.etapa && prova.etapa.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : provas;

    provasParaContar.forEach(prova => {
      if (prova.tipo_prova && contador[prova.tipo_prova] !== undefined) {
        contador[prova.tipo_prova]++;
      }
    });

    return contador;
  }, [provas, searchTerm]);

  // Handler para mudança de filtro
  const handleFiltroChange = (tipo: string | null, subcategoria?: string | null, area?: string | null) => {
    setFiltroAtivo({
      tipo,
      subcategoria: subcategoria || null,
      area: area || null
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Barra de busca elegante */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar provas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all duration-200"
              />
            </div>
            
            <motion.div 
              key={provasAgrupadas.length}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-full"
            >
              {provasAgrupadas.length} conjunto{provasAgrupadas.length !== 1 ? 's' : ''}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Filtros hierárquicos */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <FiltrosModernos
          contadorProvas={contadorProvas}
          onFiltroChange={handleFiltroChange}
          filtroAtivo={filtroAtivo}
        />
      </motion.div>

      {/* Lista de provas */}
      {provasAgrupadas.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-12"
        >
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm 
                ? `Nenhuma prova encontrada para "${searchTerm}"`
                : filtroAtivo.tipo 
                  ? `Nenhuma prova ${filtroAtivo.subcategoria || filtroAtivo.tipo} disponível.`
                  : 'Nenhuma prova disponível ainda.'
              }
            </p>
            {(filtroAtivo.tipo || searchTerm) && (
              <button
                onClick={() => {
                  setFiltroAtivo({ tipo: null, subcategoria: null, area: null });
                  setSearchTerm('');
                }}
                className="mt-4 text-green-600 hover:text-green-700 font-medium"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {paginatedGroups.map((group, index) => (
              <motion.div
                key={group.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className={(group.isMacro || group.isPsi) ? "col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2" : ""}
              >
                {group.isMacro ? (
                  <MacroGroupCard group={group} />
                ) : group.isPsi ? (
                  <PsiGroupCard group={group} />
                ) : (
                  <ProvaGroupCard group={group} />
                )}
              </motion.div>
            ))}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Mostrar apenas algumas páginas
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`
                          px-3 py-1 rounded-lg text-sm font-medium transition-colors
                          ${currentPage === page 
                            ? 'bg-green-500 text-white' 
                            : 'bg-white border border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 || 
                    page === currentPage + 2
                  ) {
                    return <span key={page} className="px-2">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
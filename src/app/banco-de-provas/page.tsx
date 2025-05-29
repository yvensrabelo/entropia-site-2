'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase-singleton';

interface Prova {
  id: string;
  instituicao: string;
  tipo_prova: string;
  ano: number;
  grupo_id: string;
  ordem: number;
  titulo: string;
  subtitulo?: string;
  subcategoria?: string;
  area?: string;
  url_prova?: string;
  url_gabarito?: string;
  visualizacoes: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface GrupoCard {
  key: string;
  instituicao: string;
  tipo_prova: string;
  ano: number;
  titulo: string;
  badge: string;
  badgeColor: string;
  items: Array<{
    label: string;
    prova?: Prova;
    gabarito?: Prova;
    isDivider?: boolean;
    isSubtitle?: boolean;
  }>;
}

// Cores dos badges por instituição
const BADGE_COLORS: Record<string, string> = {
  UFAM: 'bg-blue-500',
  UEA: 'bg-purple-500',
  UFRR: 'bg-yellow-500',
  UERR: 'bg-teal-500',
  ENEM: 'bg-indigo-500',
  OUTROS: 'bg-gray-500'
};

// Componente do Card
const ProvaCard = ({ grupo }: { grupo: GrupoCard }) => {
  const incrementarVisualizacao = async (provaId: string) => {
    const { data } = await supabase
      .from('provas')
      .select('visualizacoes')
      .eq('id', provaId)
      .single();
    
    if (data) {
      await supabase
        .from('provas')
        .update({ visualizacoes: (data.visualizacoes || 0) + 1 })
        .eq('id', provaId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      {/* Header do Card */}
      <div className="flex justify-between items-start mb-4">
        <span className={`${grupo.badgeColor} text-white px-3 py-1 rounded text-sm font-bold`}>
          {grupo.badge}
        </span>
        <span className="text-gray-500 text-sm">
          {grupo.instituicao}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 mb-4">{grupo.titulo}</h3>
      
      {/* Items do Card */}
      <div className="space-y-2">
        {grupo.items.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Nenhum item disponível</p>
        ) : (
          grupo.items.map((item, index) => {
          // Linha pontilhada
          if (item.isDivider) {
            return (
              <div key={index} className="border-t-2 border-dotted border-gray-300 my-3"></div>
            );
          }
          
          // Subtítulo (ex: PPL 2020)
          if (item.isSubtitle) {
            return (
              <h4 key={index} className="text-lg font-bold text-gray-800 mt-4 mb-2">{item.label}</h4>
            );
          }
          
          // Item normal
          return (
            <div key={index} className="flex justify-between items-center">
              <span className="font-medium text-gray-700">{item.label}</span>
              <div className="flex gap-2">
                {item.prova?.url_prova && (
                  <button
                    onClick={() => {
                      incrementarVisualizacao(item.prova!.id);
                      window.open(item.prova!.url_prova, '_blank');
                    }}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
                  >
                    PROVA
                  </button>
                )}
                {item.gabarito?.url_gabarito && (
                  <button
                    onClick={() => {
                      incrementarVisualizacao(item.gabarito!.id);
                      window.open(item.gabarito!.url_gabarito, '_blank');
                    }}
                    className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded transition-colors"
                  >
                    GAB
                  </button>
                )}
              </div>
            </div>
          );
        })
        )}
      </div>
    </motion.div>
  );
};

// Componente de Skeleton
const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="w-16 h-6 bg-gray-200 rounded"></div>
      <div className="w-12 h-4 bg-gray-200 rounded"></div>
    </div>
    <div className="w-32 h-6 bg-gray-200 rounded mb-4"></div>
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex justify-between items-center">
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            <div className="w-12 h-6 bg-gray-200 rounded"></div>
            <div className="w-12 h-6 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function BancoDeProvas() {
  const [grupos, setGrupos] = useState<GrupoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('TUDO');

  useEffect(() => {
    fetchProvas();
  }, []);

  const fetchProvas = async () => {
    try {
      const { data, error } = await supabase
        .from('provas')
        .select('*')
        .eq('ativo', true)
        .order('ano', { ascending: false })
        .order('tipo_prova')
        .order('ordem');

      if (error) throw error;

      // Agrupar e processar provas
      const gruposProcessados = processarProvas(data || []);
      setGrupos(gruposProcessados);
    } catch (error) {
      console.error('Erro ao buscar provas:', error);
    } finally {
      setLoading(false);
    }
  };

  const processarProvas = (provas: Prova[]): GrupoCard[] => {
    const gruposMap = new Map<string, Prova[]>();
    
    // Agrupar provas por chave
    provas.forEach(prova => {
      let chave = '';
      
      // PSC: agrupar PSC 1, 2, 3 do mesmo ano
      if (prova.tipo_prova === 'PSC') {
        chave = `PSC-${prova.ano}-${prova.instituicao}`;
      }
      // PSI: agrupar DIA 1 e DIA 2 do mesmo ano
      else if (prova.tipo_prova === 'PSI') {
        chave = `PSI-${prova.ano}-${prova.instituicao}`;
      }
      // SIS: agrupar SIS 1, 2, 3 do mesmo ano
      else if (prova.tipo_prova === 'SIS') {
        chave = `SIS-${prova.ano}-${prova.instituicao}`;
      }
      // MACRO: agrupar DIA 1 + todas as áreas do mesmo ano
      else if (prova.tipo_prova === 'MACRO') {
        chave = `MACRO-${prova.ano}-${prova.instituicao}`;
      }
      // PSS: agrupar PSS 1, 2, 3 do mesmo ano
      else if (prova.tipo_prova === 'PSS') {
        chave = `PSS-${prova.ano}-${prova.instituicao}`;
      }
      // UERR: grupo único
      else if (prova.tipo_prova === 'UERR') {
        chave = `UERR-${prova.ano}-${prova.instituicao}`;
      }
      // ENEM: pode ter REGULAR e PPL no mesmo card
      else if (prova.tipo_prova === 'ENEM') {
        chave = `ENEM-${prova.ano}`;
      }
      // OUTROS
      else {
        chave = `OUTROS-${prova.ano}-${prova.instituicao}`;
      }
      
      if (!gruposMap.has(chave)) {
        gruposMap.set(chave, []);
      }
      gruposMap.get(chave)!.push(prova);
    });

    // Converter para GrupoCard
    const gruposCards: GrupoCard[] = [];
    
    gruposMap.forEach((provasGrupo, chave) => {
      if (provasGrupo.length === 0) return;
      
      const primeiraProva = provasGrupo[0];
      const tipo = primeiraProva.tipo_prova;
      
      // PSC Card
      if (tipo === 'PSC') {
        const card: GrupoCard = {
          key: chave,
          instituicao: primeiraProva.instituicao,
          tipo_prova: tipo,
          ano: primeiraProva.ano,
          titulo: `PSC ${primeiraProva.ano}`,
          badge: 'UFAM',
          badgeColor: BADGE_COLORS.UFAM,
          items: []
        };
        
        ['1', '2', '3'].forEach(num => {
          const prova = provasGrupo.find(p => p.subcategoria === num);
          if (prova) {
            card.items.push({
              label: `PSC ${num}`,
              prova: prova.url_prova ? prova : undefined,
              gabarito: prova.url_gabarito ? prova : undefined
            });
          }
        });
        
        // Se não encontrou nenhuma prova com subcategoria 1, 2, 3, adicionar todas as provas do grupo
        if (card.items.length === 0) {
          provasGrupo.forEach((prova, idx) => {
            card.items.push({
              label: prova.titulo || `PSC ${idx + 1}`,
              prova: prova.url_prova ? prova : undefined,
              gabarito: prova.url_gabarito ? prova : undefined
            });
          });
        }
        
        gruposCards.push(card);
      }
      
      // PSI Card
      else if (tipo === 'PSI') {
        const card: GrupoCard = {
          key: chave,
          instituicao: primeiraProva.instituicao,
          tipo_prova: tipo,
          ano: primeiraProva.ano,
          titulo: `PSI ${primeiraProva.ano}`,
          badge: 'UFAM',
          badgeColor: BADGE_COLORS.UFAM,
          items: []
        };
        
        const dia1 = provasGrupo.find(p => p.subcategoria === 'DIA 1');
        if (dia1) {
          card.items.push({
            label: 'DIA 1',
            prova: dia1.url_prova ? dia1 : undefined,
            gabarito: dia1.url_gabarito ? dia1 : undefined
          });
        }
        
        // Linha pontilhada
        if (dia1 && provasGrupo.some(p => p.subcategoria === 'DIA 2')) {
          card.items.push({ label: '', isDivider: true });
        }
        
        const dia2 = provasGrupo.find(p => p.subcategoria === 'DIA 2');
        if (dia2) {
          card.items.push({
            label: 'DIA 2',
            prova: dia2.url_prova ? dia2 : undefined,
            gabarito: dia2.url_gabarito ? dia2 : undefined
          });
        }
        
        // Fallback se não encontrar subcategorias esperadas
        if (card.items.length === 0) {
          provasGrupo.forEach((prova) => {
            card.items.push({
              label: prova.titulo || prova.subcategoria || 'PSI',
              prova: prova.url_prova ? prova : undefined,
              gabarito: prova.url_gabarito ? prova : undefined
            });
          });
        }
        
        gruposCards.push(card);
      }
      
      // SIS Card
      else if (tipo === 'SIS') {
        const card: GrupoCard = {
          key: chave,
          instituicao: primeiraProva.instituicao,
          tipo_prova: tipo,
          ano: primeiraProva.ano,
          titulo: `SIS ${primeiraProva.ano}`,
          badge: 'UEA',
          badgeColor: BADGE_COLORS.UEA,
          items: []
        };
        
        ['1', '2', '3'].forEach(num => {
          const prova = provasGrupo.find(p => p.subcategoria === num);
          if (prova) {
            card.items.push({
              label: `SIS ${num}`,
              prova: prova.url_prova ? prova : undefined,
              gabarito: prova.url_gabarito ? prova : undefined
            });
          }
        });
        
        // Fallback se não encontrar subcategorias esperadas
        if (card.items.length === 0) {
          provasGrupo.forEach((prova) => {
            card.items.push({
              label: prova.titulo || prova.subcategoria || 'SIS',
              prova: prova.url_prova ? prova : undefined,
              gabarito: prova.url_gabarito ? prova : undefined
            });
          });
        }
        
        gruposCards.push(card);
      }
      
      // MACRO Card
      else if (tipo === 'MACRO') {
        const card: GrupoCard = {
          key: chave,
          instituicao: primeiraProva.instituicao,
          tipo_prova: tipo,
          ano: primeiraProva.ano,
          titulo: `MACRO ${primeiraProva.ano}`,
          badge: 'UEA',
          badgeColor: BADGE_COLORS.UEA,
          items: []
        };
        
        // DIA 1 (CG)
        const dia1 = provasGrupo.find(p => p.subcategoria === 'CG');
        if (dia1) {
          card.items.push({
            label: 'DIA 1',
            prova: dia1.url_prova ? dia1 : undefined,
            gabarito: dia1.url_gabarito ? dia1 : undefined
          });
        }
        
        // Linha pontilhada se houver DIA 1 e áreas
        if (dia1 && provasGrupo.some(p => p.area)) {
          card.items.push({ label: '', isDivider: true });
        }
        
        // Áreas em ordem específica
        ['BIOLÓGICAS', 'HUMANAS', 'EXATAS'].forEach(area => {
          const prova = provasGrupo.find(p => p.area === area);
          if (prova) {
            card.items.push({
              label: area.charAt(0) + area.slice(1).toLowerCase(),
              prova: prova.url_prova ? prova : undefined,
              gabarito: prova.url_gabarito ? prova : undefined
            });
          }
        });
        
        // Fallback se não encontrar nada
        if (card.items.length === 0) {
          provasGrupo.forEach((prova) => {
            card.items.push({
              label: prova.titulo || prova.area || prova.subcategoria || 'MACRO',
              prova: prova.url_prova ? prova : undefined,
              gabarito: prova.url_gabarito ? prova : undefined
            });
          });
        }
        
        gruposCards.push(card);
      }
      
      // PSS Card
      else if (tipo === 'PSS') {
        const card: GrupoCard = {
          key: chave,
          instituicao: primeiraProva.instituicao,
          tipo_prova: tipo,
          ano: primeiraProva.ano,
          titulo: `PSS ${primeiraProva.ano}`,
          badge: 'UFRR',
          badgeColor: BADGE_COLORS.UFRR,
          items: []
        };
        
        ['1', '2'].forEach(num => {
          const prova = provasGrupo.find(p => p.subcategoria === num);
          if (prova) {
            card.items.push({
              label: `PSS ${num}`,
              prova: prova.url_prova ? prova : undefined,
              gabarito: prova.url_gabarito ? prova : undefined
            });
          }
        });
        
        // PSS 3 | VEST
        const pss3 = provasGrupo.find(p => p.subcategoria === '3');
        if (pss3) {
          card.items.push({
            label: 'PSS 3 | VEST',
            prova: pss3.url_prova ? pss3 : undefined,
            gabarito: pss3.url_gabarito ? pss3 : undefined
          });
        }
        
        // Fallback se não encontrar subcategorias esperadas
        if (card.items.length === 0) {
          provasGrupo.forEach((prova) => {
            card.items.push({
              label: prova.titulo || prova.subcategoria || 'PSS',
              prova: prova.url_prova ? prova : undefined,
              gabarito: prova.url_gabarito ? prova : undefined
            });
          });
        }
        
        gruposCards.push(card);
      }
      
      // UERR Card
      else if (tipo === 'UERR') {
        const card: GrupoCard = {
          key: chave,
          instituicao: primeiraProva.instituicao,
          tipo_prova: tipo,
          ano: primeiraProva.ano,
          titulo: `UERR ${primeiraProva.ano}`,
          badge: 'UERR',
          badgeColor: BADGE_COLORS.UERR,
          items: []
        };
        
        provasGrupo.forEach(prova => {
          card.items.push({
            label: prova.subcategoria || 'FASE ÚNICA',
            prova: prova.url_prova ? prova : undefined,
            gabarito: prova.url_gabarito ? prova : undefined
          });
        });
        
        gruposCards.push(card);
      }
      
      // ENEM Card (pode ter REGULAR e PPL)
      else if (tipo === 'ENEM') {
        const card: GrupoCard = {
          key: chave,
          instituicao: 'ENEM',
          tipo_prova: tipo,
          ano: primeiraProva.ano,
          titulo: `REGULAR ${primeiraProva.ano}`,
          badge: 'ENEM',
          badgeColor: BADGE_COLORS.ENEM,
          items: []
        };
        
        // REGULAR DIA 1 e 2
        ['DIA 1', 'DIA 2'].forEach(dia => {
          const prova = provasGrupo.find(p => p.subcategoria === dia && !p.subtitulo?.includes('PPL'));
          if (prova) {
            card.items.push({
              label: dia,
              prova: prova.url_prova ? prova : undefined,
              gabarito: prova.url_gabarito ? prova : undefined
            });
          }
        });
        
        // Verificar se tem PPL
        const temPPL = provasGrupo.some(p => p.subtitulo?.includes('PPL'));
        if (temPPL) {
          // Linha pontilhada entre REGULAR e PPL
          card.items.push({ label: '', isDivider: true });
          card.items.push({ label: `PPL ${primeiraProva.ano}`, isSubtitle: true });
          
          ['DIA 1', 'DIA 2'].forEach(dia => {
            const prova = provasGrupo.find(p => p.subcategoria === dia && p.subtitulo?.includes('PPL'));
            if (prova) {
              card.items.push({
                label: dia,
                prova: prova.url_prova ? prova : undefined,
                gabarito: prova.url_gabarito ? prova : undefined
              });
            }
          });
        }
        
        gruposCards.push(card);
      }
      
      // OUTROS Card
      else {
        const card: GrupoCard = {
          key: chave,
          instituicao: primeiraProva.instituicao,
          tipo_prova: 'OUTROS',
          ano: primeiraProva.ano,
          titulo: `${primeiraProva.instituicao} ${primeiraProva.ano}`,
          badge: 'OUTROS',
          badgeColor: BADGE_COLORS.OUTROS,
          items: []
        };
        
        provasGrupo.forEach(prova => {
          card.items.push({
            label: prova.subtitulo || prova.titulo,
            prova: prova.url_prova ? prova : undefined,
            gabarito: prova.url_gabarito ? prova : undefined
          });
        });
        
        gruposCards.push(card);
      }
    });

    // Ordenar: ano decrescente, depois por tipo
    return gruposCards.sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano;
      
      const ordem = ['PSC', 'PSI', 'SIS', 'MACRO', 'PSS', 'UERR', 'ENEM', 'OUTROS'];
      return ordem.indexOf(a.tipo_prova) - ordem.indexOf(b.tipo_prova);
    });
  };

  // Filtrar grupos
  const gruposFiltrados = useMemo(() => {
    if (filtro === 'TUDO') return grupos;
    return grupos.filter(g => g.tipo_prova === filtro);
  }, [grupos, filtro]);

  // Contadores para filtros
  const contadores = useMemo(() => {
    const cont: Record<string, number> = {
      TUDO: grupos.length,
      SIS: grupos.filter(g => g.tipo_prova === 'SIS').length,
      MACRO: grupos.filter(g => g.tipo_prova === 'MACRO').length,
      PSC: grupos.filter(g => g.tipo_prova === 'PSC').length,
      PSI: grupos.filter(g => g.tipo_prova === 'PSI').length,
      PSS: grupos.filter(g => g.tipo_prova === 'PSS').length,
      UERR: grupos.filter(g => g.tipo_prova === 'UERR').length,
      ENEM: grupos.filter(g => g.tipo_prova === 'ENEM').length,
      OUTROS: grupos.filter(g => g.tipo_prova === 'OUTROS').length
    };
    return cont;
  }, [grupos]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-500 to-green-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Banco de Provas Entropia
          </h1>
          <p className="text-xl md:text-2xl">
            Acesse gratuitamente milhares de questões dos principais vestibulares do Amazonas
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-wrap gap-2">
            {[
              'TUDO', 'SIS', 'MACRO', 'PSC', 'PSI', 'PSS', 'UERR', 'ENEM', 'OUTROS'
            ].map(tipo => (
              <button
                key={tipo}
                onClick={() => setFiltro(tipo)}
                className={`px-4 py-2 rounded-full transition-colors font-medium ${
                  filtro === tipo
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tipo} ({contadores[tipo] || 0})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : gruposFiltrados.length > 0 ? (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {filtro === 'TUDO' 
                    ? `${gruposFiltrados.length} grupos de provas disponíveis`
                    : `${gruposFiltrados.length} grupos de provas - ${filtro}`
                  }
                </h2>
                <p className="text-gray-600">
                  Clique em PROVA para ver a prova ou GAB para o gabarito
                </p>
              </div>
              
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                <AnimatePresence>
                  {gruposFiltrados.map((grupo) => (
                    <ProvaCard key={grupo.key} grupo={grupo} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          ) : (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhuma prova encontrada
              </h3>
              <p className="text-gray-500">
                Tente selecionar outro filtro ou aguarde enquanto adicionamos mais conteúdo
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
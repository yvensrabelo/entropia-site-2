'use client';

import { useEffect, useState } from 'react';
import { FileText, Download, GraduationCap, BookOpen, Brain, Sparkles, FileX } from 'lucide-react';
import { supabase } from '@/lib/supabase-singleton';
import { Prova } from '@/lib/types/prova';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos de filtros disponíveis
const FILTER_TYPES = [
  {
    id: 'PSC',
    name: 'PSC',
    icon: GraduationCap,
    gradient: 'from-emerald-400 to-green-600',
    bgGradient: 'from-emerald-500/20 to-green-600/20',
    count: 0
  },
  {
    id: 'SIS',
    name: 'SIS',
    icon: BookOpen,
    gradient: 'from-green-400 to-teal-600',
    bgGradient: 'from-green-500/20 to-teal-600/20',
    count: 0
  },
  {
    id: 'MACRO',
    name: 'MACRO',
    icon: Brain,
    gradient: 'from-teal-400 to-cyan-600',
    bgGradient: 'from-teal-500/20 to-cyan-600/20',
    count: 0
  },
  {
    id: 'ENEM',
    name: 'ENEM',
    icon: FileText,
    gradient: 'from-cyan-400 to-blue-600',
    bgGradient: 'from-cyan-500/20 to-blue-600/20',
    count: 0
  },
  {
    id: 'PSI',
    name: 'PSI',
    icon: Sparkles,
    gradient: 'from-purple-400 to-pink-600',
    bgGradient: 'from-purple-500/20 to-pink-600/20',
    count: 0
  },
  {
    id: 'UERR',
    name: 'UERR',
    icon: GraduationCap,
    gradient: 'from-orange-400 to-red-600',
    bgGradient: 'from-orange-500/20 to-red-600/20',
    count: 0
  },
  {
    id: 'UFRR',
    name: 'UFRR',
    icon: BookOpen,
    gradient: 'from-indigo-400 to-purple-600',
    bgGradient: 'from-indigo-500/20 to-purple-600/20',
    count: 0
  }
];

export default function BancoDeProvasPage() {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [filterCounts, setFilterCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchProvas();
  }, []);

  const fetchProvas = async () => {
    try {
      console.log('🔍 Iniciando busca de provas...');
      
      if (!supabase) {
        console.error('❌ Supabase não configurado');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('provas')
        .select('*')
        .order('ano', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }
      
      console.log('✅ Provas encontradas:', data?.length || 0);
      console.log('📋 Dados das provas:', data);
      
      // Contar provas por tipo
      const counts: Record<string, number> = {};
      data?.forEach(prova => {
        if (prova.tipo_prova) {
          counts[prova.tipo_prova] = (counts[prova.tipo_prova] || 0) + 1;
        }
      });
      
      console.log('📊 Contagem por tipo:', counts);
      
      // Se não houver dados, usar dados de exemplo
      if (!data || data.length === 0) {
        console.log('⚠️ Nenhuma prova encontrada, usando dados de exemplo');
        const exemploProvas = [
          { id: 1, titulo: 'PSC 2024 - 1ª Etapa', tipo_prova: 'PSC', ano: 2024, etapa: '1ª Etapa', instituicao: 'UFAM', url_pdf: '#' },
          { id: 2, titulo: 'PSC 2024 - 2ª Etapa', tipo_prova: 'PSC', ano: 2024, etapa: '2ª Etapa', instituicao: 'UFAM', url_pdf: '#' },
          { id: 3, titulo: 'SIS 2024 - Regular', tipo_prova: 'SIS', ano: 2024, etapa: 'Regular', instituicao: 'UEA', url_pdf: '#' },
          { id: 4, titulo: 'MACRO 2024', tipo_prova: 'MACRO', ano: 2024, etapa: 'Única', instituicao: 'UEA', url_pdf: '#' },
          { id: 5, titulo: 'ENEM 2023', tipo_prova: 'ENEM', ano: 2023, etapa: 'Regular', instituicao: 'INEP', url_pdf: '#' },
        ];
        
        const exemploCounts: Record<string, number> = {};
        exemploProvas.forEach(prova => {
          if (prova.tipo_prova) {
            exemploCounts[prova.tipo_prova] = (exemploCounts[prova.tipo_prova] || 0) + 1;
          }
        });
        
        setFilterCounts(exemploCounts);
        setProvas(exemploProvas as any);
      } else {
        setFilterCounts(counts);
        setProvas(data);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar provas:', error);
      // Mesmo com erro, vamos mostrar algo para o usuário
      setProvas([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar provas baseado no filtro ativo
  const filteredProvas = activeFilter 
    ? provas.filter(prova => prova.tipo_prova === activeFilter)
    : provas;
  
  // Debug log
  console.log('🎯 Filtro ativo:', activeFilter);
  console.log('📚 Total de provas:', provas.length);
  console.log('🔍 Provas filtradas:', filteredProvas.length);

  // Atualizar contadores nos filtros
  const filtersWithCounts = FILTER_TYPES.map(filter => ({
    ...filter,
    count: filterCounts[filter.id] || 0
  }));

  const totalProvas = Object.values(filterCounts).reduce((a, b) => a + b, 0);
  const totalTypes = Object.keys(filterCounts).length;

  // Debug - remova após funcionar
  useEffect(() => {
    console.log('🔍 Estado atual:');
    console.log('- Loading:', loading);
    console.log('- Provas:', provas);
    console.log('- Provas Filtradas:', filteredProvas);
    console.log('- Filtro Ativo:', activeFilter);
    if (provas.length > 0) {
      console.log('📋 Estrutura da primeira prova:', provas[0]);
    }
  }, [loading, provas, filteredProvas, activeFilter]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section Ultra Compacta */}
      <section className="relative h-[25vh] md:h-[30vh] overflow-hidden">
        {/* Background com gradiente verde vibrante */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600">
          {/* Padrão geométrico */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(30deg, transparent 49%, rgba(255,255,255,0.1) 50%, transparent 51%),
                linear-gradient(-30deg, transparent 49%, rgba(255,255,255,0.1) 50%, transparent 51%)
              `,
              backgroundSize: '20px 20px'
            }} />
          </div>
          
          {/* Efeito de luz */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl transform translate-x-48 -translate-y-48" />
        </div>
        
        {/* Conteúdo minimalista */}
        <div className="relative z-10 flex flex-col justify-center h-full px-6 max-w-7xl mx-auto text-white">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-black mb-2 text-white drop-shadow-2xl"
            style={{
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 0, 0, 0.2)'
            }}
          >
            Banco de Provas
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-6 text-sm md:text-base"
          >
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black">{totalProvas}</span>
              <span className="opacity-80">provas</span>
            </div>
            <div className="w-px h-8 bg-white/30" />
            <div className="flex items-center gap-2">
              <span className="text-4xl font-black">{totalTypes}</span>
              <span className="opacity-80">vestibulares</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sistema de Filtros Inovador */}
      <section className="px-6 -mt-8 relative z-20 mb-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {filtersWithCounts.map((filter, index) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            
            return (
              <motion.button
                key={filter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveFilter(isActive ? null : filter.id)}
                className={`
                  min-w-[140px] backdrop-blur-xl rounded-2xl p-4 shadow-xl border group transition-all
                  ${isActive 
                    ? 'bg-gradient-to-br ' + filter.gradient + ' text-white border-white/50' 
                    : 'bg-white/90 border-white/50 hover:border-emerald-200'
                  }
                `}
              >
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all
                    ${isActive 
                      ? 'bg-white/20' 
                      : 'bg-gradient-to-br ' + filter.gradient + ' group-hover:shadow-lg'
                    }
                  `}>
                    <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white'}`} />
                  </div>
                  <span className={`font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>
                    {filter.name}
                  </span>
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                    {filter.count} provas
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Grid de Provas com Design Premium */}
      <section className="px-6 pb-20 max-w-7xl mx-auto">
        {/* Título da seção */}
        {filteredProvas.length > 0 && (
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-800 dark:text-white mb-6"
          >
            {activeFilter 
              ? `Provas de ${activeFilter} (${filteredProvas.length})`
              : `Todas as Provas (${filteredProvas.length})`
            }
          </motion.h2>
        )}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4"
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl" />
                  <div className="relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="w-14 h-14 bg-gray-200 rounded-2xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filteredProvas.length > 0 ? (
            <motion.div 
              className="grid gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {filteredProvas.map((prova, index) => {
                // Debug para cada prova
                console.log(`Renderizando prova ${index}:`, prova);
                
                return (
                <motion.div
                  key={prova.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ y: -4 }}
                  className="relative group"
                >
                  {/* Glow effect on hover */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-r rounded-2xl blur-xl opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300
                    ${prova.tipo_prova === 'PSC' ? 'from-emerald-500/20 to-green-500/20' : 
                      prova.tipo_prova === 'SIS' ? 'from-green-500/20 to-teal-500/20' :
                      prova.tipo_prova === 'MACRO' ? 'from-teal-500/20 to-cyan-500/20' :
                      prova.tipo_prova === 'ENEM' ? 'from-cyan-500/20 to-blue-500/20' :
                      prova.tipo_prova === 'PSI' ? 'from-purple-500/20 to-pink-500/20' :
                      prova.tipo_prova === 'UERR' ? 'from-orange-500/20 to-red-500/20' :
                      prova.tipo_prova === 'UFRR' ? 'from-indigo-500/20 to-purple-500/20' :
                      'from-gray-500/20 to-gray-600/20'
                    }
                  `} />
                  
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                    {/* Decorative gradient line */}
                    <div className={`
                      absolute top-0 left-0 right-0 h-1 bg-gradient-to-r
                      ${prova.tipo_prova === 'PSC' ? 'from-emerald-400 to-green-600' : 
                        prova.tipo_prova === 'SIS' ? 'from-green-400 to-teal-600' :
                        prova.tipo_prova === 'MACRO' ? 'from-teal-400 to-cyan-600' :
                        prova.tipo_prova === 'ENEM' ? 'from-cyan-400 to-blue-600' :
                        prova.tipo_prova === 'PSI' ? 'from-purple-400 to-pink-600' :
                        prova.tipo_prova === 'UERR' ? 'from-orange-400 to-red-600' :
                        prova.tipo_prova === 'UFRR' ? 'from-indigo-400 to-purple-600' :
                        'from-gray-400 to-gray-600'
                      }
                    `} />
                    
                    {/* Badge do tipo no canto */}
                    <div className="absolute top-4 right-4">
                      <span className={`
                        px-3 py-1 text-white text-xs font-bold rounded-full bg-gradient-to-r
                        ${prova.tipo_prova === 'PSC' ? 'from-emerald-500 to-green-600' : 
                          prova.tipo_prova === 'SIS' ? 'from-green-500 to-teal-600' :
                          prova.tipo_prova === 'MACRO' ? 'from-teal-500 to-cyan-600' :
                          prova.tipo_prova === 'ENEM' ? 'from-cyan-500 to-blue-600' :
                          prova.tipo_prova === 'PSI' ? 'from-purple-500 to-pink-600' :
                          prova.tipo_prova === 'UERR' ? 'from-orange-500 to-red-600' :
                          prova.tipo_prova === 'UFRR' ? 'from-indigo-500 to-purple-600' :
                          'from-gray-500 to-gray-600'
                        }
                      `}>
                        {prova.tipo_prova}
                      </span>
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                          {prova.titulo}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span>{prova.ano}</span>
                          {prova.etapa && (
                            <>
                              <span>•</span>
                              <span>{prova.etapa}</span>
                            </>
                          )}
                          {prova.instituicao && (
                            <>
                              <span>•</span>
                              <span>{prova.instituicao}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Botões de ação */}
                      <div className="flex gap-2">
                        {prova.url_pdf && !prova.is_gabarito && (
                          <motion.a
                            href={prova.url_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            className={`
                              w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg
                              bg-gradient-to-br
                              ${prova.tipo_prova === 'PSC' ? 'from-emerald-400 to-green-600' : 
                                prova.tipo_prova === 'SIS' ? 'from-green-400 to-teal-600' :
                                prova.tipo_prova === 'MACRO' ? 'from-teal-400 to-cyan-600' :
                                prova.tipo_prova === 'ENEM' ? 'from-cyan-400 to-blue-600' :
                                prova.tipo_prova === 'PSI' ? 'from-purple-400 to-pink-600' :
                                prova.tipo_prova === 'UERR' ? 'from-orange-400 to-red-600' :
                                prova.tipo_prova === 'UFRR' ? 'from-indigo-400 to-purple-600' :
                                'from-gray-400 to-gray-600'
                              }
                            `}
                          >
                            <Download className="w-6 h-6 text-white" />
                          </motion.a>
                        )}
                        
                        {(prova.url_gabarito || (prova.is_gabarito && prova.url_pdf)) && (
                          <motion.a
                            href={prova.url_gabarito || prova.url_pdf || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg"
                          >
                            <Sparkles className="w-6 h-6 text-white" />
                          </motion.a>
                        )}
                      </div>
                    </div>
                    
                    {/* Visualizações - opcional */}
                    {prova.visualizacoes && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-xs text-gray-400">
                          {prova.visualizacoes} visualizações
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-full mb-4">
                <FileText className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                Nenhuma prova encontrada
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {activeFilter 
                  ? `Ainda não temos provas de ${activeFilter} disponíveis.`
                  : 'Estamos preparando as provas para você!'
                }
              </p>
              {activeFilter && (
                <button
                  onClick={() => setActiveFilter(null)}
                  className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Limpar filtro
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Debug - Renderização simplificada para teste */}
        {!loading && filteredProvas.length > 0 && (
          <div className="mt-8 p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
            <h3 className="font-bold mb-2">DEBUG - Provas carregadas:</h3>
            <div className="text-sm">
              {filteredProvas.slice(0, 5).map((prova, index) => (
                <div key={prova.id || index} className="mb-1">
                  {index + 1}. {prova.titulo || prova.nome || `Prova ID: ${prova.id}`} - {prova.tipo_prova || 'Sem tipo'}
                </div>
              ))}
              {filteredProvas.length > 5 && (
                <div>... e mais {filteredProvas.length - 5} provas</div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
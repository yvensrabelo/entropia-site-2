'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import { SUBCATEGORIAS } from '@/lib/types/prova';

interface FiltroAtivo {
  tipo: string | null;
  subcategoria: string | null;
  area: string | null;
}

interface FiltrosModernosProps {
  contadorProvas: Record<string, number>;
  onFiltroChange: (tipo: string | null, subcategoria?: string | null, area?: string | null) => void;
  filtroAtivo: FiltroAtivo;
}

export default function FiltrosModernos({ contadorProvas, onFiltroChange, filtroAtivo }: FiltrosModernosProps) {
  const [tipoExpandido, setTipoExpandido] = useState<string | null>(null);

  const tipos = [
    { key: 'PSC', label: 'PSC', hasSubcategorias: true },
    { key: 'SIS', label: 'SIS', hasSubcategorias: true },
    { key: 'MACRO', label: 'MACRO', hasSubcategorias: true },
    { key: 'ENEM', label: 'ENEM', hasSubcategorias: false },
    { key: 'PSI', label: 'PSI', hasSubcategorias: false },
    { key: 'UERR', label: 'UERR', hasSubcategorias: false },
    { key: 'UFRR', label: 'UFRR', hasSubcategorias: true }
  ];

  const handleTipoClick = (tipo: string) => {
    const tipoInfo = tipos.find(t => t.key === tipo);
    
    if (filtroAtivo.tipo === tipo && !tipoInfo?.hasSubcategorias) {
      // Desselecionar se já está selecionado e não tem subcategorias
      onFiltroChange(null);
      setTipoExpandido(null);
    } else {
      // Selecionar novo tipo
      onFiltroChange(tipo);
      
      // Expandir/contrair subcategorias
      if (tipoInfo?.hasSubcategorias) {
        setTipoExpandido(tipoExpandido === tipo ? null : tipo);
      } else {
        setTipoExpandido(null);
      }
    }
  };

  const handleSubcategoriaClick = (tipo: string, subcategoria: string) => {
    if (filtroAtivo.tipo === tipo && filtroAtivo.subcategoria === subcategoria) {
      // Desselecionar subcategoria
      onFiltroChange(tipo);
    } else {
      // Selecionar subcategoria
      onFiltroChange(tipo, subcategoria);
    }
  };

  const limparFiltros = () => {
    onFiltroChange(null);
    setTipoExpandido(null);
  };

  const temFiltrosAtivos = filtroAtivo.tipo !== null;

  // Contar total de provas filtradas
  const totalFiltrado = filtroAtivo.tipo ? (contadorProvas[filtroAtivo.tipo] || 0) : 0;

  return (
    <div className="space-y-4 bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Filtrar por tipo de prova</h3>
      
      {/* Botões principais */}
      <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-start">
        {tipos.map((tipo) => {
          const count = contadorProvas[tipo.key] || 0;
          const isDisabled = count === 0;
          const isSelected = filtroAtivo.tipo === tipo.key;
          const isExpanded = tipoExpandido === tipo.key;

          return (
            <motion.button
              key={tipo.key}
              onClick={() => !isDisabled && handleTipoClick(tipo.key)}
              disabled={isDisabled}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              className={`
                relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium text-sm transition-all duration-200 min-w-[100px]
                ${isDisabled 
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed opacity-60 border border-gray-200' 
                  : isSelected
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md border border-green-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm border border-gray-300'
                }
              `}
            >
              <span className="flex items-center gap-2">
                {tipo.label}
                <span className={`
                  inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 rounded-full text-xs font-bold
                  ${isSelected ? 'bg-green-700/20 text-white' : isDisabled ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-600'}
                `}>
                  {count}
                </span>
                {isDisabled && <Lock className="w-3.5 h-3.5 ml-1" />}
                {isSelected && tipo.hasSubcategorias && (
                  <motion.svg
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                )}
              </span>
            </motion.button>
          );
        })}

      </div>

      {/* Subcategorias */}
      <AnimatePresence>
        {tipoExpandido && SUBCATEGORIAS[tipoExpandido] && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 pl-4 sm:pl-8 pt-2 pb-1 border-l-4 border-green-200">
              {SUBCATEGORIAS[tipoExpandido].map((sub, index) => {
                const isSubSelected = filtroAtivo.subcategoria === sub;
                
                return (
                  <motion.button
                    key={sub}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSubcategoriaClick(tipoExpandido, sub)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 min-w-[80px]
                      ${isSubSelected
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-400 shadow-sm'
                        : 'bg-white text-gray-600 border border-gray-300 hover:border-green-400 hover:bg-green-50'
                      }
                    `}
                  >
                    {sub}
                  </motion.button>
                );
              })}
              
              {/* Mensagem especial para MACRO */}
              {tipoExpandido === 'MACRO' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-full mt-2 text-xs text-gray-500 italic"
                >
                  DIA 2 inclui áreas: Biológicas, Humanas e Exatas
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contador de resultados */}
      <AnimatePresence>
        {temFiltrosAtivos && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100"
          >
            <span className="text-sm font-medium text-gray-600">Filtros ativos:</span>
            <div className="flex items-center gap-2 flex-1">
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-gradient-to-r from-green-100 to-green-200 text-green-800 rounded-full text-xs font-semibold border border-green-300"
              >
                {filtroAtivo.tipo}
                {filtroAtivo.subcategoria && ` → ${filtroAtivo.subcategoria}`}
              </motion.span>
              {totalFiltrado > 0 && (
                <span className="text-sm text-gray-500 font-medium">
                  {totalFiltrado} {totalFiltrado === 1 ? 'resultado' : 'resultados'}
                </span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={limparFiltros}
              className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-all duration-200 flex items-center gap-1 border border-red-200"
            >
              <X className="w-3 h-3" />
              Limpar
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
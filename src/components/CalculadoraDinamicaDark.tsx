'use client'

import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  School, 
  Users, 
  User,
  Heart,
  TreePine,
  Home,
  DollarSign,
  CheckCircle,
  XCircle,
  TrendingUp,
  Target,
  Lock
} from 'lucide-react';
import { 
  PROCESSOS, 
  CURSOS, 
  COTAS_POR_PROCESSO, 
  CAMPOS_POR_PROCESSO,
  NOTAS_DE_CORTE,
  DESCRICOES_COTA
} from '@/data/vestibular-data';
import notasDeCorte from '@/data/notas-corte-psc-2024.json';
import notasCorteMacro from '@/data/notas-corte-macro-2025.json';
import notasCorteSis from '@/data/notas-corte-sis-2025.json';

type Processo = typeof PROCESSOS[number];
type Curso = typeof CURSOS[number];

// Mapeamento entre nomes de cotas do código e do JSON MACRO
const cotasMacroMapping: Record<string, string> = {
  'Interior AM': 'Estudantes do Interior Amazonas',
  'Portador de Diploma': 'Portador de Diploma Brasil',
  'PCD AM': 'Pessoas com Deficiência (PCD) Amazonas',
  'PCD': 'Pessoas com Deficiência (PCD) Brasil',
  'Pessoas Indígenas AM': 'Pessoas Indígenas Amazonas',
  'Pessoas Indígenas': 'Pessoas Indígenas Brasil',
  'Pessoas Pretas AM': 'Pessoas Pretas Amazonas',
  'Pessoas Pretas': 'Pessoas Pretas Brasil',
  'Escola Pública AM': 'Estudantes de Escola Pública Amazonas',
  'Escola Pública Brasil': 'Estudantes de Escola Pública Brasil',
  'Qualquer Natureza AM': 'Estudantes de Escola de Qualquer Natureza Amazonas',
  'Qualquer Natureza Brasil': 'Estudantes de Escola de Qualquer Natureza Brasil'
};

// Componente principal dark theme
export default function CalculadoraDinamicaDark() {
  const [processoSelecionado, setProcessoSelecionado] = useState<Processo>('PSC');
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [cotaSelecionada, setCotaSelecionada] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Reset ao mudar de processo
  useEffect(() => {
    setNotas({});
    setCotaSelecionada('');
  }, [processoSelecionado]);

  // Cálculo da nota final
  const notaFinal = useMemo(() => {
    if (processoSelecionado === 'ENEM') {
      const valores = Object.values(notas).map(n => parseFloat(n) || 0);
      if (valores.length === 5) {
        return valores.reduce((a, b) => a + b, 0) / 5;
      }
    } else if (processoSelecionado === 'SIS') {
      const etapa1 = (parseFloat(notas['Conhecimentos Gerais 1'] || '0') * 2) +
                     (parseFloat(notas['Conhecimentos Específicos 1'] || '0') * 1.5) +
                     (parseFloat(notas['Redação 1'] || '0') * 0.5);
      const etapa2 = (parseFloat(notas['Conhecimentos Gerais 2'] || '0') * 2) +
                     (parseFloat(notas['Conhecimentos Específicos 2'] || '0') * 1.5) +
                     (parseFloat(notas['Redação 2'] || '0') * 0.5);
      return etapa1 + etapa2;
    } else {
      return Object.values(notas).reduce((sum, nota) => sum + (parseFloat(nota) || 0), 0);
    }
  }, [notas, processoSelecionado]);

  // Buscar notas de corte
  const getNotaCorte = (curso: string, cota: string) => {
    if (processoSelecionado === 'PSC') {
      const cursoData = (notasDeCorte as any)[curso];
      if (!cursoData) return 0;
      return cursoData[cota] || cursoData['Ampla Concorrência'] || 0;
    } else if (processoSelecionado === 'MACRO') {
      const cotaMapeada = cotasMacroMapping[cota] || cota;
      const cursoData = (notasCorteMacro as any).cursos.find((c: any) => {
        const nomeMatch = c.nome === curso || c.nome.includes(curso) || curso.includes(c.nome);
        return nomeMatch;
      });
      if (!cursoData) return 0;
      const cotaData = cursoData.cotas?.find((c: any) => c.tipo === cotaMapeada);
      return cotaData ? parseFloat(cotaData.notaCorte) : 0;
    } else if (processoSelecionado === 'SIS') {
      const cursoData = (notasCorteSis as any).cursos.find((c: any) => c.nome === curso);
      if (!cursoData) return 0;
      const cotaData = cursoData.cotas?.find((c: any) => c.tipo === cota);
      return cotaData ? parseFloat(cotaData.notaCorte) : 0;
    }
    return 0;
  };

  // Resultados por curso
  const resultadosPorCurso = useMemo(() => {
    if (!cotaSelecionada || Object.keys(notas).length === 0) return [];

    return CURSOS
      .filter(curso => curso.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(curso => {
        const notaCorte = getNotaCorte(curso, cotaSelecionada);
        const diferenca = notaFinal - notaCorte;
        const percentual = (notaFinal / notaCorte) * 100;
        
        return {
          curso,
          notaCorte: notaCorte.toFixed(3),
          diferenca,
          percentual,
          aprovado: notaFinal >= notaCorte
        };
      })
      .sort((a, b) => b.diferenca - a.diferenca);
  }, [cotaSelecionada, notas, notaFinal, searchTerm, processoSelecionado]);

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-light text-white mb-2">
            Calculadora de Notas
          </h1>
          <p className="text-[#68a063] font-mono">
            PSC • MACRO • SIS • ENEM
          </p>
        </motion.div>

        {/* Seletor de Processo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          {PROCESSOS.map((processo) => (
            <button
              key={processo}
              onClick={() => setProcessoSelecionado(processo)}
              className={`p-4 rounded-xl font-mono transition-all ${
                processoSelecionado === processo
                  ? 'bg-[#68a063] text-[#0d0d0d] shadow-[0_0_20px_rgba(104,160,99,0.5)]'
                  : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:border-[#68a063]/50'
              }`}
            >
              {processo}
            </button>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda - Entrada de Dados */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-6"
          >
            <h2 className="text-xl font-light text-white mb-6 flex items-center gap-2">
              <Calculator className="text-[#68a063]" size={20} />
              Insira suas Notas
            </h2>

            {/* Campos de Nota */}
            <div className="space-y-4 mb-6">
              {CAMPOS_POR_PROCESSO[processoSelecionado].map((campo) => (
                <div key={campo}>
                  <label className="block text-gray-400 text-sm mb-2 font-mono">
                    {campo}
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={notas[campo] || ''}
                    onChange={(e) => setNotas(prev => ({
                      ...prev,
                      [campo]: e.target.value
                    }))}
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-[#68a063] focus:outline-none focus:ring-1 focus:ring-[#68a063]/50"
                  />
                </div>
              ))}
            </div>

            {/* Seletor de Cota */}
            <div>
              <label className="block text-gray-400 text-sm mb-2 font-mono">
                Modalidade de Concorrência
              </label>
              <select
                value={cotaSelecionada}
                onChange={(e) => setCotaSelecionada(e.target.value)}
                className="w-full px-4 py-3 bg-[#0d0d0d] border border-gray-800 rounded-lg text-white focus:border-[#68a063] focus:outline-none focus:ring-1 focus:ring-[#68a063]/50"
              >
                <option value="">Selecione uma modalidade</option>
                {COTAS_POR_PROCESSO[processoSelecionado].map((cota) => (
                  <option key={cota} value={cota}>{cota}</option>
                ))}
              </select>
            </div>

            {/* Nota Final */}
            <div className="mt-6 p-4 bg-[#0d0d0d] rounded-xl border border-[#68a063]/30">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-mono">Nota Final:</span>
                <span className="text-2xl font-bold text-[#68a063]">
                  {notaFinal.toFixed(3)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Coluna Direita - Resultados */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-6"
          >
            <h3 className="text-xl font-light text-white mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="text-[#68a063]" size={20} />
                Suas Chances
              </span>
              <span className="text-sm text-gray-500 font-mono">
                {resultadosPorCurso.length} cursos
              </span>
            </h3>

            {/* Campo de pesquisa */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar curso..."
              className="w-full px-4 py-3 mb-4 bg-[#0d0d0d] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-[#68a063] focus:outline-none focus:ring-1 focus:ring-[#68a063]/50"
            />

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {resultadosPorCurso.map((resultado, index) => (
                  <motion.div
                    key={resultado.curso}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-xl border transition-all ${
                      resultado.aprovado 
                        ? 'border-[#68a063]/50 bg-[#68a063]/10' 
                        : 'border-gray-800 bg-[#0d0d0d]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white">{resultado.curso}</h4>
                      {resultado.aprovado ? (
                        <CheckCircle className="text-[#68a063]" size={20} />
                      ) : (
                        <XCircle className="text-red-500/70" size={20} />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Nota de Corte:</span>
                        <p className="font-mono text-gray-300">{resultado.notaCorte}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">
                          {resultado.aprovado ? 'Acima por:' : 'Faltam:'}
                        </span>
                        <p className={`font-mono font-bold ${
                          resultado.aprovado ? 'text-[#68a063]' : 'text-red-500/70'
                        }`}>
                          {Math.abs(resultado.diferenca).toFixed(3)}
                        </p>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="mt-3">
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(resultado.percentual, 100)}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className={`h-full ${
                            resultado.aprovado ? 'bg-[#68a063]' : 'bg-red-500/70'
                          }`}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1 font-mono">
                        {resultado.percentual.toFixed(1)}% da nota necessária
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0d0d0d;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #68a063;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8cc84b;
        }
      `}</style>
    </div>
  );
}
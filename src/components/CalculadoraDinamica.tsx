'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  School, 
  Users, 
  Heart,
  TreePine,
  Home,
  DollarSign,
  CheckCircle,
  XCircle,
  TrendingUp,
  Target
} from 'lucide-react';
import { 
  PROCESSOS, 
  CURSOS, 
  COTAS_POR_PROCESSO, 
  CAMPOS_POR_PROCESSO,
  NOTAS_DE_CORTE,
  DESCRICOES_COTA
} from '@/data/vestibular-data';

type Processo = typeof PROCESSOS[number];
type Curso = typeof CURSOS[number];

interface DadosCotas {
  escolaPublica: boolean;
  baixaRenda: boolean;
  etnia: 'branco' | 'preto' | 'pardo' | 'indigena' | 'amarelo';
  pcd: boolean;
  quilombola: boolean;
}

interface NotasState {
  [key: string]: number;
}

interface ResultadoCurso {
  curso: Curso;
  notaCorte: number;
  diferenca: number;
  aprovado: boolean;
  percentual: number;
}

export default function CalculadoraDinamica() {
  // Estados principais
  const [processoSelecionado, setProcessoSelecionado] = useState<Processo>('PSC');
  const [dadosCotas, setDadosCotas] = useState<DadosCotas>({
    escolaPublica: false,
    baixaRenda: false,
    etnia: 'branco',
    pcd: false,
    quilombola: false,
  });
  const [notas, setNotas] = useState<NotasState>({});
  const [notaTotal, setNotaTotal] = useState(0);
  const [cotaDeterminada, setCotaDeterminada] = useState('AC');

  // Determinar cota automaticamente
  useEffect(() => {
    let novaCota = 'AC';
    
    if (processoSelecionado === 'PSC') {
      if (dadosCotas.escolaPublica) {
        const ppi = ['preto', 'pardo', 'indigena'].includes(dadosCotas.etnia);
        
        if (dadosCotas.pcd) {
          novaCota = dadosCotas.baixaRenda ? 'PCD1' : 'PCD2';
        } else if (dadosCotas.etnia === 'indigena') {
          novaCota = dadosCotas.baixaRenda ? 'IND1' : 'IND2';
        } else if (dadosCotas.quilombola) {
          novaCota = dadosCotas.baixaRenda ? 'QLB1' : 'QLB2';
        } else if (ppi) {
          novaCota = dadosCotas.baixaRenda ? 'PP1' : 'PP2';
        } else {
          novaCota = dadosCotas.baixaRenda ? 'NDC1' : 'NDC2';
        }
      }
    } else if (processoSelecionado === 'MACRO') {
      if (dadosCotas.pcd) {
        novaCota = 'PCD';
      } else if (dadosCotas.etnia === 'indigena') {
        novaCota = 'Indígenas';
      } else if (['preto', 'pardo'].includes(dadosCotas.etnia)) {
        novaCota = 'Negros';
      } else if (dadosCotas.escolaPublica) {
        novaCota = 'Escola Pública';
      }
    } else if (processoSelecionado === 'SIS' || processoSelecionado === 'ENEM') {
      if (dadosCotas.pcd) {
        novaCota = 'PCD';
      } else if (['preto', 'pardo', 'indigena'].includes(dadosCotas.etnia)) {
        novaCota = 'PPI';
      } else if (dadosCotas.escolaPublica) {
        novaCota = 'Escola Pública';
      }
    }
    
    setCotaDeterminada(novaCota);
  }, [processoSelecionado, dadosCotas]);

  // Calcular nota total
  useEffect(() => {
    let total = 0;
    
    if (processoSelecionado === 'PSC') {
      // Cálculo direto do PSC sem divisão por 54 ou multiplicação por 10
      const acertosPSC1 = parseFloat(String(notas['PSC 1'])) || 0;
      const acertosPSC2 = parseFloat(String(notas['PSC 2'])) || 0;
      const acertosPSC3 = parseFloat(String(notas['PSC 3'])) || 0;
      const notaRedacao = parseFloat(String(notas['Redação'])) || 0;
      
      // Fórmula: soma dos acertos multiplicados por 3 mais redação multiplicada por 6
      const notaFinal = (acertosPSC1 * 3) + (acertosPSC2 * 3) + (acertosPSC3 * 3) + (notaRedacao * 6);
      total = notaFinal;
    } else if (processoSelecionado === 'MACRO') {
      total = (notas['Conhecimentos Gerais'] || 0) * 3 + 
               (notas['Conhecimentos Específicos'] || 0) * 4 + 
               (notas['Redação'] || 0) * 3;
    } else if (processoSelecionado === 'SIS') {
      total = (notas['SIS 1'] || 0) * 10 + 
               (notas['SIS 2'] || 0) * 10 + 
               (notas['Redação SIS 2'] || 0) * 50 + 
               (notas['SIS 3'] || 0) * 10 + 
               (notas['Redação SIS 3'] || 0) * 50;
    } else if (processoSelecionado === 'ENEM') {
      const somaNotas = Object.values(notas).reduce((acc, nota) => acc + (nota || 0), 0);
      const camposPreenchidos = Object.values(notas).filter(nota => nota > 0).length;
      total = camposPreenchidos > 0 ? Math.round(somaNotas / camposPreenchidos) : 0;
    }
    
    setNotaTotal(total);
  }, [notas, processoSelecionado]);

  // Calcular resultados para todos os cursos
  const resultadosPorCurso = useMemo((): ResultadoCurso[] => {
    return CURSOS.map(curso => {
      const notaCorte = NOTAS_DE_CORTE[processoSelecionado]?.[cotaDeterminada]?.[curso] || 0;
      const diferenca = notaTotal - notaCorte;
      const aprovado = notaTotal >= notaCorte;
      const percentual = notaCorte > 0 ? ((notaTotal / notaCorte) * 100) : 0;
      
      return {
        curso,
        notaCorte,
        diferenca,
        aprovado,
        percentual
      };
    }).sort((a, b) => b.diferenca - a.diferenca); // Ordenar por mais próximo de passar
  }, [processoSelecionado, cotaDeterminada, notaTotal]);

  const handleNotaChange = (campo: string, valor: string) => {
    const numero = parseFloat(valor) || 0;
    setNotas(prev => ({ ...prev, [campo]: numero }));
  };

  const camposNota = CAMPOS_POR_PROCESSO[processoSelecionado];

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
          Calculadora <span className="text-green-600">Dinâmica</span> de Aprovação
        </h1>
        <p className="text-lg text-gray-600">
          Veja suas chances em tempo real para todos os cursos
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Coluna Esquerda - Inputs */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-xl p-4 sm:p-6"
        >
          {/* Seleção de Processo */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Processo Seletivo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PROCESSOS.map(processo => (
                <button
                  key={processo}
                  onClick={() => {
                    setProcessoSelecionado(processo);
                    setNotas({});
                  }}
                  className={`min-h-[48px] py-3 px-4 rounded-xl font-medium transition-all w-full ${
                    processoSelecionado === processo
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {processo}
                </button>
              ))}
            </div>
          </div>

          {/* Dados para Cotas */}
          <div className="mb-6 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-green-600" />
              Informações para Determinação de Cota
            </h3>

            {/* Escola Pública */}
            <label className="flex items-center gap-3 p-4 min-h-[56px] bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={dadosCotas.escolaPublica}
                onChange={(e) => setDadosCotas(prev => ({ ...prev, escolaPublica: e.target.checked }))}
                className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
              />
              <School size={20} className="text-gray-600" />
              <span className="flex-1 text-gray-700">
                Cursei todo o ensino médio em escola pública
              </span>
            </label>

            {/* Baixa Renda - só aparece se escola pública */}
            {dadosCotas.escolaPublica && processoSelecionado === 'PSC' && (
              <motion.label
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 min-h-[56px] bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ml-4 sm:ml-8"
              >
                <input
                  type="checkbox"
                  checked={dadosCotas.baixaRenda}
                  onChange={(e) => setDadosCotas(prev => ({ ...prev, baixaRenda: e.target.checked }))}
                  className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
                <DollarSign size={20} className="text-gray-600" />
                <span className="flex-1 text-gray-700 text-sm sm:text-base">
                  Renda familiar per capita até 1,5 salário mínimo
                </span>
              </motion.label>
            )}

            {/* Etnia */}
            <div>
              <label className="block text-base font-medium text-gray-800 mb-2">
                Como você se declara?
              </label>
              <select
                value={dadosCotas.etnia}
                onChange={(e) => setDadosCotas(prev => ({ ...prev, etnia: e.target.value as any }))}
                className="w-full px-4 py-3 min-h-[48px] border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-0 transition-colors text-base"
              >
                <option value="branco">Branco(a)</option>
                <option value="preto">Preto(a)</option>
                <option value="pardo">Pardo(a)</option>
                <option value="indigena">Indígena</option>
                <option value="amarelo">Amarelo(a)</option>
              </select>
            </div>

            {/* Outras condições */}
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-4 min-h-[56px] bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={dadosCotas.pcd}
                  onChange={(e) => setDadosCotas(prev => ({ ...prev, pcd: e.target.checked }))}
                  className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
                <Heart size={20} className="text-gray-600" />
                <span className="flex-1 text-gray-700">
                  Pessoa com deficiência (PCD)
                </span>
              </label>

              {processoSelecionado === 'PSC' && (
                <label className="flex items-center gap-3 p-4 min-h-[56px] bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={dadosCotas.quilombola}
                    onChange={(e) => setDadosCotas(prev => ({ ...prev, quilombola: e.target.checked }))}
                    className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <Home size={20} className="text-gray-600" />
                  <span className="flex-1 text-gray-700">
                    Quilombola
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Cota Determinada */}
          <motion.div
            key={cotaDeterminada}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
          >
            <div className="flex items-center gap-3">
              <Target className="text-green-600" size={24} />
              <div>
                <p className="font-semibold text-green-800">
                  Sua cota: {cotaDeterminada}
                </p>
                <p className="text-sm text-green-600">
                  {DESCRICOES_COTA[cotaDeterminada]}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Campos de Notas */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calculator size={20} className="text-green-600" />
              Insira suas Notas
            </h3>
            {camposNota.map((campo, index) => (
              <motion.div
                key={campo.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <label className="block text-base font-medium text-gray-800 mb-2">
                  {campo.label}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={notas[campo.label] || ''}
                    onChange={(e) => handleNotaChange(campo.label, e.target.value)}
                    min={campo.min}
                    max={campo.max}
                    step={campo.max > 100 ? 10 : 1}
                    className="w-full px-4 py-3 pr-20 min-h-[48px] border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-0 transition-colors text-base"
                    placeholder={`0 - ${campo.max}`}
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-base font-medium">
                    /{campo.max}
                  </span>
                </div>
              </motion.div>
            ))}
            
            {/* Nota Total */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 p-4 bg-blue-50 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-800">Nota Total:</span>
                <span className="text-2xl font-bold text-blue-900">{notaTotal}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Coluna Direita - Resultados */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-xl p-4 sm:p-6"
        >
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            Suas Chances em Cada Curso
          </h3>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            <AnimatePresence>
              {resultadosPorCurso.map((resultado, index) => (
                <motion.div
                  key={resultado.curso}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    resultado.aprovado 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{resultado.curso}</h4>
                    {resultado.aprovado ? (
                      <CheckCircle className="text-green-600" size={24} />
                    ) : (
                      <XCircle className="text-red-500" size={24} />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nota de Corte:</span>
                      <p className="font-bold text-gray-900">{resultado.notaCorte}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {resultado.aprovado ? 'Acima por:' : 'Faltam:'}
                      </span>
                      <p className={`font-bold ${
                        resultado.aprovado ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(resultado.diferenca)} pontos
                      </p>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mt-3">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(resultado.percentual, 100)}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className={`h-full ${
                          resultado.aprovado ? 'bg-green-500' : 'bg-red-400'
                        }`}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {resultado.percentual.toFixed(1)}% da nota de corte
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Resumo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
          >
            <h4 className="font-semibold text-gray-900 mb-2">Resumo</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  {resultadosPorCurso.filter(r => r.aprovado).length}
                </p>
                <p className="text-gray-600">Cursos com aprovação</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {resultadosPorCurso.filter(r => !r.aprovado && r.diferenca > -50).length}
                </p>
                <p className="text-gray-600">Muito próximos (&lt;50 pts)</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Informações */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 text-center text-sm text-gray-500"
      >
        <p>
          💡 Calculadora baseada em notas de corte anteriores. Resultados reais podem variar.
        </p>
      </motion.div>
    </div>
  );
}
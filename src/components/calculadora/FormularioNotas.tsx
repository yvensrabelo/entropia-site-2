import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, Target } from 'lucide-react';
import { Processo, Curso, CampoNota } from '@/data/vestibular-data';

interface FormularioNotasProps {
  processo: Processo;
  curso: Curso;
  camposNota: CampoNota[];
  notas: Record<string, number>;
  cotaSugerida: string;
  descricaoCota: string;
  onChange: (notas: Record<string, number>) => void;
  onCalcular: () => void;
  onEtapaAnterior: () => void;
}

export default function FormularioNotas({
  processo,
  curso,
  camposNota,
  notas,
  cotaSugerida,
  descricaoCota,
  onChange,
  onCalcular,
  onEtapaAnterior
}: FormularioNotasProps) {
  
  const handleNotaChange = (campo: string, valor: string) => {
    const numero = parseFloat(valor) || 0;
    onChange({ ...notas, [campo]: numero });
  };

  const todasNotasPreenchidas = camposNota.every(campo => 
    notas[campo.label] !== undefined && notas[campo.label] !== null && notas[campo.label] !== 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Insira suas Notas
        </h2>
        <p className="text-gray-600">
          {processo} - {curso}
        </p>
      </div>

      {/* Informação da Cota */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200"
      >
        <div className="flex items-center gap-3">
          <Target className="text-green-600" size={24} />
          <div>
            <p className="font-semibold text-green-800">Cota Sugerida: {cotaSugerida}</p>
            <p className="text-sm text-green-600">{descricaoCota}</p>
          </div>
        </div>
      </motion.div>

      {/* Campos de Nota */}
      <div className="space-y-4">
        {camposNota.map((campo, index) => (
          <motion.div
            key={campo.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {campo.label}
            </label>
            <div className="relative">
              <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                value={notas[campo.label] || ''}
                onChange={(e) => handleNotaChange(campo.label, e.target.value)}
                min={campo.min}
                max={campo.max}
                step={campo.max > 100 ? 10 : 1}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 transition-colors"
                placeholder={`0 - ${campo.max}`}
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                /{campo.max}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dicas por processo */}
      <div className="bg-blue-50 p-4 rounded-xl">
        <p className="text-sm text-blue-800">
          <strong>💡 Dica:</strong>{' '}
          {processo === 'PSC' && 'No PSC, as notas das 3 etapas são multiplicadas por 10 e a redação por 100.'}
          {processo === 'MACRO' && 'No MACRO, Conhecimentos Gerais tem peso 3, Específicos peso 4 e Redação peso 3.'}
          {processo === 'SIS' && 'No SIS, as provas objetivas valem 10x e as redações valem 50x cada.'}
          {processo === 'ENEM' && 'No ENEM, a nota final é a média das 5 áreas de conhecimento.'}
        </p>
      </div>

      {/* Botões */}
      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEtapaAnterior}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-4 rounded-2xl transition-colors"
        >
          Voltar
        </motion.button>
        <motion.button
          whileHover={{ scale: todasNotasPreenchidas ? 1.02 : 1 }}
          whileTap={{ scale: todasNotasPreenchidas ? 0.98 : 1 }}
          onClick={onCalcular}
          disabled={!todasNotasPreenchidas}
          className={`font-bold py-4 rounded-2xl transition-all ${
            todasNotasPreenchidas
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Calcular Resultado
        </motion.button>
      </div>
    </motion.div>
  );
}
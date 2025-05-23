import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, BookOpen, FileText, Brain } from 'lucide-react';
import { Processo } from '@/data/vestibular-data';

interface SeletorProcessoProps {
  processoSelecionado: Processo;
  onProcessoChange: (processo: Processo) => void;
  onProximaEtapa: () => void;
}

const iconesPorProcesso = {
  PSC: GraduationCap,
  MACRO: BookOpen,
  SIS: FileText,
  ENEM: Brain,
};

const descricoesPorProcesso = {
  PSC: 'Processo Seletivo Contínuo - UFAM',
  MACRO: 'Vestibular Macro - UEA',
  SIS: 'Sistema de Ingresso Seriado - UEA',
  ENEM: 'Exame Nacional do Ensino Médio',
};

export default function SeletorProcesso({ 
  processoSelecionado, 
  onProcessoChange, 
  onProximaEtapa 
}: SeletorProcessoProps) {
  const processos: Processo[] = ['PSC', 'MACRO', 'SIS', 'ENEM'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Escolha o Processo Seletivo
        </h2>
        <p className="text-gray-600">
          Selecione o vestibular que você está prestando
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {processos.map((processo) => {
          const Icon = iconesPorProcesso[processo];
          const isSelected = processoSelecionado === processo;
          
          return (
            <motion.button
              key={processo}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onProcessoChange(processo)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all
                ${isSelected 
                  ? 'border-green-500 bg-green-50 shadow-lg' 
                  : 'border-gray-200 bg-white hover:border-green-300'
                }
              `}
            >
              <Icon 
                className={`w-12 h-12 mx-auto mb-3 ${
                  isSelected ? 'text-green-600' : 'text-gray-400'
                }`} 
              />
              <h3 className={`text-xl font-bold mb-1 ${
                isSelected ? 'text-green-700' : 'text-gray-900'
              }`}>
                {processo}
              </h3>
              <p className="text-sm text-gray-600">
                {descricoesPorProcesso[processo]}
              </p>
              
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onProximaEtapa}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-2xl transition-colors"
      >
        Continuar
      </motion.button>
    </motion.div>
  );
}
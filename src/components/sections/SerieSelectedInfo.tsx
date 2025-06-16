'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SerieSelectedInfo = () => {
  const [serieSelecionada, setSerieSelecionada] = useState<string | null>(null);
  
  useEffect(() => {
    // Get selected series from sessionStorage
    const serie = sessionStorage.getItem('serie_selecionada');
    setSerieSelecionada(serie);
  }, []);

  if (!serieSelecionada) return null;

  const serieInfo = {
    '1': {
      titulo: '1ª Série do Ensino Médio',
      turma: 'PSC UFAM',
      icone: '📚',
      cor: 'from-blue-500 to-blue-600',
      bgCor: 'bg-blue-50',
      textCor: 'text-blue-800',
      borderCor: 'border-blue-200',
      descricao: 'Preparação antecipada para o PSC UFAM'
    },
    '2': {
      titulo: '2ª Série do Ensino Médio',
      turma: 'ENEM COMPLETO',
      icone: '📖',
      cor: 'from-green-500 to-green-600',
      bgCor: 'bg-green-50',
      textCor: 'text-green-800',
      borderCor: 'border-green-200',
      descricao: 'Base sólida para o ENEM'
    },
    '3': {
      titulo: '3ª Série do Ensino Médio',
      turma: 'INTENSIVO FINAL',
      icone: '🎯',
      cor: 'from-purple-500 to-purple-600',
      bgCor: 'bg-purple-50',
      textCor: 'text-purple-800',
      borderCor: 'border-purple-200',
      descricao: 'Reta final para aprovação'
    },
    'formado': {
      titulo: 'Ensino Médio Completo',
      turma: 'INTENSIVO PLUS',
      icone: '🎓',
      cor: 'from-orange-500 to-orange-600',
      bgCor: 'bg-orange-50',
      textCor: 'text-orange-800',
      borderCor: 'border-orange-200',
      descricao: 'Nova chance, novo futuro'
    }
  };

  const info = serieInfo[serieSelecionada as keyof typeof serieInfo];

  if (!info) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${info.bgCor} ${info.borderCor} border-2 rounded-xl p-6 mb-8`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 bg-gradient-to-r ${info.cor} rounded-xl flex items-center justify-center text-2xl`}>
          {info.icone}
        </div>
        <div className="flex-1">
          <h3 className={`${info.textCor} font-bold text-lg mb-1`}>
            Turma selecionada: {info.turma}
          </h3>
          <p className={`${info.textCor}/80 text-sm mb-2`}>
            {info.descricao}
          </p>
          <div className={`${info.textCor} text-xs font-medium flex items-center gap-2`}>
            <span className="w-2 h-2 bg-current rounded-full"></span>
            Ideal para: {info.titulo}
          </div>
        </div>
        <div className={`${info.textCor} text-right`}>
          <div className="text-xs font-medium opacity-70">SÉRIE</div>
          <div className="text-lg font-bold">
            {serieSelecionada === 'formado' ? '✓' : `${serieSelecionada}ª`}
          </div>
        </div>
      </div>
      
      {/* Hidden input for form submission */}
      <input type="hidden" name="serie_selecionada" value={serieSelecionada} />
      <input type="hidden" name="turma_selecionada" value={info.turma} />
    </motion.div>
  );
};

export default SerieSelectedInfo;
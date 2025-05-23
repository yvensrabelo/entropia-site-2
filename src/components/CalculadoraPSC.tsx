'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 🔥 Dados de referência completos
const processos = ['PSC', 'MACRO', 'SIS', 'ENEM']

const cotasPorProcesso = {
  PSC: ['AC', 'PP1', 'PP2', 'IND1', 'IND2', 'QLB1', 'QLB2', 'PCD1', 'PCD2', 'NDC1', 'NDC2'],
  MACRO: ['AC', 'Escola Pública', 'Negros', 'Indígenas', 'PCD'],
  SIS: ['AC', 'Escola Pública', 'PPI', 'PCD', 'Indígenas'],
  ENEM: ['AC', 'Escola Pública', 'PPI', 'PCD'],
}

const cursos = ['Medicina', 'Direito', 'Engenharia', 'Psicologia', 'Pedagogia', 'Licenciaturas']

const camposPorProcesso = {
  PSC: [
    { label: 'PSC 1', min: 0, max: 54 },
    { label: 'PSC 2', min: 0, max: 54 },
    { label: 'PSC 3', min: 0, max: 54 },
    { label: 'Redação', min: 0, max: 9 },
  ],
  MACRO: [
    { label: 'Conhecimentos Gerais', min: 0, max: 100 },
    { label: 'Conhecimentos Específicos', min: 0, max: 100 },
    { label: 'Redação', min: 0, max: 100 },
  ],
  SIS: [
    { label: 'SIS 1', min: 0, max: 60 },
    { label: 'SIS 2', min: 0, max: 60 },
    { label: 'Redação SIS 2', min: 0, max: 10 },
    { label: 'SIS 3', min: 0, max: 60 },
    { label: 'Redação SIS 3', min: 0, max: 10 },
  ],
  ENEM: [
    { label: 'Linguagens', min: 0, max: 1000 },
    { label: 'Humanas', min: 0, max: 1000 },
    { label: 'Natureza', min: 0, max: 1000 },
    { label: 'Matemática', min: 0, max: 1000 },
    { label: 'Redação', min: 0, max: 1000 },
  ],
}

const notasDeCorte = {
  PSC: {
    AC: { Medicina: 720, Direito: 650, Engenharia: 630, Psicologia: 610, Pedagogia: 580, Licenciaturas: 560 },
    PP1: { Medicina: 700, Direito: 630, Engenharia: 610, Psicologia: 590, Pedagogia: 560, Licenciaturas: 540 },
    PP2: { Medicina: 690, Direito: 620, Engenharia: 600, Psicologia: 580, Pedagogia: 550, Licenciaturas: 530 },
    IND1: { Medicina: 680, Direito: 610, Engenharia: 590, Psicologia: 570, Pedagogia: 540, Licenciaturas: 520 },
    IND2: { Medicina: 670, Direito: 600, Engenharia: 580, Psicologia: 560, Pedagogia: 530, Licenciaturas: 510 },
    QLB1: { Medicina: 660, Direito: 590, Engenharia: 570, Psicologia: 550, Pedagogia: 520, Licenciaturas: 500 },
    QLB2: { Medicina: 650, Direito: 580, Engenharia: 560, Psicologia: 540, Pedagogia: 510, Licenciaturas: 490 },
    PCD1: { Medicina: 640, Direito: 570, Engenharia: 550, Psicologia: 530, Pedagogia: 500, Licenciaturas: 480 },
    PCD2: { Medicina: 630, Direito: 560, Engenharia: 540, Psicologia: 520, Pedagogia: 490, Licenciaturas: 470 },
    NDC1: { Medicina: 620, Direito: 550, Engenharia: 530, Psicologia: 510, Pedagogia: 480, Licenciaturas: 460 },
    NDC2: { Medicina: 610, Direito: 540, Engenharia: 520, Psicologia: 500, Pedagogia: 470, Licenciaturas: 450 },
  },
  MACRO: {
    AC: { Medicina: 750, Direito: 680, Engenharia: 660, Psicologia: 640, Pedagogia: 600, Licenciaturas: 590 },
    "Escola Pública": { Medicina: 730, Direito: 660, Engenharia: 640, Psicologia: 620, Pedagogia: 580, Licenciaturas: 570 },
    Negros: { Medicina: 720, Direito: 650, Engenharia: 630, Psicologia: 610, Pedagogia: 570, Licenciaturas: 560 },
    Indígenas: { Medicina: 710, Direito: 640, Engenharia: 620, Psicologia: 600, Pedagogia: 560, Licenciaturas: 550 },
    PCD: { Medicina: 700, Direito: 630, Engenharia: 610, Psicologia: 590, Pedagogia: 550, Licenciaturas: 540 },
  },
  SIS: {
    AC: { Medicina: 800, Direito: 700, Engenharia: 680, Psicologia: 660, Pedagogia: 620, Licenciaturas: 610 },
    "Escola Pública": { Medicina: 780, Direito: 680, Engenharia: 660, Psicologia: 640, Pedagogia: 600, Licenciaturas: 590 },
    PPI: { Medicina: 770, Direito: 670, Engenharia: 650, Psicologia: 630, Pedagogia: 590, Licenciaturas: 580 },
    PCD: { Medicina: 760, Direito: 660, Engenharia: 640, Psicologia: 620, Pedagogia: 580, Licenciaturas: 570 },
    Indígenas: { Medicina: 750, Direito: 650, Engenharia: 630, Psicologia: 610, Pedagogia: 570, Licenciaturas: 560 },
  },
  ENEM: {
    AC: { Medicina: 780, Direito: 690, Engenharia: 670, Psicologia: 650, Pedagogia: 610, Licenciaturas: 600 },
    "Escola Pública": { Medicina: 760, Direito: 670, Engenharia: 650, Psicologia: 630, Pedagogia: 590, Licenciaturas: 580 },
    PPI: { Medicina: 750, Direito: 660, Engenharia: 640, Psicologia: 620, Pedagogia: 580, Licenciaturas: 570 },
    PCD: { Medicina: 740, Direito: 650, Engenharia: 630, Psicologia: 610, Pedagogia: 570, Licenciaturas: 560 },
  },
}

const descricoesCota = {
  AC: 'Ampla Concorrência',
  PP1: 'Escola Pública + PPI + Baixa Renda',
  PP2: 'Escola Pública + PPI',
  IND1: 'Escola Pública + Indígena + Baixa Renda',
  IND2: 'Escola Pública + Indígena',
  QLB1: 'Escola Pública + Quilombola + Baixa Renda',
  QLB2: 'Escola Pública + Quilombola',
  PCD1: 'Escola Pública + PCD + Baixa Renda',
  PCD2: 'Escola Pública + PCD',
  NDC1: 'Escola Pública + Baixa Renda',
  NDC2: 'Escola Pública',
  'Escola Pública': 'Escola Pública',
  'Negros': 'Negros/Pardos',
  'Indígenas': 'Indígenas',
  'PCD': 'Pessoa com Deficiência',
  'PPI': 'Pretos, Pardos e Indígenas'
}

const CalculadoraVestibular = () => {
  const [processo, setProcesso] = useState('PSC')
  const [cota, setCota] = useState('AC')
  const [notas, setNotas] = useState<number[]>([])
  const [notaTotal, setNotaTotal] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)

  // Estados para identificação
  const [escola, setEscola] = useState<string | null>(null)
  const [renda, setRenda] = useState<string | null>(null)
  const [cor, setCor] = useState<string | null>(null)
  const [grupo, setGrupo] = useState<string | null>(null)

  // Estados para feedback visual
  const [errors, setErrors] = useState<Record<number, string>>({})
  const [isCalculating, setIsCalculating] = useState(false)

  // Inicializa as notas quando o processo muda
  useEffect(() => {
    const newNotas = new Array(camposPorProcesso[processo as keyof typeof camposPorProcesso].length).fill(0)
    setNotas(newNotas)
    setNotaTotal(0)
    setErrors({})
  }, [processo])

  // Calcula a nota total com animação
  useEffect(() => {
    setIsCalculating(true)
    
    const calculateTotal = () => {
      let total = 0
      
      if (processo === 'PSC') {
        // PSC: (PSC1 + PSC2 + PSC3) * 3 + Redação * 6
        total = (notas[0] + notas[1] + notas[2]) * 3 + notas[3] * 6
      } else if (processo === 'SIS') {
        // SIS: SIS1 + SIS2 + RedaçãoSIS2*2 + SIS3 + RedaçãoSIS3*2
        total = notas[0] + notas[1] + notas[2] * 2 + notas[3] + notas[4] * 2
      } else if (processo === 'ENEM') {
        // ENEM: Média das 5 áreas
        const soma = notas.reduce((acc, val) => acc + (val || 0), 0)
        total = notas.length > 0 ? soma / notas.length : 0
      } else if (processo === 'MACRO') {
        // MACRO: Soma simples
        total = notas.reduce((acc, val) => acc + (val || 0), 0)
      }
      
      return Math.round(total * 100) / 100
    }
    
    setTimeout(() => {
      const newTotal = calculateTotal()
      setNotaTotal(newTotal)
      setShowAnimation(true)
      setIsCalculating(false)
      
      const timer = setTimeout(() => setShowAnimation(false), 600)
      return () => clearTimeout(timer)
    }, 300)
    
  }, [notas, processo])

  // Determina a cota automaticamente baseado nas respostas
  useEffect(() => {
    if (escola === 'particular') {
      setCota('AC')
      return
    }

    if (processo === 'PSC') {
      // Lógica complexa do PSC
      if (grupo === 'quilombola') {
        setCota(renda === 'ate1' ? 'QLB1' : 'QLB2')
      } else if (grupo === 'indigena') {
        setCota(renda === 'ate1' ? 'IND1' : 'IND2')
      } else if (grupo === 'pcd') {
        setCota(renda === 'ate1' ? 'PCD1' : 'PCD2')
      } else {
        const isNegroOuPardoOuIndigena = ['preto', 'pardo', 'indigena'].includes(cor || '')
        if (renda === 'ate1') {
          setCota(isNegroOuPardoOuIndigena ? 'PP1' : 'NDC1')
        } else if (renda === 'mais1') {
          setCota(isNegroOuPardoOuIndigena ? 'PP2' : 'NDC2')
        } else {
          setCota('AC')
        }
      }
    } else {
      // Lógica para outros processos (MACRO, SIS, ENEM)
      if (grupo === 'pcd') {
        setCota('PCD')
      } else if (grupo === 'indigena') {
        setCota('Indígenas')
      } else if (['preto', 'pardo'].includes(cor || '')) {
        setCota(processo === 'MACRO' ? 'Negros' : 'PPI')
      } else if (escola === 'publica') {
        setCota('Escola Pública')
      } else {
        setCota('AC')
      }
    }
  }, [escola, renda, cor, grupo, processo])

  // Função para validar e atualizar notas
  const handleNotaChange = (index: number, value: string) => {
    const campo = camposPorProcesso[processo as keyof typeof camposPorProcesso][index]
    const min = campo.min ?? 0
    const max = campo.max ?? 1000
    const numValue = Number(value) || 0
    
    // Validação
    if (numValue < min || numValue > max) {
      setErrors(prev => ({
        ...prev,
        [index]: `Valor deve estar entre ${min} e ${max}`
      }))
      return
    } else {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[index]
        return newErrors
      })
    }
    
    const val = Math.max(min, Math.min(max, numValue))
    const newNotas = [...notas]
    newNotas[index] = val
    setNotas(newNotas)
  }

  // Função para resetar o formulário
  const resetForm = () => {
    setEscola(null)
    setRenda(null)
    setCor(null)
    setGrupo(null)
    setNotas(new Array(camposPorProcesso[processo as keyof typeof camposPorProcesso].length).fill(0))
    setNotaTotal(0)
    setCota('AC')
    setErrors({})
  }

  // Função para determinar classes do grid responsivo
  const getGridCols = () => {
    const numCampos = camposPorProcesso[processo as keyof typeof camposPorProcesso].length
    if (numCampos <= 2) return 'grid-cols-1 md:grid-cols-2'
    if (numCampos <= 3) return 'grid-cols-1 md:grid-cols-3'
    if (numCampos <= 4) return 'grid-cols-2 md:grid-cols-4'
    return 'grid-cols-2 md:grid-cols-3'
  }

  // Função para obter cor baseada no status de aprovação
  const getStatusColor = (aprovado: boolean, falta: number) => {
    if (aprovado) return 'text-green-600'
    if (falta <= 50) return 'text-yellow-600'
    return 'text-red-500'
  }

  // Função para obter emoji baseado no status
  const getStatusEmoji = (aprovado: boolean, falta: number) => {
    if (aprovado) return '✅'
    if (falta <= 50) return '⚠️'
    return '❌'
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
            Calculadora Vestibular
          </h1>
          <p className="text-gray-600 text-lg">Simule sua nota e descubra sua cota automaticamente</p>
        </motion.div>

        {/* Seleção de Processo */}
        <div className="flex gap-2 md:gap-4 justify-center flex-wrap mb-8">
          {processos.map((p) => (
            <motion.button
              key={p}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setProcesso(p)}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-xl border text-sm md:text-lg font-semibold shadow-lg transition-all duration-300 ${
                processo === p
                  ? 'bg-green-600 text-white border-green-600 shadow-green-500/50'
                  : 'border-green-500/40 text-gray-700 bg-white hover:bg-green-50 hover:border-green-500/60'
              }`}
            >
              {p}
            </motion.button>
          ))}
        </div>

        <div className="flex flex-col xl:flex-row gap-6 md:gap-8">
          {/* Painel de Identificação */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full xl:w-96 bg-white border border-gray-200 rounded-3xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Identificação</h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors text-sm px-3 py-1 rounded-lg hover:bg-gray-100"
              >
                Limpar
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Escola no Ensino Médio */}
              <div className="space-y-3">
                <label className="text-gray-700 text-sm font-medium block">
                  Escola no Ensino Médio:
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'publica', label: 'Pública' },
                    { value: 'particular', label: 'Particular' }
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setEscola(option.value)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        escola === option.value
                          ? 'bg-green-600 text-white border border-green-600'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-green-300 hover:text-gray-900'
                      }`}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Renda familiar per capita */}
              <div className="space-y-3">
                <label className="text-gray-700 text-sm font-medium block">
                  Renda familiar per capita:
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { value: 'ate1', label: 'Até 1 salário mínimo' },
                    { value: 'mais1', label: 'Mais de 1 salário mínimo' }
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRenda(option.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        renda === option.value
                          ? 'bg-green-600 text-white border border-green-600'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-green-300 hover:text-gray-900'
                      }`}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Cor ou Raça */}
              <div className="space-y-3">
                <label className="text-gray-700 text-sm font-medium block">
                  Cor ou Raça:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'preto', label: 'Preta' },
                    { value: 'pardo', label: 'Parda' },
                    { value: 'branco', label: 'Branca' },
                    { value: 'amarelo', label: 'Amarela' },
                    { value: 'indigena', label: 'Indígena' }
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCor(option.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        cor === option.value
                          ? 'bg-green-600 text-white border border-green-600'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-green-300 hover:text-gray-900'
                      } ${option.value === 'indigena' ? 'col-span-2' : ''}`}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Você se declara */}
              <div className="space-y-3">
                <label className="text-gray-700 text-sm font-medium block">
                  Você se declara:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { value: 'pcd', label: 'Pessoa com Deficiência' },
                    { value: 'quilombola', label: 'Quilombola' },
                    { value: 'indigena', label: 'Indígena' },
                    { value: 'nenhum', label: 'Nenhum dos anteriores' }
                  ].map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setGrupo(option.value)}
                      className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        grupo === option.value
                          ? 'bg-green-600 text-white border border-green-600'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-green-300 hover:text-gray-900'
                      }`}
                    >
                      {option.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Exibição da Cota */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-center"
              >
                <span className="text-gray-600 text-sm block mb-1">🎯 Sua modalidade de concorrência:</span>
                <div className="text-xl font-bold text-green-700">{cota}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {descricoesCota[cota as keyof typeof descricoesCota] || cota}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Painel Principal */}
          <div className="flex-1 space-y-6 md:space-y-8">
            {/* Painel de Notas */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-3xl shadow-lg p-6 md:p-8"
            >
              <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-gray-900">
                Notas - {processo}
              </h2>
              
              <div className={`grid ${getGridCols()} gap-4 md:gap-6 mb-8`}>
                {camposPorProcesso[processo as keyof typeof camposPorProcesso].map((campo, i) => (
                  <div className="space-y-2" key={i}>
                    <label className="text-sm font-medium text-gray-700 block">
                      {campo.label}
                      {campo.min !== undefined && campo.max !== undefined && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({campo.min}-{campo.max})
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      min={campo.min ?? 0}
                      max={campo.max ?? 1000}
                      value={notas[i] || ''}
                      onChange={(e) => handleNotaChange(i, e.target.value)}
                      placeholder="0"
                      className={`w-full p-3 rounded-xl bg-gray-50 border text-gray-900 text-center font-semibold focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all ${
                        errors[i] ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errors[i] && (
                      <p className="text-red-500 text-xs mt-1">{errors[i]}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Nota Total */}
              <div className="text-center">
                <p className="text-gray-600 mb-2">Nota Total Calculada:</p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={notaTotal}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      scale: showAnimation ? 1.1 : 1
                    }}
                    exit={{ opacity: 0, y: -20, scale: 0.8 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="text-5xl md:text-7xl font-extrabold text-green-600 drop-shadow-lg"
                  >
                    {isCalculating ? '...' : notaTotal}
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Fórmula de Cálculo */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl text-center">
                <p className="text-sm text-gray-600 mb-2">💡 Fórmula utilizada:</p>
                <p className="text-xs text-gray-500">
                  {processo === 'PSC' && '(PSC1 + PSC2 + PSC3) × 3 + Redação × 6'}
                  {processo === 'SIS' && 'SIS1 + SIS2 + RedSIS2×2 + SIS3 + RedSIS3×2'}
                  {processo === 'ENEM' && 'Média das 5 áreas (Ling + Hum + Nat + Mat + Red) ÷ 5'}
                  {processo === 'MACRO' && 'ConhGerais + ConhEspecíficos + Redação'}
                </p>
              </div>
            </motion.div>

            {/* Comparativo de Cursos */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-gray-200 rounded-3xl shadow-lg p-6 md:p-8"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-6 text-center text-gray-900">
                Comparativo de Cursos
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500 border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-2 text-left">Curso</th>
                      <th className="py-3 px-2 text-center">Nota de Corte</th>
                      <th className="py-3 px-2 text-center">Sua Nota</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-2 text-center">Diferença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cursos.map((curso, index) => {
                      const notaCorte = notasDeCorte[processo]?.[cota]?.[curso] ?? 0
                      const falta = notaCorte - notaTotal
                      const aprovado = falta <= 0
                      const porcentagem = notaTotal > 0 ? Math.min(100, (notaTotal / notaCorte) * 100) : 0
                      
                      return (
                        <motion.tr
                          key={curso}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-2 text-gray-900 font-medium">{curso}</td>
                          <td className="py-4 px-2 text-center text-gray-700 font-semibold">{notaCorte}</td>
                          <td className="py-4 px-2 text-center text-green-600 font-bold">{notaTotal}</td>
                          <td className="py-4 px-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span className={`text-lg ${getStatusColor(aprovado, falta)}`}>
                                {getStatusEmoji(aprovado, falta)}
                              </span>
                              <span className={`font-medium ${getStatusColor(aprovado, falta)}`}>
                                {aprovado ? 'Aprovado' : 'Reprovado'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-center">
                            {aprovado ? (
                              <span className="text-green-600 font-bold">
                                +{Math.abs(falta).toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-red-500 font-medium">
                                -{falta.toFixed(1)}
                              </span>
                            )}
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Barra de progresso geral */}
              <div className="mt-8 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 text-center">
                  Progresso por Curso
                </h3>
                <div className="space-y-3">
                  {cursos.map((curso, index) => {
                    const notaCorte = notasDeCorte[processo]?.[cota]?.[curso] ?? 0
                    const porcentagem = notaTotal > 0 ? Math.min(100, (notaTotal / notaCorte) * 100) : 0
                    const aprovado = porcentagem >= 100
                    
                    return (
                      <motion.div
                        key={curso}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700 font-medium">{curso}</span>
                          <span className={`font-bold ${aprovado ? 'text-green-600' : 'text-gray-600'}`}>
                            {porcentagem.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${porcentagem}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`h-2.5 rounded-full transition-colors duration-300 ${
                              aprovado ? 'bg-green-500' : porcentagem > 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
              
              {/* Resumo estatístico */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {cursos.filter(curso => {
                      const notaCorte = notasDeCorte[processo]?.[cota]?.[curso] ?? 0
                      return notaTotal >= notaCorte
                    }).length}
                  </div>
                  <div className="text-sm text-green-700">Cursos Aprovado</div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {cursos.filter(curso => {
                      const notaCorte = notasDeCorte[processo]?.[cota]?.[curso] ?? 0
                      const falta = notaCorte - notaTotal
                      return falta > 0 && falta <= 50
                    }).length}
                  </div>
                  <div className="text-sm text-yellow-700">Quase Lá</div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {cursos.filter(curso => {
                      const notaCorte = notasDeCorte[processo]?.[cota]?.[curso] ?? 0
                      const falta = notaCorte - notaTotal
                      return falta > 50
                    }).length}
                  </div>
                  <div className="text-sm text-red-700">Precisa Melhorar</div>
                </div>
              </div>
              
              {/* Legenda */}
              <div className="mt-6 text-xs text-gray-500 text-center space-y-1">
                <p>* Notas de corte baseadas em dados históricos e podem variar conforme a concorrência</p>
                <p>* Cálculos são estimativas para fins de orientação de estudos</p>
                <p>* Para informações oficiais, consulte sempre os editais dos respectivos processos seletivos</p>
              </div>
            </motion.div>

            {/* Dicas e Sugestões */}
            {notaTotal > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-blue-50 border border-blue-200 rounded-3xl p-6 md:p-8"
              >
                <h3 className="text-xl font-bold text-blue-900 mb-4 text-center">
                  💡 Dicas Personalizadas
                </h3>
                
                <div className="space-y-4">
                  {/* Dicas baseadas no desempenho */}
                  {cursos.filter(curso => {
                    const notaCorte = notasDeCorte[processo]?.[cota]?.[curso] ?? 0
                    return notaTotal >= notaCorte
                  }).length > 0 && (
                    <div className="bg-green-100 border border-green-300 rounded-xl p-4">
                      <h4 className="font-semibold text-green-800 mb-2">🎉 Parabéns!</h4>
                      <p className="text-green-700 text-sm">
                        Você já tem nota suficiente para alguns cursos! Continue estudando para manter o desempenho.
                      </p>
                    </div>
                  )}
                  
                  {/* Dicas para quem está próximo */}
                  {cursos.filter(curso => {
                    const notaCorte = notasDeCorte[processo]?.[cota]?.[curso] ?? 0
                    const falta = notaCorte - notaTotal
                    return falta > 0 && falta <= 50
                  }).length > 0 && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">⚡ Você está quase lá!</h4>
                      <p className="text-yellow-700 text-sm">
                        Falta pouco para alguns cursos. Foque nas matérias com maior peso na sua prova!
                      </p>
                    </div>
                  )}
                  
                  {/* Dicas específicas por processo */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">📚 Dicas para {processo}</h4>
                    <div className="text-gray-700 text-sm space-y-1">
                      {processo === 'PSC' && (
                        <>
                          <p>• A redação tem peso 6, então capriche nela!</p>
                          <p>• Cada PSC tem peso 3, mantenha consistência em todas as provas</p>
                          <p>• Estude as matérias específicas do seu curso desejado</p>
                        </>
                      )}
                      {processo === 'SIS' && (
                        <>
                          <p>• As redações do SIS 2 e 3 têm peso 2, são muito importantes!</p>
                          <p>• O SIS é progressivo, cada etapa conta para a nota final</p>
                          <p>• Mantenha a regularidade ao longo dos 3 anos</p>
                        </>
                      )}
                      {processo === 'ENEM' && (
                        <>
                          <p>• Todas as áreas têm o mesmo peso na média</p>
                          <p>• A redação pode ser decisiva, pratique bastante</p>
                          <p>• Use a nota do ENEM para SISU, ProUni e FIES</p>
                        </>
                      )}
                      {processo === 'MACRO' && (
                        <>
                          <p>• Equilibre conhecimentos gerais e específicos</p>
                          <p>• A redação é fundamental para a nota final</p>
                          <p>• Foque nas matérias do seu curso de interesse</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Simulador de Metas */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-purple-50 border border-purple-200 rounded-3xl p-6 md:p-8"
            >
              <h3 className="text-xl font-bold text-purple-900 mb-6 text-center">
                🎯 Simulador de Metas
              </h3>
              
              <div className="space-y-4">
                <p className="text-purple-700 text-center mb-4">
                  Veja quantos pontos você precisa para cada curso:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cursos.map((curso, index) => {
                    const notaCorte = notasDeCorte[processo]?.[cota]?.[curso] ?? 0
                    const falta = Math.max(0, notaCorte - notaTotal)
                    const aprovado = falta === 0
                    
                    return (
                      <motion.div
                        key={curso}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border ${
                          aprovado 
                            ? 'bg-green-100 border-green-300' 
                            : 'bg-white border-purple-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{curso}</span>
                          <div className="text-right">
                            {aprovado ? (
                              <div className="text-green-600 font-bold">✅ Aprovado!</div>
                            ) : (
                              <div>
                                <div className="text-purple-600 font-bold">
                                  +{falta.toFixed(1)} pontos
                                </div>
                                <div className="text-xs text-gray-500">
                                  para atingir {notaCorte}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(CalculadoraVestibular)
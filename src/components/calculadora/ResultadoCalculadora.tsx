import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Target, 
  Book,
  Clock,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { REFERENCIAS_ESTUDO } from '@/data/vestibular-data';

interface ResultadoCalculadoraProps {
  nome: string;
  processo: string;
  curso: string;
  notaTotal: number;
  notaDeCorte: number;
  aprovado: boolean;
  diferencaNota: number;
  percentualAcima: string;
  cotaSugerida: string;
  descricaoCota: string;
  onReiniciar: () => void;
}

export default function ResultadoCalculadora({
  nome,
  processo,
  curso,
  notaTotal,
  notaDeCorte,
  aprovado,
  diferencaNota,
  percentualAcima,
  cotaSugerida,
  descricaoCota,
  onReiniciar
}: ResultadoCalculadoraProps) {
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Cabeçalho do Resultado */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-4"
        >
          {aprovado ? (
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
          ) : (
            <XCircle className="w-24 h-24 text-red-500 mx-auto" />
          )}
        </motion.div>
        
        <h2 className={`text-4xl font-bold mb-2 ${
          aprovado ? 'text-green-600' : 'text-red-600'
        }`}>
          {aprovado ? '🎉 Parabéns!' : '💪 Não Desista!'}
        </h2>
        
        <p className="text-xl text-gray-700">
          {nome}, você {aprovado ? 'seria APROVADO(A)' : 'ainda não alcançou a nota'} em
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {curso} - {processo}
        </p>
      </div>

      {/* Cards de Informação */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-blue-600" size={20} />
            <span className="font-semibold text-blue-800">Sua Nota</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">{notaTotal}</p>
          <p className="text-sm text-blue-600">pontos totais</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-purple-600" size={20} />
            <span className="font-semibold text-purple-800">Nota de Corte</span>
          </div>
          <p className="text-3xl font-bold text-purple-900">{notaDeCorte}</p>
          <p className="text-sm text-purple-600">{cotaSugerida}</p>
        </motion.div>
      </div>

      {/* Análise Detalhada */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`p-4 rounded-2xl ${
          aprovado 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
            : 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200'
        }`}
      >
        <h3 className={`font-bold mb-2 ${
          aprovado ? 'text-green-800' : 'text-red-800'
        }`}>
          Análise Detalhada
        </h3>
        <p className={`text-sm ${aprovado ? 'text-green-700' : 'text-red-700'}`}>
          {aprovado 
            ? `Você ultrapassou a nota de corte em ${Math.abs(diferencaNota)} pontos (${percentualAcima}% acima)!`
            : `Você precisa de mais ${Math.abs(diferencaNota)} pontos para alcançar a nota de corte.`
          }
        </p>
        <p className="text-xs text-gray-600 mt-2">
          Cota aplicada: {descricaoCota}
        </p>
      </motion.div>

      {/* Recomendações de Estudo */}
      {!aprovado && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-50 p-4 rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="text-yellow-600" size={24} />
            <h3 className="font-bold text-yellow-800">Plano de Estudos Recomendado</h3>
          </div>
          
          <div className="space-y-3">
            {REFERENCIAS_ESTUDO.slice(0, 3).map((ref, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="bg-yellow-200 p-1.5 rounded-lg">
                  <Book className="text-yellow-700" size={16} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">{ref.titulo}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-yellow-700 flex items-center gap-1">
                      <Clock size={12} />
                      {ref.tempo}
                    </span>
                    <span className="text-xs text-gray-600">
                      {ref.assuntos.slice(0, 2).join(' • ')}...
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Comparação com Outros Cursos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 p-4 rounded-2xl"
      >
        <h3 className="font-bold text-gray-800 mb-3">
          💡 Com sua nota, você também seria aprovado(a) em:
        </h3>
        <div className="flex flex-wrap gap-2">
          {['Pedagogia', 'Licenciaturas', 'Administração'].map((curso) => (
            <span
              key={curso}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
            >
              {curso}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Botão de Reiniciar */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onReiniciar}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
      >
        <RefreshCw size={20} />
        Fazer Novo Cálculo
      </motion.button>
    </motion.div>
  );
}
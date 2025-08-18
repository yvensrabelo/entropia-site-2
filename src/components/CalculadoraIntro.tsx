'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, Sparkles, GraduationCap, Trophy } from 'lucide-react'

interface CalculadoraIntroProps {
  onComplete: () => void
}

export default function CalculadoraIntro({ onComplete }: CalculadoraIntroProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-700"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative w-full max-w-4xl px-4">
          {/* Partículas animadas no fundo */}
          <motion.div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-2 w-2 bg-white/20 rounded-full"
                initial={{
                  x: Math.random() * 1000,
                  y: Math.random() * 800,
                }}
                animate={{
                  x: Math.random() * 1000,
                  y: Math.random() * 800,
                }}
                transition={{
                  duration: Math.random() * 20 + 10,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
              />
            ))}
          </motion.div>

          <div className="relative z-10 text-center">
            {/* Ícones flutuantes */}
            <motion.div
              className="absolute -top-20 left-10 text-white/30"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <GraduationCap size={40} />
            </motion.div>

            <motion.div
              className="absolute -top-20 right-10 text-white/30"
              animate={{
                y: [0, 20, 0],
                rotate: [0, -10, 10, 0],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Trophy size={40} />
            </motion.div>

            {/* Ícone principal */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <Calculator className="relative text-white" size={80} />
              </div>
            </motion.div>

            {/* Título principal */}
            <motion.h1
              className="text-5xl md:text-6xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Calculadora de Notas
            </motion.h1>

            {/* Subtítulo */}
            <motion.p
              className="text-xl text-white/80 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              PSC • MACRO • SIS • ENEM
            </motion.p>

            {/* Créditos com destaque especial */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 opacity-20 blur-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <motion.div
                  className="flex items-center justify-center gap-2 mb-2"
                  animate={{
                    scale: [1, 1.02, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Sparkles className="text-yellow-300" size={24} />
                  <p className="text-white/70 text-sm uppercase tracking-wider">Desenvolvido por</p>
                  <Sparkles className="text-yellow-300" size={24} />
                </motion.div>
                
                <motion.h2
                  className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0%", "100%", "0%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    backgroundSize: "200% 100%",
                  }}
                >
                  Yvens Rabelo
                </motion.h2>
                
                <motion.p
                  className="text-white/60 text-sm mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  Criador & Desenvolvedor Principal
                </motion.p>
              </div>
            </motion.div>

            {/* Botão para continuar */}
            <motion.button
              onClick={onComplete}
              className="mt-8 px-8 py-3 bg-white text-green-800 font-semibold rounded-full hover:bg-green-50 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Começar Cálculo
            </motion.button>

            {/* Indicador de loading */}
            <motion.div
              className="mt-8 flex justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-2 w-2 bg-white/50 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function SucessoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-green-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-12 text-center max-w-md"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-12 h-12 text-white" />
        </motion.div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Matrícula Enviada!</h1>
        <p className="text-white/70 mb-8">
          Recebemos sua solicitação de matrícula. Nossa equipe entrará em contato em até 24 horas.
        </p>
        
        <Link href="/" className="bg-white text-green-700 font-bold px-8 py-3 rounded-full hover:bg-green-50 transition-all inline-block">
          Voltar ao Início
        </Link>
      </motion.div>
    </div>
  )
}
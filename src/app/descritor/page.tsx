'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, Lock, ArrowRight, BookOpen, Users, Calendar, LogOut } from 'lucide-react'
import { professoresService } from '@/services/professoresService'

export default function PortalProfessorPage() {
  const router = useRouter()
  const [cpf, setCpf] = useState('')
  const [professores, setProfessores] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProfessores, setLoadingProfessores] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const carregarProfessores = async () => {
      try {
        const professoresAtivos = await professoresService.listarProfessores(true)
        setProfessores(professoresAtivos)
      } catch (error) {
        console.error('Erro ao carregar professores:', error)
      } finally {
        setLoadingProfessores(false)
      }
    }
    carregarProfessores()
  }, [])

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    }
    return value
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Limpar CPF para comparação
    const cpfLimpo = cpf.replace(/\D/g, '')

    if (cpfLimpo.length !== 11) {
      setError('CPF inválido. Digite 11 números.')
      setLoading(false)
      return
    }

    // Procurar professor
    const professor = professores.find(p => 
      p.cpf?.replace(/\D/g, '') === cpfLimpo || 
      p.email?.replace(/\D/g, '') === cpfLimpo
    )

    if (professor) {
      // Salvar dados na sessão
      sessionStorage.setItem('professor_logado', JSON.stringify({
        id: professor.id,
        nome: professor.nome,
        cpf: cpfLimpo
      }))

      // Redirecionar com animação
      setTimeout(() => {
        router.push('/descritor/dashboard')
      }, 500)
    } else {
      setError('CPF não encontrado. Verifique com a coordenação.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header com logo */}
      <header className="relative z-10 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">Portal do Professor</h1>
              <p className="text-white/70 text-sm">Cursinho Entropia</p>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push('/')}
            className="text-white/70 hover:text-white transition-colors flex items-center gap-2 text-sm"
          >
            Voltar ao site
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </header>

      {/* Container principal */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Card glassmorphism */}
          <div className="backdrop-blur-2xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-10">
            {/* Ícone e título */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl"
              >
                <User className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo!</h2>
              <p className="text-white/70">Acesse suas aulas e recursos</p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  CPF do Professor
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                  <input
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    disabled={loading || loadingProfessores}
                    maxLength={14}
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading || loadingProfessores || !cpf}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                  loading || loadingProfessores || !cpf
                    ? 'bg-white/20 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl'
                }`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Entrando...
                  </>
                ) : loadingProfessores ? (
                  'Carregando...'
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Links úteis */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-6 h-6 text-white/70" />
                  </div>
                  <p className="text-white/60 text-xs">Horários</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-white/70" />
                  </div>
                  <p className="text-white/60 text-xs">Turmas</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <BookOpen className="w-6 h-6 text-white/70" />
                  </div>
                  <p className="text-white/60 text-xs">Materiais</p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Informações de contato */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6 text-white/60 text-sm"
          >
            <p>Problemas para acessar?</p>
            <a href="https://wa.me/5592991234567" className="text-purple-400 hover:text-purple-300 transition-colors">
              Fale com a coordenação
            </a>
          </motion.div>
        </motion.div>
      </main>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
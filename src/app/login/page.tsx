'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, User, Lock, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  
  const { login } = useAuth()
  const router = useRouter()

  // Formatação do CPF
  const formatarCPF = (valor: string) => {
    const numeros = valor.replace(/\D/g, '')
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    const cpfFormatado = formatarCPF(valor)
    setCpf(cpfFormatado)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)
    setErro('')

    // Remove formatação do CPF
    const cpfLimpo = cpf.replace(/\D/g, '')
    
    // Validação simples
    if (cpfLimpo.length !== 11) {
      setErro('CPF deve conter 11 dígitos')
      setCarregando(false)
      return
    }

    if (senha.length < 6) {
      setErro('Senha deve ter pelo menos 6 caracteres')
      setCarregando(false)
      return
    }

    // Login com Supabase
    const resultado = await login(cpf, senha)
    
    if (resultado.success) {
      router.push('/aluno/dashboard')
    } else {
      setErro(resultado.error || 'Erro no login')
    }
    
    setCarregando(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Botão Voltar */}
      <Link 
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Voltar ao site</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="bg-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Área do <span className="text-green-600">Aluno</span>
          </h1>
          <p className="text-gray-600">
            Entre com seu CPF e senha para acessar
          </p>
        </div>

        {/* Formulário */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl border-2 border-gray-200 shadow-xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CPF */}
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-2">
                CPF
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  id="cpf"
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                  placeholder="000.000.000-00"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-0 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  id="senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-2xl focus:border-green-500 focus:ring-0 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 text-red-700 text-sm"
              >
                {erro}
              </motion.div>
            )}

            {/* Botão Login */}
            <motion.button
              type="submit"
              disabled={carregando}
              whileHover={{ scale: carregando ? 1 : 1.02 }}
              whileTap={{ scale: carregando ? 1 : 0.98 }}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
            >
              {carregando ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </motion.button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <a href="#" className="text-green-600 hover:text-green-700 text-sm font-medium">
              Esqueci minha senha
            </a>
            <div className="text-gray-500 text-sm">
              Não tem conta?{' '}
              <a href="#" className="text-green-600 hover:text-green-700 font-medium">
                Entre em contato
              </a>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Shield, Lock, ArrowLeft, Terminal } from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

export default function AdminLoginPage() {
  const [cpf, setCpf] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  
  const { loginAdmin } = useAdminAuth()
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

    // Simulação de login admin (mesmo CPF e senha)
    setTimeout(() => {
      if (cpfLimpo === '98660608291' && senha === 'yvens123') {
        loginAdmin({
          id: '1',
          nome: 'Administrador',
          cpf: cpfLimpo,
          email: 'admin@entropia.edu.br',
          role: 'admin'
        })
        router.push('/admin/dashboard')
      } else {
        setErro('CPF ou senha incorretos')
      }
      setCarregando(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      {/* Efeitos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-400/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Botão Voltar */}
      <Link 
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors z-10"
      >
        <ArrowLeft size={20} />
        <span>Voltar ao site</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-green-500 to-green-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="text-black" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Painel <span className="text-green-400">Administrativo</span>
          </h1>
          <p className="text-gray-400 flex items-center justify-center gap-2">
            <Terminal size={16} />
            Acesso restrito a administradores
          </p>
        </div>

        {/* Formulário */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-xl rounded-3xl border border-green-500/30 shadow-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* CPF */}
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-300 mb-2">
                CPF do Administrador
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type="text"
                  id="cpf"
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                  placeholder="000.000.000-00"
                  className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-600 rounded-2xl focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors text-white placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-300 mb-2">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                  type={mostrarSenha ? "text" : "password"}
                  id="senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-12 py-3 bg-gray-900/50 border border-gray-600 rounded-2xl focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors text-white placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
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
                className="bg-red-900/50 border border-red-500/50 rounded-2xl p-3 text-red-300 text-sm"
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
              className="w-full bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 disabled:from-gray-600 disabled:to-gray-500 text-black font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {carregando ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Acessando painel...
                </>
              ) : (
                <>
                  <Shield size={20} />
                  Acessar Painel
                </>
              )}
            </motion.button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <div className="text-gray-500 text-sm">
              Problemas com acesso?{' '}
              <a href="mailto:admin@entropia.edu.br" className="text-green-400 hover:text-green-300 font-medium">
                Contate o suporte
              </a>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  )
}
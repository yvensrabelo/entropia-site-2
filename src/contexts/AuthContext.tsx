'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Usuario } from '@/lib/supabase'

interface AuthContextType {
  usuario: Usuario | null
  logado: boolean
  login: (cpf: string, senha: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  carregando: boolean
}

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [carregando, setCarregando] = useState(true)

  // Verificar se há usuário logado no localStorage
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('entropia_usuario')
    if (usuarioSalvo) {
      try {
        const userData = JSON.parse(usuarioSalvo)
        setUsuario(userData)
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
        localStorage.removeItem('entropia_usuario')
      }
    }
    setCarregando(false)
  }, [])

  const login = async (cpf: string, senha: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Remove formatação do CPF
      const cpfLimpo = cpf.replace(/\D/g, '')
      
      // Verificar se Supabase está configurado
      if (!supabase) {
        // Fallback: Login de demonstração
        if (cpfLimpo === '12345678901' && senha === 'demo123') {
          const usuarioDemo = {
            id: 'demo-user',
            nome: 'Usuário Demonstração',
            cpf: cpfLimpo,
            email: 'demo@entropia.edu.br',
            turma: 'Turma Demo',
            situacao: 'ativo' as const,
            data_matricula: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          setUsuario(usuarioDemo)
          localStorage.setItem('entropia_usuario', JSON.stringify(usuarioDemo))
          return { success: true }
        }
        return { success: false, error: 'Credenciais inválidas (modo demonstração)' }
      }
      
      // Buscar usuário pelo CPF
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('cpf', cpfLimpo)
        .eq('situacao', 'ativo')
        .single()

      if (error || !usuarios) {
        return { success: false, error: 'CPF não encontrado ou usuário inativo' }
      }

      // Por enquanto, usar senha simples (em produção, usar hash)
      // TODO: Implementar bcrypt para hash de senhas
      if (senha !== 'yvens123') {
        return { success: false, error: 'Senha incorreta' }
      }

      const usuarioLogado: Usuario = {
        id: usuarios.id,
        nome: usuarios.nome,
        cpf: usuarios.cpf,
        email: usuarios.email,
        telefone: usuarios.telefone,
        turma: usuarios.turma,
        situacao: usuarios.situacao,
        data_matricula: usuarios.data_matricula,
        created_at: usuarios.created_at,
        updated_at: usuarios.updated_at
      }

      setUsuario(usuarioLogado)
      localStorage.setItem('entropia_usuario', JSON.stringify(usuarioLogado))
      
      return { success: true }
    } catch (error) {
      console.error('Erro no login:', error)
      return { success: false, error: 'Erro interno do servidor' }
    }
  }

  const logout = () => {
    setUsuario(null)
    localStorage.removeItem('entropia_usuario')
  }

  const value = {
    usuario,
    logado: !!usuario,
    login,
    logout,
    carregando
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
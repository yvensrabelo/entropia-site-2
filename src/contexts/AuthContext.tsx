'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Tipos
interface Usuario {
  id: string
  nome: string
  cpf: string
  email: string
  turma: string
}

interface AuthContextType {
  usuario: Usuario | null
  logado: boolean
  login: (userData: Usuario) => void
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

  const login = (userData: Usuario) => {
    setUsuario(userData)
    localStorage.setItem('entropia_usuario', JSON.stringify(userData))
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
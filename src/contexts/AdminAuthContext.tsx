'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Tipos
interface AdminUsuario {
  id: string
  nome: string
  cpf: string
  email: string
  role: 'admin'
}

interface AdminAuthContextType {
  admin: AdminUsuario | null
  logadoAdmin: boolean
  loginAdmin: (userData: AdminUsuario) => void
  logoutAdmin: () => void
  carregandoAdmin: boolean
}

// Context
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

// Provider
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUsuario | null>(null)
  const [carregandoAdmin, setCarregandoAdmin] = useState(true)

  // Verificar se há admin logado no localStorage
  useEffect(() => {
    const adminSalvo = localStorage.getItem('entropia_admin')
    if (adminSalvo) {
      try {
        const adminData = JSON.parse(adminSalvo)
        setAdmin(adminData)
      } catch (error) {
        console.error('Erro ao carregar dados do admin:', error)
        localStorage.removeItem('entropia_admin')
      }
    }
    setCarregandoAdmin(false)
  }, [])

  const loginAdmin = (userData: AdminUsuario) => {
    setAdmin(userData)
    localStorage.setItem('entropia_admin', JSON.stringify(userData))
  }

  const logoutAdmin = () => {
    setAdmin(null)
    localStorage.removeItem('entropia_admin')
  }

  const value = {
    admin,
    logadoAdmin: !!admin,
    loginAdmin,
    logoutAdmin,
    carregandoAdmin
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

// Hook personalizado
export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth deve ser usado dentro de um AdminAuthProvider')
  }
  return context
}
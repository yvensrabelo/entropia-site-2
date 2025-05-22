'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { logado, carregando } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!carregando && !logado) {
      router.push('/login')
    }
  }, [logado, carregando, router])

  // Mostrar loading enquanto verifica autenticação
  if (carregando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não estiver logado, não renderizar nada (redirecionamento acontecerá)
  if (!logado) {
    return null
  }

  // Se estiver logado, renderizar o conteúdo
  return <>{children}</>
}
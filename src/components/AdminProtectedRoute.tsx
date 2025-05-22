'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface AdminProtectedRouteProps {
  children: React.ReactNode
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { logadoAdmin, carregandoAdmin } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!carregandoAdmin && !logadoAdmin) {
      router.push('/admin/login')
    }
  }, [logadoAdmin, carregandoAdmin, router])

  // Mostrar loading enquanto verifica autenticação
  if (carregandoAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-400">Carregando painel administrativo...</p>
        </div>
      </div>
    )
  }

  // Se não estiver logado, não renderizar nada (redirecionamento acontecerá)
  if (!logadoAdmin) {
    return null
  }

  // Se estiver logado, renderizar o conteúdo
  return <>{children}</>
}
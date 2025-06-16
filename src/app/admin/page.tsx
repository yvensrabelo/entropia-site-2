'use client'

import AuthGuard from '@/components/admin/AuthGuard'

export default function AdminPage() {
  return (
    <AuthGuard>
      {typeof window !== 'undefined' && (window.location.href = '/admin/dashboard')}
      <div>Redirecionando...</div>
    </AuthGuard>
  )
}
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AlunoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
}
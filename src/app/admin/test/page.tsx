import AuthGuard from '@/components/admin/AuthGuard';

export const dynamic = 'force-dynamic'

export default function TestPage() {
  return (
    <AuthGuard>
      <div style={{ padding: '40px', fontSize: '24px', fontWeight: 'bold' }}>
        TESTE - Se você vê isso, o roteamento funciona!
      </div>
    </AuthGuard>
  )
}
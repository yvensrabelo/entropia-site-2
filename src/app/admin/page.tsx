import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  console.log('🔍 Admin Page - Redirecionando para dashboard')
  redirect('/admin/dashboard');
}
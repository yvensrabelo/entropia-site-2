import { redirect } from 'next/navigation';

export default function AdminPage() {
  console.log('🔍 Admin Page - Redirecionando para dashboard')
  redirect('/admin/dashboard');
}
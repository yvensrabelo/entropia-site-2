'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-singleton';
import { LogOut, User } from 'lucide-react';

export default function AdminHeader() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    loadAdminInfo();
  }, []);

  async function loadAdminInfo() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('id, email, role')
          .eq('id', session.user.id)
          .single();

        if (adminUser) {
          setAdminName(session.user.email?.split('@')[0] || 'Admin');
          setAdminEmail(session.user.email || '');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar informações do admin:', error);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <div className="bg-gray-800 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-semibold text-white">Painel Administrativo</h1>
          
          <div className="flex items-center space-x-4">
            {adminName && (
              <div className="flex items-center space-x-2 text-gray-300">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">{adminName}</span>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
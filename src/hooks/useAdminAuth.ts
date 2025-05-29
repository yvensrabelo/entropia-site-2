'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-singleton';

interface AdminAuthState {
  isAdmin: boolean;
  loading: boolean;
  user: any;
  error: string | null;
}

export function useAdminAuth() {
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    loading: true,
    user: null,
    error: null,
  });

  const checkAdminStatus = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Verificar se há um usuário autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(`Erro de autenticação: ${userError.message}`);
      }

      if (!user) {
        setState({
          isAdmin: false,
          loading: false,
          user: null,
          error: 'Usuário não autenticado',
        });
        return;
      }

      // Verificar se o usuário é admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('user_id, created_at')
        .eq('user_id', user.id)
        .single();

      if (adminError && adminError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Erro ao verificar status de admin:', adminError);
      }

      setState({
        isAdmin: !!adminData,
        loading: false,
        user,
        error: null,
      });

    } catch (error: any) {
      console.error('Erro na verificação de admin:', error);
      setState({
        isAdmin: false,
        loading: false,
        user: null,
        error: error.message || 'Erro ao verificar permissões',
      });
    }
  };

  useEffect(() => {
    checkAdminStatus();

    // Escutar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setState({
          isAdmin: false,
          loading: false,
          user: null,
          error: null,
        });
      } else if (event === 'SIGNED_IN' && session?.user) {
        checkAdminStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refetch = () => {
    checkAdminStatus();
  };

  return {
    ...state,
    refetch,
  };
}
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-singleton';
import { UserPlus, Trash2, Shield, AlertCircle, Loader2 } from 'lucide-react';
import AuthGuard from '@/components/admin/AuthGuard';
import { useToast } from '@/components/ui/PremiumToast';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Admin {
  id: string;
  user_id: string;
  email?: string;
  created_at: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [removingAdminId, setRemovingAdminId] = useState<string | null>(null);
  
  const { isAdmin, loading: authLoading } = useAdminAuth();
  const toast = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchAdmins();
    }
  }, [isAdmin]);


  const fetchAdmins = async () => {
    try {
      // Buscar todos os admins
      const { data: adminsData, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Para cada admin, buscar o email do auth.users
      const adminsWithEmail = await Promise.all(
        (adminsData || []).map(async (admin) => {
          try {
            // Buscar email do usuário
            const { data: { user } } = await supabase.auth.admin.getUserById(admin.user_id);
            return {
              ...admin,
              email: user?.email || 'Email não encontrado'
            };
          } catch {
            // Se não conseguir buscar via admin API, deixar sem email
            return {
              ...admin,
              email: 'Email não disponível'
            };
          }
        })
      );

      setAdmins(adminsWithEmail);
    } catch (error) {
      console.error('Erro ao buscar admins:', error);
      
      // Fallback: buscar apenas da tabela admins
      try {
        const { data: adminsData } = await supabase
          .from('admins')
          .select('*')
          .order('created_at', { ascending: false });
        
        setAdmins(adminsData || []);
      } catch (fallbackError) {
        toast.handleError(fallbackError, 'Erro ao carregar admins');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast.error('Digite um email válido');
      return;
    }

    setAddingAdmin(true);

    try {
      // Primeiro, tentar buscar o usuário pelo email usando RPC ou função
      // Como não temos acesso direto ao auth.users, vamos usar uma abordagem alternativa

      // Buscar o usuário pelo email usando a função RPC
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_by_email', { user_email: newAdminEmail.toLowerCase() });

      if (userError) {
        console.error('Erro ao buscar usuário:', userError);
        toast.handleError(userError, 'Erro ao buscar usuário. Verifique se a função RPC foi criada no Supabase.');
        return;
      }

      if (!userData || userData.length === 0) {
        toast.error('Usuário não encontrado com este email');
        return;
      }

      const user = userData[0];

      // Verificar se já é admin
      const { data: existingAdminCheck } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (existingAdminCheck) {
        toast.error('Este usuário já é admin');
        return;
      }

      // Adicionar como admin
      const { error: insertError } = await supabase
        .from('admins')
        .insert({
          user_id: user.id
        });

      if (insertError) throw insertError;

      toast.success('Admin adicionado com sucesso!');
      setNewAdminEmail('');
      fetchAdmins();
    } catch (error: any) {
      console.error('Erro ao adicionar admin:', error);
      toast.handleError(error, 'Erro ao adicionar admin');
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string, email?: string) => {
    if (!confirm(`Tem certeza que deseja remover ${email || 'este admin'}?`)) {
      return;
    }

    setRemovingAdminId(adminId);

    try {
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      toast.success('Admin removido com sucesso!');
      setAdmins(admins.filter(admin => admin.id !== adminId));
    } catch (error: any) {
      console.error('Erro ao remover admin:', error);
      toast.handleError(error, 'Erro ao remover admin');
    } finally {
      setRemovingAdminId(null);
    }
  };

  if (authLoading) {
    return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
            <p className="text-gray-400">Verificando permissões...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!isAdmin) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
          <div className="max-w-md mx-auto">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center backdrop-blur-sm">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-red-400 mb-4">Acesso Negado</h2>
              <p className="text-gray-300 mb-6">Você não tem permissão para acessar esta área administrativa.</p>
              <div className="h-1 bg-red-500/20 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                <Shield className="w-8 h-8 text-green-400" />
              </div>
              Gerenciamento de Admins
            </h1>
            <p className="text-gray-400 mt-3 text-lg">Gerencie os administradores do sistema com total controle</p>
          </div>

          {/* Adicionar Admin */}
          <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-6 mb-8 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <UserPlus className="w-6 h-6 text-green-400" />
              Adicionar Novo Admin
            </h2>
            <div className="flex gap-4">
              <input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
                placeholder="Digite o email do usuário"
                className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
                disabled={addingAdmin}
              />
              <LoadingButton
                onClick={handleAddAdmin}
                loading={addingAdmin}
                disabled={!newAdminEmail.trim()}
                variant="primary"
                size="md"
                className="bg-green-600 hover:bg-green-700 border-green-500/50"
              >
                <UserPlus className="w-5 h-5" />
                Adicionar Admin
              </LoadingButton>
            </div>
          </div>

          {/* Lista de Admins */}
          <div className="bg-gray-800 rounded-xl border border-gray-700/50 overflow-hidden backdrop-blur-sm">
            <div className="px-6 py-5 border-b border-gray-700/50">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-400" />
                Admins Atuais
                <span className="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-medium">
                  {admins.length}
                </span>
              </h2>
            </div>

            {loading ? (
              <div className="p-16 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-green-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Carregando admins...</p>
              </div>
            ) : admins.length === 0 ? (
              <div className="p-16 text-center">
                <Shield className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                <p className="text-gray-400 text-lg">Nenhum admin cadastrado</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700/30">
                {admins.map((admin) => (
                  <div key={admin.id} className="px-6 py-5 flex items-center justify-between hover:bg-gray-700/30 transition-colors group">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                          <Shield className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-lg">
                            {admin.email || 'Email não disponível'}
                          </p>
                          <p className="text-sm text-gray-400">
                            ID: {admin.user_id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 ml-13">
                        Adicionado em {new Date(admin.created_at).toLocaleDateString('pt-BR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <LoadingButton
                      onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                      loading={removingAdminId === admin.id}
                      variant="danger"
                      size="sm"
                      className="bg-red-500/20 hover:bg-red-500/30 border-red-500/30 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remover
                    </LoadingButton>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nota sobre RPC */}
          <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30 flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-blue-300 font-medium mb-3">
                  <strong>Configuração Necessária:</strong> Para adicionar novos admins, você precisa criar uma função RPC no Supabase 
                  que permita buscar o user_id pelo email.
                </p>
                <pre className="text-xs bg-gray-900/50 p-4 rounded-lg overflow-x-auto border border-gray-700/50 text-gray-300">
{`CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE(id UUID, email TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT au.id, au.email::TEXT
  FROM auth.users au
  WHERE au.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`}
                </pre>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AuthGuard>
  );
}
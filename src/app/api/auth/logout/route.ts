import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    console.log('=== INICIANDO PROCESSO DE LOGOUT ===');
    
    // Criar cliente Supabase com as variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Variáveis de ambiente Supabase não configuradas');
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Fazer logout no Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer signOut:', error);
    }
    
    // Criar resposta
    const response = NextResponse.json({ success: true });
    
    // Extrair project ref da URL do Supabase
    const projectRef = supabaseUrl.split('.')[0].replace('https://', '');
    
    // Lista de todos os possíveis cookies do Supabase
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      `sb-${projectRef}-auth-token`,
      `sb-${projectRef}-auth-token-code-verifier`,
      'supabase-auth-token',
      // Cookies com prefixos diferentes que podem existir
      `sb.${projectRef}.auth-token`,
      `sb-${projectRef}-auth.access-token`,
      `sb-${projectRef}-auth.refresh-token`,
    ];
    
    console.log('Cookies a limpar:', cookiesToClear);
    
    // Limpar TODOS os cookies relacionados
    cookiesToClear.forEach(cookieName => {
      // Limpar com diferentes configurações de path e domain
      response.cookies.set(cookieName, '', {
        maxAge: 0,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      // Também tentar limpar sem httpOnly (alguns cookies podem não ter essa flag)
      response.cookies.set(cookieName, '', {
        maxAge: 0,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });
    
    // Limpar localStorage e sessionStorage via header customizado
    response.headers.set('Clear-Storage', 'true');
    
    console.log('=== LOGOUT COMPLETO ===');
    
    return response;
  } catch (error) {
    console.error('=== ERRO NO LOGOUT ===');
    console.error('Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao fazer logout', details: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    );
  }
}
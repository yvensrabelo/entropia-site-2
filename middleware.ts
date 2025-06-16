import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Rotas que NÃO precisam de autenticação
const publicRoutes = ['/admin/login', '/', '/matricula', '/api/matricula']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Se for rota pública, permitir acesso
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Para rotas protegidas, verificar autenticação
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    try {
      // Obter token do cookie
      const token = request.cookies.get('sb-access-token')?.value
      
      if (!token) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }
        
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      // Verificar token com Supabase
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (error || !user) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
        }
        
        const response = NextResponse.redirect(new URL('/admin/login', request.url))
        response.cookies.delete('sb-access-token')
        response.cookies.delete('entropia_admin')
        return response
      }

      // Verificar se é admin
      const { data: profile } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Acesso negado - admin necessário' }, { status: 403 })
        }
        
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }

      return NextResponse.next()

    } catch (error) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Erro na autenticação' }, { status: 500 })
      }
      
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // Para outras rotas protegidas que possam existir
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ],
}
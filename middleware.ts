import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()

  // URLs para verificação
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = req.nextUrl.pathname === '/admin/login'
  const isAdminDashboard = req.nextUrl.pathname.startsWith('/admin/dashboard')

  // Se está em uma rota admin (exceto login) e não está autenticado
  if (isAdminRoute && !isLoginPage && !session) {
    // Redireciona para login
    const redirectUrl = new URL('/admin/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se está na página de login e já está autenticado
  if (isLoginPage && session) {
    // Verifica se é admin
    const { data: adminUser } = await supabase
      .from('admins')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (adminUser) {
      // Redireciona para dashboard
      const redirectTo = req.nextUrl.searchParams.get('redirectTo') || '/admin/dashboard'
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }
  }

  // Se está tentando acessar o dashboard sem ser admin
  if (isAdminDashboard && session) {
    const { data: adminUser } = await supabase
      .from('admins')
      .select('*')
      .eq('email', session.user.email)
      .single()

    if (!adminUser) {
      // Não é admin, redireciona para login
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return res
}

// Configuração do matcher - aplica o middleware apenas nas rotas especificadas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
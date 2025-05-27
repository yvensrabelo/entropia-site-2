import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Apenas proteja rotas admin por enquanto
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Verificação básica por cookie
    const hasAccessToken = request.cookies.has('sb-jvrrrcgqpjhhqshxuexf-auth-token')
    const isLoginPage = request.nextUrl.pathname === '/admin/login'
    
    if (!hasAccessToken && !isLoginPage) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    if (hasAccessToken && isLoginPage) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }
  
  return NextResponse.next()
}

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
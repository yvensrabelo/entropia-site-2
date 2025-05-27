import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Não fazer nada por enquanto - apenas retornar
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
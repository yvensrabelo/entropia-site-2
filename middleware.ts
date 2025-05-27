import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Temporariamente desabilitar verificação
  return NextResponse.next()
}

export const config = {
  matcher: []
}
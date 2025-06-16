import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface AuthResult {
  isValid: boolean
  user?: any
  error?: string
}

/**
 * Verifica se a requisição tem autorização válida de admin
 */
export async function verifyAdminAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Tentar obter token do header Authorization
    const authHeader = request.headers.get('authorization')
    let token: string | undefined

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else {
      // Fallback: tentar obter do cookie
      token = request.cookies.get('sb-access-token')?.value
    }

    if (!token) {
      return {
        isValid: false,
        error: 'Token de acesso não encontrado'
      }
    }

    // Verificar token com Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return {
        isValid: false,
        error: 'Token inválido ou expirado'
      }
    }

    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('admin_users')
      .select('role, nome, email')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return {
        isValid: false,
        error: 'Usuário não tem permissões de administrador'
      }
    }

    return {
      isValid: true,
      user: {
        id: user.id,
        email: user.email,
        nome: profile.nome,
        role: profile.role
      }
    }

  } catch (error) {
    console.error('❌ [AUTH-API] Erro na verificação:', error)
    return {
      isValid: false,
      error: 'Erro interno na verificação de autenticação'
    }
  }
}

/**
 * Rate limiting simples baseado em IP
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    // Resetar ou criar novo record
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + windowMs
    })
    return true
  }

  if (record.count >= maxRequests) {
    return false // Rate limit exceeded
  }

  record.count++
  return true
}

/**
 * Obtém o IP da requisição
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return request.ip || 'unknown'
}
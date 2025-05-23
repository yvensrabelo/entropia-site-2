import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Verificar se as variáveis de ambiente estão definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Criar cliente Supabase com tipagem
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions para auth
export const signUp = async (email: string, password: string, metadata: {
  cpf: string
  full_name: string
  phone?: string
  role?: 'student' | 'admin' | 'teacher'
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  return { data, error }
}

export const getStudentData = async (profileId: string) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('profile_id', profileId)
    .single()
    
  return { data, error }
}

// Função para buscar usuário por CPF (para login)
export const getUserByCPF = async (cpf: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, cpf, full_name, role')
    .eq('cpf', cpf)
    .single()
    
  return { data, error }
}

// Função para log de acesso
export const logAccess = async (action: string, resource?: string) => {
  const user = await getCurrentUser()
  
  // Obter IP do cliente (no servidor seria melhor)
  const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null)
  const ipData = ipResponse ? await ipResponse.json() : null
  
  const { error } = await supabase
    .from('access_logs')
    .insert({
      user_id: user?.id,
      action,
      resource,
      ip_address: ipData?.ip,
      user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null
    })
    
  if (error) console.error('Error logging access:', error)
}

// Função para salvar cálculo da calculadora
export const logCalculatorUse = async (data: {
  process: string
  course: string
  quota: string
  total_score: number
  cutoff_score: number
  approved: boolean
}) => {
  const user = await getCurrentUser()
  
  const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null)
  const ipData = ipResponse ? await ipResponse.json() : null
  
  const { error } = await supabase
    .from('calculator_logs')
    .insert({
      user_id: user?.id,
      ...data,
      ip_address: ipData?.ip
    })
    
  if (error) console.error('Error logging calculator use:', error)
}
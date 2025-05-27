import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

let supabase: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
  if (supabase) return supabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  supabase = createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )

  return supabase
}

// Re-export helper functions from old file
export { 
  signUp, 
  signIn, 
  signOut, 
  getCurrentUser, 
  getProfile, 
  getStudentData,
  getUserByCPF,
  logAccess,
  logCalculatorUse
} from '../supabase-client'
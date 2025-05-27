import { createBrowserClient } from '@supabase/ssr'

// Singleton pattern para garantir única instância
class SupabaseSingleton {
  private static instance: any = null

  static getInstance() {
    if (!this.instance) {
      this.instance = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    }
    return this.instance
  }
}

export const supabase = SupabaseSingleton.getInstance()
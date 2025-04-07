import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

// Type-safe configuration check
const getSupabaseConfig = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(`
      Missing Supabase configuration.
      Please ensure your .env file contains:
      VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
    `)
  }

  return { supabaseUrl, supabaseKey }
}

// Singleton pattern with enhanced checks
let supabaseInstance: SupabaseClient<Database> | null = null

export const getSupabaseClient = (): SupabaseClient<Database> => {
  if (supabaseInstance) {
    // Check session validity using getSession() which returns a Promise
    supabaseInstance.auth.getSession()
      .then(({ data: { session } }) => {
        if (!session) {
          supabaseInstance = null
        }
      })
      .catch(() => {
        supabaseInstance = null
      })
  }

  if (!supabaseInstance) {
    const { supabaseUrl, supabaseKey } = getSupabaseConfig()
    
    supabaseInstance = createSupabaseClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'supabase.auth.token',
        flowType: 'pkce' // More secure auth flow
      },
      global: {
        headers: {
          'X-Client-Info': 'my-app/1.0'
        }
      }
    })
  }

  return supabaseInstance
}

// Default exported client instance with memoization
export const supabase = /*#__PURE__*/ getSupabaseClient()

// Type exports for usage throughout the app
export type { Database }
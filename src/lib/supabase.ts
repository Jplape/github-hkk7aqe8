import { createClient } from '@supabase/supabase-js'

// Get environment variables with type checking
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Validate environment variables
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL environment variable is not set')
}

if (!supabaseKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY environment variable is not set')
}

// Create Supabase client with validated credentials
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
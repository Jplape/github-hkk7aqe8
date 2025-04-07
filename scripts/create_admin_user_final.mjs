import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

const ADMIN_EMAIL = 'admin@esttmco.com'
const ADMIN_PASSWORD = 'Admin123'

async function createAdminUser() {
  console.log(`Creating admin user: ${ADMIN_EMAIL}`)

  const { data, error } = await supabase.auth.signUp({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    options: {
      data: {
        role: 'admin',
        full_name: 'Administrator'
      }
    }
  })

  if (error) {
    console.error('Error creating admin user:', error.message)
    return
  }

  console.log('Admin user created successfully:', data)
}

createAdminUser().catch(console.error)
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

// Nécessite la clé de service Supabase (SUPABASE_SERVICE_KEY dans .env)
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseKey) {
  console.error('Erreur: SUPABASE_SERVICE_KEY manquante dans .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
})

async function checkAdminUser() {
  try {
    console.log('=== Vérification sécurisée ===')

    // 1. Vérification via l'API admin
    const { data: { users }, error } = await supabase.auth.admin.listUsers()
    if (error) throw error

    const adminUser = users.find(u => u.email === 'admin@esttmco.com')
    console.log('\n1. Résultat auth.admin.listUsers():')
    console.log(adminUser ? 'TROUVÉ' : 'NON TROUVÉ')
    if (adminUser) {
      console.log('Détails:', {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.user_metadata?.role,
        created_at: adminUser.created_at
      })
    }

    // 2. Vérification RLS
    console.log('\n2. Test RLS (nécessite une session):')
    const { data: { user } } = await supabase.auth.getUser()
    console.log(user ? `Connecté en tant que: ${user.email}` : 'Non connecté')

  } catch (error) {
    console.error('Erreur:', error.message)
  }
}

checkAdminUser()
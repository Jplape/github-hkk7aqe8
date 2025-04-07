import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAdminUser() {
  console.log('=== Vérification de l\'utilisateur admin ===')

  // 1. Vérification dans auth.users via l'API admin
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('Erreur auth:', authError.message)
    return
  }

  const adminAuthUser = users.find(u => u.email === 'admin@esttmco.com')
  console.log('\n1. Dans auth.users (Supabase):')
  console.log(adminAuthUser ? 'TROUVÉ - Détails:' : 'NON TROUVÉ')
  if (adminAuthUser) {
    console.log({
      id: adminAuthUser.id,
      email: adminAuthUser.email,
      role: adminAuthUser.user_metadata?.role,
      created_at: new Date(adminAuthUser.created_at).toLocaleString()
    })
  }

  // 2. Vérification dans la table publique app_user
  const { data: appUserData, error: appUserError } = await supabase
    .from('app_user')
    .select('*')
    .eq('email', 'admin@esttmco.com')

  console.log('\n2. Dans app_user (table publique):')
  if (appUserError) {
    console.error('Erreur:', appUserError.message)
  } else if (appUserData.length > 0) {
    console.log('TROUVÉ - Détails:', appUserData[0])
  } else {
    console.log('NON TROUVÉ (le trigger de synchronisation peut être manquant)')
  }

  // 3. Vérification via l'API standard
  console.log('\n3. Via l\'API standard (auth.getUser):')
  const { data: { user }, error: getUserError } = await supabase.auth.getUser()
  if (getUserError) {
    console.error('Erreur:', getUserError.message)
  } else if (user?.email === 'admin@esttmco.com') {
    console.log('TROUVÉ - Détails:', {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role
    })
  } else {
    console.log('NON TROUVÉ (nécessite une session active)')
  }
}

checkAdminUser().catch(console.error)
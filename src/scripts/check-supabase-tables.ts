import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_KEY!

const supabase = createClient(supabaseUrl, serviceKey)

async function listTables() {
  // Utilisation de la fonction RPC pour lister les tables
  const { data, error } = await supabase
    .rpc('get_tables')
    
  if (error) {
    console.error('Error fetching tables:', error)
    return
  }

  console.log('Tables in database:')
  console.table(data)
}

listTables().catch(console.error)

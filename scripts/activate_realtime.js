import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function enableRealtime() {
  const { data, error } = await supabase
    .rpc('alter_table_realtime', { table_name: 'tasks' })

  if (error) {
    console.error('Error enabling realtime:', error)
    return
  }
  console.log('Realtime enabled for tasks table')
}

enableRealtime()
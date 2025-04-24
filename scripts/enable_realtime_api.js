import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function enableRealtime() {
  const { data, error } = await supabase
    .rpc('enable_realtime_for_table', { 
      table_name: 'tasks' 
    })

  if (error) {
    console.error('Error enabling realtime:', error)
  } else {
    console.log('Realtime successfully enabled:', data)
  }
}

enableRealtime()
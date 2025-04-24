import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY,
  {
    db: {
      schema: 'public'
    }
  }
)

async function enableRealtimeDirect() {
  // Utilisation d'une transaction SQL via rpc
  const { data, error } = await supabase.rpc('execute_sql', {
    query: `
      BEGIN;
      ALTER TABLE tasks ENABLE REPLICA TRIGGER ALL;
      ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
      COMMIT;
    `
  })

  if (error) {
    console.error('Error enabling realtime:', error)
    return
  }
  console.log('Realtime successfully enabled for tasks table')
}

enableRealtimeDirect()
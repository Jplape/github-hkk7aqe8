import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Client } = pg

async function enableRealtime() {
  const dbUrl = new URL(process.env.VITE_SUPABASE_URL.replace('co', 'in'))
  const client = new Client({
    host: dbUrl.hostname,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: process.env.SUPABASE_SERVICE_KEY,
    ssl: { rejectUnauthorized: false }
  })

  try {
    await client.connect()
    await client.query(`
      BEGIN;
      ALTER TABLE tasks ENABLE REPLICA TRIGGER ALL;
      ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
      COMMIT;
    `)
    console.log('Realtime successfully enabled for tasks table')
  } catch (error) {
    console.error('Error enabling realtime:', error)
  } finally {
    await client.end()
  }
}

enableRealtime()
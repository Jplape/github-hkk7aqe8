import { createClient } from '@supabase/supabase-js'
import minimist from 'minimist'
import 'dotenv/config'

// Configuration des tests
const args = minimist(process.argv.slice(2), {
  iterations: 1000,
  concurrency: 50,
  delay: 100
})

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
)

// Authentification avec le compte admin existant
const { error: signInError } = await supabase.auth.signInWithPassword({
  email: 'admin@esttmco.com',
  password: 'admin'
})

if (signInError) {
  throw signInError
}

// Vérification que la table 'tasks' existe
const { data: tables } = await supabase
  .from('pg_tables')
  .select('tablename')
  .eq('schemaname', 'public')

if (!tables?.some(t => t.tablename === 'task')) {
  throw new Error("La table 'task' n'existe pas dans la base de données")
}

// Fonction de test individuel
async function runSingleTest(testId) {
  try {
    const startTime = Date.now()
    
    // 1. Création de tâche test
    const { data: task } = await supabase
      .from('task')
      .insert({
        description: `Tâche test 17/04/2025`,
        status: 'pending',
        priority: 'medium',
        created_at: '2025-04-17T00:00:00Z'
      })
      .select()
      .single()

    // 2. Abonnement aux changements
    const channel = supabase
      .channel(`test_channel_${testId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tasks',
        filter: `id=eq.${task.id}`
      }, (payload) => {
        console.log(`[${testId}] Changement reçu après ${Date.now() - startTime}ms`)
      })
      .subscribe()

    // 3. Simulation de modification
    setTimeout(async () => {
      await supabase
        .from('task')
        .update({ status: 'completed' })
        .eq('id', task.id)
      
      channel.unsubscribe()
    }, args.delay)

    return { success: true, duration: Date.now() - startTime }
  } catch (error) {
    return { success: false, error }
  }
}

// Lancement des tests concurrents
async function runStressTest() {
  console.log(`Démarrage des tests: ${args.iterations} itérations, ${args.concurrency} concurrents`)
  
  const results = []
  const activeTests = new Set()
  
  for (let i = 0; i < args.iterations; i++) {
    while (activeTests.size >= args.concurrency) {
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    const testId = i
    activeTests.add(testId)
    
    runSingleTest(testId)
      .then(result => {
        results.push(result)
        activeTests.delete(testId)
      })
  }

  // Attente fin des tests
  while (activeTests.size > 0) {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Analyse des résultats
  const successes = results.filter(r => r.success)
  const avgDuration = successes.reduce((sum, r) => sum + r.duration, 0) / successes.length
  
  console.log(`\nRésultats:`)
  console.log(`- Réussite: ${successes.length}/${results.length}`)
  console.log(`- Latence moyenne: ${avgDuration.toFixed(2)}ms`)
}

runStressTest()
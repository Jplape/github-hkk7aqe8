const { checkTaskIntegrity } = require('../src/lib/api/taskIntegrityCheck');

async function test() {
  try {
    console.log("Début du test d'intégrité...");
    const result = await checkTaskIntegrity();
    
    console.log("Résultats :");
    console.log(`- Tâches manquantes: ${result.missing_count}`);
    console.log(`- Exemple d'IDs: ${result.missing_ids.slice(0, 3).join(', ')}`);
    console.log("- Analyse temporelle:");
    result.time_analysis.forEach(interval => {
      console.log(`  ${interval.interval}: ${interval.count} tâches`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors du test:", error);
    process.exit(1);
  }
}

test();
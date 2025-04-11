import { checkTaskIntegrity } from '../src/lib/api/taskIntegrityCheck';

async function main() {
  try {
    console.log("🚀 Test d'intégrité des tâches en cours...");
    
    const result = await checkTaskIntegrity();
    
    console.log("✅ Résultats :");
    console.log(`Tâches manquantes: ${result.missing_count}`);
    console.log(`Exemples d'IDs: ${result.missing_ids.slice(0, 5).join(', ')}`);
    
    if (result.time_analysis?.length > 0) {
      console.log("\nAnalyse temporelle:");
      result.time_analysis.forEach(period => {
        console.log(`- ${period.interval}: ${period.count} tâches`);
      });
    }
    
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
}

main();
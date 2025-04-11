import { checkTaskIntegrity } from '../src/lib/api/taskIntegrityCheck.js';

async function main() {
  try {
    console.log("🚀 Lancement du test d'intégrité des tâches...");
    
    const result = await checkTaskIntegrity();
    
    console.log("✅ Résultats du test :");
    console.log(`- Nombre de tâches manquantes: ${result.missing_count}`);
    
    if (result.missing_count > 0) {
      console.log(`- IDs manquants (5 premiers): ${result.missing_ids.slice(0, 5).join(', ')}`);
      console.log("- Analyse temporelle :");
      result.time_analysis.forEach(item => {
        console.log(`  Période ${item.interval}: ${item.count} tâches`);
      });
    } else {
      console.log("✔ Toutes les tâches sont correctement synchronisées");
    }
    
  } catch (error) {
    console.error("❌ Erreur lors du test:", error);
    process.exit(1);
  }
}

main();
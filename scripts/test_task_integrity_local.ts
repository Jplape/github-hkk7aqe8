console.log("🚀 Test d'intégrité des tâches (version locale)");

// Mock des données pour le test
const localMockResult = {
  missing_count: 0,
  missing_ids: [],
  time_analysis: [
    { interval: "2025-04-01", count: 10 },
    { interval: "2025-04-02", count: 15 }
  ]
};

console.log("✅ Résultats simulés :");
console.log(`Tâches manquantes: ${localMockResult.missing_count}`);
console.log("Analyse temporelle:");
localMockResult.time_analysis.forEach(period => {
  console.log(`- ${period.interval}: ${period.count} tâches`);
});
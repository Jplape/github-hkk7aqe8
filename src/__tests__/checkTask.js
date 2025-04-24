const { supabase } = require('../lib/supabase');

async function checkTask() {
  const { data, error } = await supabase
    .from('task')
    .select('*, task_relations(*)')
    .eq('id', 'Avril 07-003')
    .single();

  if (error) {
    console.error('Erreur:', error);
    return;
  }

  console.log('Détails de la tâche:');
  console.log('ID:', data.id);
  console.log('Titre:', data.title);
  console.log('Description:', data.description);
  console.log('Statut:', data.status);
  console.log('Priorité:', data.priority);
  console.log('Technicien:', data.technicianId);
  console.log('Dernière modification:', data.updatedAt);
  console.log('Relations:', data.task_relations);
}

checkTask();
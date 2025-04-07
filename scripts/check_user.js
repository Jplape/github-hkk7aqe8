const { supabase } = require('../src/lib/supabase');

async function checkUserExists(email) {
  const { data, error } = await supabase
    .from('auth.users')
    .select('id, email, created_at')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Erreur lors de la vérification:', error.message);
    return false;
  }

  return data ? true : false;
}

const emailToCheck = 'admin@esttmco.com';
checkUserExists(emailToCheck)
  .then(exists => {
    if (exists) {
      console.log(`L'utilisateur ${emailToCheck} existe dans la base de données.`);
    } else {
      console.log(`L'utilisateur ${emailToCheck} n'existe pas dans la base de données.`);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Erreur:', err);
    process.exit(1);
  });
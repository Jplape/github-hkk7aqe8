const { supabase } = require('../src/lib/supabase');

const ADMIN_EMAIL = 'admin@esttmco.com';
const ADMIN_PASSWORD = 'admin';

async function createAdminUser() {
  console.log(`Creating admin user: ${ADMIN_EMAIL}`);

  const { data, error } = await supabase.auth.signUp({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    options: {
      data: {
        role: 'admin',
        full_name: 'Administrator'
      }
    }
  });

  if (error) {
    console.error('Error creating admin user:', error.message);
    return;
  }

  console.log('Admin user created successfully:', data);
}

createAdminUser().catch(console.error);
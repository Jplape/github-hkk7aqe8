import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

async function listTables() {
  try {
    const response = await fetch(
      `${process.env.VITE_SUPABASE_URL}/rest/v1/`,
      {
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
        }
      }
    );
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${error}`);
    }
    
    const data = await response.json();
    console.log('Tables disponibles dans la base de données:');
    console.log(Object.keys(data.paths).filter(path => path !== '/'));
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

listTables();
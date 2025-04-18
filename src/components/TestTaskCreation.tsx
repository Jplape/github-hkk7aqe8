import { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { supabase } from '../lib/supabase';

export default function TestTaskCreation() {
  const [description, setDescription] = useState('');
  const { addTask } = useTaskStore();
  const [verificationResult, setVerificationResult] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Création de la tâche
    await addTask({
      description,
      status: 'pending',
      updated_at: new Date().toISOString()
    });

    // Vérification dans Supabase après 2s
    setTimeout(async () => {
      const { data } = await supabase
        .from('task')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data?.description === description) {
        setVerificationResult(`✅ Tâche vérifiée dans Supabase (ID: ${data.id})`);
      } else {
        setVerificationResult('❌ La tâche n\'a pas été trouvée dans Supabase');
      }
    }, 2000);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Test de création de tâche</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description de la tâche"
          required
        />
        <button type="submit">Créer la tâche</button>
      </form>
      
      {verificationResult && (
        <div style={{ marginTop: '10px' }}>
          <p>{verificationResult}</p>
        </div>
      )}
    </div>
  );
}
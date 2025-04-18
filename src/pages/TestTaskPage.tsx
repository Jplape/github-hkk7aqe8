import { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function TestTaskPage() {
  const [description, setDescription] = useState('');
  const { addTask } = useTaskStore();
  const [verificationResult, setVerificationResult] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addTask({
        description,
        status: 'pending',
        updated_at: new Date().toISOString()
      });

      // Vérification dans Supabase
      setTimeout(async () => {
        const { data } = await supabase
          .from('task')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data?.description === description) {
          setVerificationResult(`✅ Tâche vérifiée (ID: ${data.id})`);
        } else {
          setVerificationResult('❌ Tâche non trouvée');
        }
      }, 2000);
    } catch (error) {
      setVerificationResult('❌ Erreur de création');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Test de synchronisation</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <button 
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tester la synchronisation
        </button>
      </form>

      {verificationResult && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p>{verificationResult}</p>
        </div>
      )}

      <button 
        onClick={() => navigate('/')}
        className="mt-4 text-blue-500 hover:underline"
      >
        Retour à l'accueil
      </button>
    </div>
  );
}
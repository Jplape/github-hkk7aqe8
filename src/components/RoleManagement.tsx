import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export default function RoleManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Non authentifié');

        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*');

        if (error) throw error;
        setUsers(profiles || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const updateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de mise à jour');
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Gestion des Rôles</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Nom</th>
              <th className="py-2 px-4 border">Rôle</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="py-2 px-4 border">{user.email}</td>
                <td className="py-2 px-4 border">{user.full_name}</td>
                <td className="py-2 px-4 border">
                  <select
                    value={user.role}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="technicien">Technicien</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </td>
                <td className="py-2 px-4 border">
                  <button 
                    onClick={() => updateRole(user.id, user.role === 'admin' ? 'technicien' : 'admin')}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

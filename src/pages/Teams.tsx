import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { useTeamStore, type TeamMember } from '../store/teamStore';
import TeamMemberCard from '../components/Teams/TeamMemberCard';
import TeamMemberForm from '../components/Teams/TeamMemberForm';
import { useSearchParams } from 'react-router-dom';

export default function Teams() {
  const { members, addMember, deleteMember } = useTeamStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    if (statusFilter !== 'all') {
      setSearchParams({ status: statusFilter });
    } else {
      setSearchParams({});
    }
  }, [statusFilter, setSearchParams]);

  const handleSubmit = (formData: Omit<TeamMember, 'id' | 'assignments' | 'completedTasks' | 'maxConcurrentTasks'>) => {
    addMember(formData);
    setIsModalOpen(false);
  };

  const handleDeleteClick = (member: TeamMember) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (memberToDelete) {
      deleteMember(memberToDelete.id);
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Équipes</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos équipes et suivez leurs activités
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un membre
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Rechercher un membre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-full text-sm ${
                  statusFilter === 'all'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setStatusFilter('available')}
                className={`px-3 py-1 rounded-full text-sm ${
                  statusFilter === 'available'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                Disponibles
              </button>
              <button
                onClick={() => setStatusFilter('busy')}
                className={`px-3 py-1 rounded-full text-sm ${
                  statusFilter === 'busy'
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                }`}
              >
                Occupés
              </button>
              <button
                onClick={() => setStatusFilter('offline')}
                className={`px-3 py-1 rounded-full text-sm ${
                  statusFilter === 'offline'
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Hors ligne
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 p-6">
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      </div>

      {/* Modal d'ajout */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">Ajouter un membre</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TeamMemberForm
              onSubmit={handleSubmit}
              onClose={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {isDeleteModalOpen && memberToDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Confirmer la suppression</h3>
              <p className="mt-2 text-sm text-gray-500">
                Êtes-vous sûr de vouloir supprimer {memberToDelete.name} ? Cette action est irréversible.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
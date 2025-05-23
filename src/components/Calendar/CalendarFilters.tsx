import { Filter, X } from 'lucide-react';
import { useTeamStore } from '../../store/teamStore';

interface CalendarFiltersProps {
  clients: string[]; // Array of client IDs
  filters: {
    technician: string;
    client: string;
  };
  onFilterChange: (filters: { technician: string; client: string }) => void;
  clientNames?: Record<string, string>; // Optional mapping of client IDs to names
}

export default function CalendarFilters({ clients, filters, onFilterChange, clientNames = {} }: CalendarFiltersProps) {
  const { members } = useTeamStore();
  const hasActiveFilters = filters.technician !== 'all' || filters.client !== 'all';

  const clearFilters = () => {
    onFilterChange({ technician: 'all', client: 'all' });
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Filter className="h-5 w-5 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Filtrer par :</span>
      </div>

      <select
        value={filters.technician}
        onChange={(e) => onFilterChange({ ...filters, technician: e.target.value })}
        className="block rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        aria-label="Filtrer par technicien"
      >
        <option value="all">Tous les techniciens</option>
        {members.map((member) => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>

      <select
        value={filters.client}
        onChange={(e) => onFilterChange({ ...filters, client: e.target.value })}
        className="block rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        aria-label="Filtrer par client"
      >
        <option value="all">Tous les clients</option>
        {clients.map((clientId) => (
          <option key={clientId} value={clientId}>
            {clientNames?.[clientId] || clientId}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="inline-flex items-center px-2 py-1 text-sm text-gray-500 hover:text-gray-700"
          aria-label="Réinitialiser les filtres"
        >
          <X className="h-4 w-4 mr-1" />
          Réinitialiser
        </button>
      )}
    </div>
  );
}
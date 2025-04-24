import { useState, useMemo, useEffect } from 'react';
import { Plus, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import TaskFilters from '../components/Tasks/TaskFilters';
import NewTaskModal from '../components/Calendar/NewTaskModal';
import { filterTasks } from '../utils/taskFilters';
import { useTaskSync } from '../hooks/useTaskSync';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Task } from '../types/task';
import { useSearchParams } from 'react-router-dom';

type SortField = 'id' | 'title' | 'date' | 'status' | 'technicianId' | 'client_id' | 'equipment';
type SortDirection = 'asc' | 'desc';

export default function Tasks() {
  const { tasks = [] } = useTaskStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState(() => ({
    status: searchParams.get('status') || 'all',
    priority: searchParams.get('priority') || 'all',
    technician: searchParams.get('technician') || 'all',
    client_id: searchParams.get('client_id') || 'all',
    equipment: searchParams.get('equipment') || 'all',
    assignment: searchParams.get('assignment') || 'all',
    date: searchParams.get('date') || 'all'
  }));

  // Enable task synchronization
  useTaskSync();

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== 'all') {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Get unique clients for filters
  const client_ids = Array.from(new Set(tasks.map(task => task.client_id || '')));

  const sortedAndFilteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    
    let filteredTasks = filterTasks(
      tasks.filter(task => {
        if (!task) return false;
        const titleMatch = (task.title || '').toLowerCase().includes(searchTerm.toLowerCase());
        const client_idMatch = (task.client_id || '').toLowerCase().includes(searchTerm.toLowerCase());
        const equipmentNameMatch = task.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const equipmentBrandMatch = task.equipment?.brand?.toLowerCase().includes(searchTerm.toLowerCase());
        const equipmentModelMatch = task.equipment?.model?.toLowerCase().includes(searchTerm.toLowerCase());
        const equipmentSerialMatch = task.equipment?.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());

        return (
          titleMatch || 
          client_idMatch ||
          equipmentNameMatch || 
          equipmentBrandMatch || 
          equipmentModelMatch || 
          equipmentSerialMatch
        );
      }),
      filters
    );

    return filteredTasks.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id, undefined, { numeric: true });
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'technicianId':
          comparison = (a.technicianId || '').localeCompare(b.technicianId || '');
          break;
        case 'client_id':
          comparison = (a.client_id || '').localeCompare(b.client_id || '');
          break;
        case 'equipment':
          comparison = (a.equipment?.name || '').localeCompare(b.equipment?.name || '');
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [tasks, searchTerm, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-4 w-4" /> : 
      <ArrowDown className="h-4 w-4" />;
  };

  // Initialize filters from URL params on component mount
  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setFilters(prev => ({ ...prev, status }));
    }
  }, [searchParams]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorListener = (e: ErrorEvent) => {
      console.error('Global error caught:', e.error);
      setError(e.message || 'Une erreur est survenue');
    };
    
    const unhandledRejectionListener = (e: PromiseRejectionEvent) => {
      console.error('Unhandled rejection:', e.reason);
      setError(e.reason?.message || 'Une erreur est survenue');
      // Log additional context for debugging
      console.group('Unhandled Rejection Context');
      console.log('Timestamp:', new Date().toISOString());
      console.log('Current tasks:', tasks.length);
      console.groupEnd();
    };

    window.addEventListener('error', errorListener);
    window.addEventListener('unhandledrejection', unhandledRejectionListener);
    
    return () => {
      window.removeEventListener('error', errorListener);
      window.removeEventListener('unhandledrejection', unhandledRejectionListener);
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 font-medium mb-2">Erreur</div>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tâches</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez et suivez toutes les tâches planifiées
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedTask(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle tâche
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Rechercher une tâche..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <TaskFilters
            onFilterChange={setFilters}
            clients={client_ids}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Numéro</span>
                    <SortIcon field="id" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Titre</span>
                    <SortIcon field="title" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('client_id')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Client</span>
                    <SortIcon field="client_id" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('equipment')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Équipement</span>
                    <SortIcon field="equipment" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Date</span>
                    <SortIcon field="date" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Statut</span>
                    <SortIcon field="status" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('technicianId')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Technicien</span>
                    <SortIcon field="technicianId" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredTasks.map((task) => (
                <tr 
                  key={task.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEditTask(task)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {task.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.client_id || 'Client inconnu'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      {task.equipment && (
                        <>
                          <div>{task.equipment.name || 'Équipement'}</div>
                          <div className="text-xs text-gray-400">
                            {task.equipment.brand} {task.equipment.model}
                          </div>
                          {task.equipment.serialNumber && (
                            <div className="text-xs text-gray-400">
                              N° série: {task.equipment.serialNumber}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(task.date + 'T00:00:00Z'), 'dd MMMM yyyy', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status === 'completed' ? 'Terminée' :
                         task.status === 'in_progress' ? 'En cours' :
                         'En attente'}
                      </span>
                      {task._status === 'syncing' && (
                        <span className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" title="Synchronisation en cours"/>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof task.technicianId === 'string' ? task.technicianId : task.technicianId?.name || 'Non assigné'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTask(task);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Modifier
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        taskToEdit={selectedTask}
      />
    </div>
  );
}

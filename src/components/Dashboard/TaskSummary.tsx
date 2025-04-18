import { useState, useMemo } from 'react';
import { Task } from '../../types/task';
import { format, parseISO, isValid } from 'date-fns';
import StatusDropdown from '../Tasks/StatusDropdown';
import { fr } from 'date-fns/locale';
import { Clock, MapPin, User } from 'lucide-react';

interface TaskSummaryProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function TaskSummary({ tasks, onTaskClick }: TaskSummaryProps) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  const filteredTasks = useMemo(() => {
    const filtered = tasks
      .filter(task => {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Task] Status update:', task.id, task.status);
        }
        return selectedStatus === 'all' ? true : task.status === selectedStatus;
      })
      .filter(task => task.date && isValid(parseISO(task.date)))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return filtered;
  }, [tasks, selectedStatus]);

  const formatTaskDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        return 'Date invalide';
      }
      return format(date, 'dd MMMM yyyy', { locale: fr });
    } catch {
      return 'Date invalide';
    }
  };


  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Résumé des tâches</h3>
          <a
            href="/tasks?status=active&priority=all&technician=all&client=all&equipment=all&assignment=unassigned&date=all"
            className="text-sm text-indigo-600 hover:text-indigo-800"
            onClick={async (e) => {
              e.preventDefault();
              const params = new URLSearchParams({
                status: 'all',
                priority: 'all',
                technician: 'all',
                client: 'all',
                equipment: '',
                assignment: 'unassigned',
                date: 'all'
              });
              
              // Afficher l'indicateur de chargement
              e.currentTarget.textContent = 'Chargement...';
              
              // Attendre un court délai pour permettre le rendu visuel
              await new Promise(resolve => setTimeout(resolve, 100));
              
              window.location.href = `/tasks?${params.toString()}`;
            }}
          >
            Voir les tâches non assignées
          </a>
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as typeof selectedStatus)}
          className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">Toutes les tâches</option>
          <option value="pending">En attente</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminées</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task: Task) => (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              className="p-4 rounded-lg border border-gray-200 hover:border-indigo-500 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                <div className="text-xs px-2 py-1">
                  <StatusDropdown
                    taskId={task.id}
                    currentStatus={task.status}
                  />
                </div>
              </div>
              
              <div className="mt-2 space-y-1">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTaskDate(task.date)} à {task.time ? (typeof task.time === 'string' ? task.time : task.time?.start?.toString()) || 'Heure non définie' : 'Heure non définie'}
                </div>
                {task.client_id && (
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    Client ID: {task.client_id}
                  </div>
                )}
                {task.technicianId && (
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="h-3 w-3 mr-1" />
                    {task.technicianId ? `ID Technicien: ${task.technicianId.toString()}` : 'Technicien non assigné'}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            Aucune tâche à afficher
          </div>
        )}
      </div>
    </div>
  );
}
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { TaskStatus } from '../../lib/statusRules';
import { Dropdown } from '../ui/dropdown';
import { isTransitionAllowed, validateRLS } from '../../lib/statusRules';
import { toast } from 'react-hot-toast';

interface StatusDropdownProps {
  taskId: string;
  currentStatus: TaskStatus;
  taskUserId: string;
}

const statusOptions = [
  { value: 'todo', label: 'À faire', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  { value: 'blocked', label: 'Bloquée', color: 'bg-red-100 text-red-800' },
  { value: 'done', label: 'Terminée', color: 'bg-green-100 text-green-800' },
];

export default function StatusDropdown({ taskId, currentStatus, taskUserId }: StatusDropdownProps) {
  const { updateTaskStatus } = useTaskStore();

  const currentStatusData = statusOptions.find(opt => opt.value === currentStatus) || 
    { value: '', label: 'Inconnu', color: 'bg-gray-100 text-gray-800' };

  const { user } = useAuthStore();
  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      if (!user) {
        throw new Error('Non authentifié');
      }

      if (!isTransitionAllowed(currentStatus, newStatus)) {
        throw new Error('Transition de statut non autorisée');
      }

      if (!validateRLS(user.id, taskUserId, user.role || 'user')) {
        throw new Error('Action non autorisée (RLS)');
      }

      await updateTaskStatus(taskId, newStatus);
      toast.success('Statut mis à jour');
      
      // Animation de confirmation
      const button = document.querySelector(`[data-task-id="${taskId}"] .status-badge`);
      if (button) {
        button.classList.add('ring-2', 'ring-offset-2');
        button.classList.add('animate-pulse');
        setTimeout(() => {
          button.classList.remove('animate-pulse');
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  return (
    <div className="relative">
      <Dropdown>
        <Dropdown.Button
          data-task-id={taskId}
          className={`px-3 py-1 rounded-full text-xs status-badge transition-all ${currentStatusData.color}`}
          aria-label={`Changer le statut de la tâche (actuellement ${currentStatusData.label})`}
          aria-expanded="false"
        >
          {currentStatusData.label}
        </Dropdown.Button>
        <Dropdown.Items className="min-w-[180px] mt-2 absolute bg-white shadow-lg z-10">
          {statusOptions.map((status) => (
            <Dropdown.Item key={status.value}>
              <button
                type="button"
                onClick={() => handleStatusChange(status.value as TaskStatus)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${status.value === currentStatus ? 'font-bold' : ''}`}
                aria-label={`Définir le statut sur ${status.label}`}
              >
                {status.label}
              </button>
            </Dropdown.Item>
          ))}
        </Dropdown.Items>
      </Dropdown>
    </div>
  );
}
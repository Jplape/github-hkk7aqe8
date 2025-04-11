import { useTaskStore } from '../../store/taskStore';
import { TaskStatus } from '../../types/task';
import { Dropdown } from '../ui/dropdown';

interface StatusDropdownProps {
  taskId: string;
  currentStatus: TaskStatus;
}

const statusOptions = [
  { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_progress', label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Terminée', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Annulée', color: 'bg-red-100 text-red-800' },
];

export default function StatusDropdown({ taskId, currentStatus }: StatusDropdownProps) {
  const { updateTaskStatus } = useTaskStore();

  const currentStatusData = statusOptions.find(opt => opt.value === currentStatus) || 
    { value: '', label: 'Inconnu', color: 'bg-gray-100 text-gray-800' };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      console.log('Status change triggered', {taskId, newStatus});
      await updateTaskStatus(taskId, newStatus);
      
      // Animation de confirmation
      const button = document.querySelector(`[data-task-id="${taskId}"] .status-badge`);
      if (button) {
        button.classList.add('animate-pulse', 'ring-2', 'ring-offset-2');
        setTimeout(() => {
          button.classList.remove('animate-pulse', 'ring-2', 'ring-offset-2');
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  return (
    <div className="relative">
      <Dropdown>
        <Dropdown.Button
          data-task-id={taskId}
          className={`px-3 py-1 rounded-full text-xs status-badge transition-all ${currentStatusData.color}`}
        >
          {currentStatusData.label}
        </Dropdown.Button>
        <Dropdown.Items className="min-w-[180px] mt-2 absolute bg-white shadow-lg z-10">
          {statusOptions.map((status) => (
            <Dropdown.Item key={status.value}>
              <button
                onClick={() => handleStatusChange(status.value as TaskStatus)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${status.value === currentStatus ? 'font-bold' : ''}`}
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
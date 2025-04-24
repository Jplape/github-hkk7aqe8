import { X } from 'lucide-react';
import { Task } from '../../types/task';
import TaskForm from './TaskForm';
import type { TaskFormData } from './TaskForm';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Partial<Task>) => void;
  taskToEdit?: Task | null;
}

function convertTaskToFormData(task?: Task | null): TaskFormData | undefined {
  if (!task) return undefined;
  
  return {
    ...task,
    startTime: task.time?.start || '09:00',
    endTime: task.time?.end || '10:00',
    client_id: task.client_id || '',
    equipmentName: task.equipment?.name || '',
    brand: task.equipment?.brand || '',
    model: task.equipment?.model || '',
    serialNumber: task.equipment?.serialNumber || ''
  };
}

export default function TaskModal({ isOpen, onClose, onSubmit, taskToEdit }: TaskModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {taskToEdit ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <TaskForm
          initialData={convertTaskToFormData(taskToEdit)}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}

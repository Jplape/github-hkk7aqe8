import { X } from 'lucide-react';
import { Task } from '../../types/task';
import TaskForm from '../Tasks/TaskForm';
import { useTaskStore } from '../../store/taskStore';

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: string;
  taskToEdit?: Task | null;
}

export default function NewTaskModal({ isOpen, onClose, selectedDate, taskToEdit }: NewTaskModalProps) {
  const { addTask, updateTask } = useTaskStore();

  const handleSubmit = (formData: Partial<Task>) => {
    if (!formData.title || !formData.date) {
      console.error("Title and date are required to create or update a task.");
      return;
    }

    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title,
      date: formData.date,
      time: {
        start: formData.time?.start || '09:00',
        end: formData.time?.end || '10:00'
      },
      duration: formData.duration || 60,
      client: typeof formData.client === 'string'
        ? { id: '', name: formData.client }
        : formData.client || { id: '', name: '' },
      description: formData.description || '',
      equipment: typeof formData.equipment === 'string'
        ? { name: formData.equipment }
        : formData.equipment,
      technicianId: formData.technicianId || '',
      status: formData.status || 'pending',
      priority: formData.priority || 'medium'
    };

    if (taskToEdit) {
      updateTask(taskToEdit.id, taskData);
    } else {
      addTask(taskData);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            {taskToEdit ? 'Modifier la tâche' : 'Nouvelle tâche'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Fermer la modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <TaskForm
            initialData={taskToEdit || (selectedDate ? { date: selectedDate } : undefined)}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
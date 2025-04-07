import { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { Task, TaskStatus } from '../../types/task';
import { DropdownMenu, DropdownTrigger, DropdownContent, DropdownItem } from '../ui/dropdown';

interface StatusDropdownProps {
  task: Task;
  className?: string;
}

const statusOptions: { value: TaskStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'En attente', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Terminée', color: 'bg-green-100 text-green-800' },
];

export default function StatusDropdown({ task, className }: StatusDropdownProps) {
  const { updateTask } = useTaskStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status) return;
    
    setIsSyncing(true);
    try {
      await updateTask(task.id, { 
        status: newStatus,
        _status: 'syncing'
      });
    } catch (error) {
      console.error('Failed to update task status:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const currentStatus = statusOptions.find(opt => opt.value === task.status);

  console.log('Rendering StatusDropdown for task:', task.id, task.status);
  return (
    <div style={{ position: 'relative', zIndex: 50 }}>
      <DropdownMenu>
        <DropdownTrigger className={`${className} ${currentStatus?.color} px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 border border-red-500`}>
          {isSyncing ? (
            <span className="animate-pulse">Synchronisation...</span>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-current opacity-70"></span>
              {currentStatus?.label}
            </>
          )}
        </DropdownTrigger>
        
        <DropdownContent className="min-w-[180px] right-0 mt-2 origin-top-right">
          {statusOptions.map((option) => (
            <DropdownItem
              key={option.value}
              as="button"
              onClick={() => handleStatusChange(option.value)}
              className={`${option.color} hover:opacity-90 w-full text-left px-4 py-2 text-sm`}
            >
              <span className="w-2 h-2 rounded-full bg-current opacity-70 mr-2"></span>
              {option.label}
            </DropdownItem>
          ))}
        </DropdownContent>
      </DropdownMenu>
    </div>
  );
}
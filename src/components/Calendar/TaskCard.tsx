import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Clock, AlertCircle, User, MapPin } from 'lucide-react';
import type { Task } from '../../types/task';
import { useTeamStore } from '../../store/teamStore';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onContextMenu: (e: React.MouseEvent, task: Task) => void;
  compact?: boolean;
  variant?: 'default' | 'month';
  style?: React.CSSProperties;
}

export default function TaskCard({ 
  task, 
  onEdit, 
  onContextMenu,
  compact = false,
  style = {} 
}: TaskCardProps) {
  const { members } = useTeamStore();
  const assignedTechnician = task.technicianId 
    ? members.find(m => m.id === Number(task.technicianId))
    : null;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: {
      type: 'task',
      task
    }
  });

  const dragStyle = transform ? {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : undefined,
  } : undefined;

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-100',
          border: 'border-red-300 border-2',
          text: 'text-red-900 font-semibold',
          hover: 'hover:bg-red-200',
          dot: 'bg-red-600',
          shadow: 'shadow-md shadow-red-200/50'
        };
      case 'medium':
        return {
          bg: 'bg-orange-100',
          border: 'border-orange-300 border-2',
          text: 'text-orange-900 font-semibold',
          hover: 'hover:bg-orange-200',
          dot: 'bg-orange-600',
          shadow: 'shadow-md shadow-orange-200/50'
        };
      default:
        return {
          bg: 'bg-green-100',
          border: 'border-green-300 border-2',
          text: 'text-green-900 font-semibold',
          hover: 'hover:bg-green-200',
          dot: 'bg-green-600',
          shadow: 'shadow-md shadow-green-200/50'
        };
    }
  };

  const priorityStyles = getPriorityStyles(task.priority);

  const getStatusBadgeStyle = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-200 text-green-900 font-medium border border-green-300 shadow-sm';
      case 'in_progress':
        return 'bg-blue-200 text-blue-900 font-medium border border-blue-300 shadow-sm';
      default:
        return 'bg-gray-200 text-gray-900 font-medium border border-gray-300 shadow-sm';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{ ...dragStyle, ...style }}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onEdit(task);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, task);
      }}
      className={`
        group relative rounded-lg cursor-move transition-all duration-200
        ${priorityStyles.bg} ${priorityStyles.border} ${priorityStyles.hover} ${priorityStyles.shadow}
        ${isDragging ? 'ring-2 ring-indigo-500 shadow-lg z-50 scale-105' : 'hover:shadow-lg'}
        ${compact ? 'p-2' : 'p-3'}
        h-full overflow-hidden flex flex-col
        transform-gpu will-change-transform
        ${task._status === 'error' ? 'animate-pulse ring-2 ring-red-500' : ''}
        ${task._status === 'syncing' ? 'opacity-80' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-1">
        <span className={`font-medium ${priorityStyles.text} ${compact ? 'text-xs' : 'text-sm'} truncate flex-1`}>
          {task.title}
        </span>
        {task.priority === 'high' && !compact && (
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 ml-1" />
        )}
      </div>

      <div className={`flex flex-col ${compact ? 'gap-0.5' : 'gap-1'} flex-1`}>
        <div className="flex items-center text-xs text-gray-600">
          <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
          <span>{task.time.start}</span>
        </div>

        {!compact && assignedTechnician && (
          <div className="flex items-center text-xs text-gray-600">
            <User className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{assignedTechnician.name}</span>
          </div>
        )}

        {!compact && (
          <div className="flex items-center text-xs text-gray-600">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">
              {typeof task.client === 'string' ? task.client : task.client?.name}
            </span>
          </div>
        )}

        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 ${getStatusBadgeStyle(task.status)}`}>
          {task.status === 'completed' ? 'Terminée' :
           task.status === 'in_progress' ? 'En cours' :
           'En attente'}
        </span>
      </div>
    </div>
  );
}
import { addDays, isSameDay } from 'date-fns';
import { DateService } from '../../services/DateService';
import { Plus } from 'lucide-react';
import { Task } from '../../types/task';
import TaskCard from './TaskCard';
import { DroppableDay } from './DroppableDay';

interface WeekViewProps {
  currentDate: Date;
  tasks: Task[];
  onNewTask: (date: string) => void;
  onEditTask: (task: Task) => void;
  onContextMenu: (e: React.MouseEvent, task: Task) => void;
  draggedOverDate: string | null;
}

const HOURS = Array.from({ length: 11 }, (_, i) => i + 7); // 7h à 18h
const HOUR_HEIGHT = 60; // Hauteur d'une heure en pixels

export default function WeekView({
  currentDate,
  tasks,
  onNewTask,
  onEditTask,
  onContextMenu,
  draggedOverDate
}: WeekViewProps) {
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(currentDate, i);
    const dateStr = DateService.formatTaskDate(date);
    const dayTasks = tasks.filter(task => {
      if (!task.date) return false;
      const taskDate = task.date.split('T')[0];
      return taskDate === dateStr;
    });
    return { date, dateStr, tasks: dayTasks };
  });

  const getTaskPosition = (task: Task) => {
    // Fallback basé sur la priorité et le statut
    const priorityFallback = {
      high: { top: 0, height: 60 },
      medium: { top: 180, height: 60 },
      low: { top: 360, height: 60 }
    };

    if (!task?.time?.start) {
      return priorityFallback[task.priority] || { top: 0, height: 60 };
    }

    try {
      // Normalisation du temps via DateService
      const referenceDate = task.createdAt ? new Date(task.createdAt) : new Date();
      const normalizedTime = DateService.normalizeTime(task.time.start, referenceDate);
      const [hours, minutes] = normalizedTime.split(':').map(Number);

      // Calcul position
      const startMinutes = hours * 60 + minutes;
      const top = Math.max(0, ((startMinutes - 7 * 60) / 60) * HOUR_HEIGHT);
      const height = Math.max(
        30,
        ((task.duration || 60) / 60) * HOUR_HEIGHT
      );

      return { top, height };
    } catch (error) {
      console.error('Error calculating task position:', error, task);
      return priorityFallback[task.priority] || { top: 0, height: 60 };
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* En-tête des jours */}
      <div className="grid grid-cols-8 border-b">
        <div className="p-4 border-r text-sm font-medium text-gray-500">
          Heures
        </div>
        {weekDays.map(({ date, dateStr }) => (
          <div
            key={dateStr}
            className="p-4 text-center border-r last:border-r-0"
          >
            <div className="text-sm font-semibold text-gray-900">
              {DateService.formatDisplayDate(date)}
            </div>
            <div className={`text-sm mt-1 ${
              isSameDay(date, new Date())
                ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center mx-auto'
                : 'text-gray-500'
            }`}>
              {DateService.formatDisplayDate(date).split(' ')[1]}
            </div>
          </div>
        ))}
      </div>

      {/* Grille horaire */}
      <div className="grid grid-cols-8">
        {/* Colonne des heures */}
        <div className="border-r">
          {HOURS.map(hour => (
            <div
              key={hour}
              className="border-b last:border-b-0 h-[60px] px-2 flex items-center justify-end"
            >
              <span className="text-sm text-gray-500">
                {`${hour}:00`}
              </span>
            </div>
          ))}
        </div>

        {/* Colonnes des jours */}
        {weekDays.map(({ dateStr, tasks: dayTasks }) => (
          <DroppableDay
            key={dateStr}
            date={dateStr}
            isOver={draggedOverDate === dateStr}
          >
            <div className="relative h-full border-r last:border-r-0">
              {/* Lignes horaires */}
              {HOURS.map(hour => (
                <div
                  key={hour}
                  className="border-b last:border-b-0 h-[60px]"
                >
                  {/* Ligne de demi-heure */}
                  <div className="h-1/2 border-b border-dashed border-gray-100" />
                </div>
              ))}

              {/* Tâches */}
              <div className="absolute inset-0">
                {dayTasks.map(task => {
                  const { top, height } = getTaskPosition(task);
                  return (
                    <div
                      key={task.id}
                      className="absolute left-1 right-1"
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <TaskCard
                        task={task}
                        onEdit={onEditTask}
                        compact={height < 60}
                        onContextMenu={(e) => onContextMenu(e, task)}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Bouton nouvelle tâche */}
              <button
                onClick={() => onNewTask(dateStr)}
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 p-1 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                aria-label={`Ajouter une tâche pour le ${DateService.formatLongDate(dateStr)}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </DroppableDay>
        ))}
      </div>

      {/* Indicateur d'heure actuelle */}
      {weekDays.some(({ date }) => isSameDay(date, new Date())) && (
        <div
          className="absolute left-0 right-0 border-t-2 border-red-500 z-10 pointer-events-none"
          style={{
            top: `${((new Date().getHours() - 7) * 60 + new Date().getMinutes()) * (HOUR_HEIGHT / 60)}px`,
          }}
        >
          <div className="absolute left-0 w-2 h-2 bg-red-500 rounded-full -mt-1" />
        </div>
      )}
    </div>
  );
}

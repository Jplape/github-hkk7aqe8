import { Task } from '../types/task';

export function filterTasksForDateRange(
  tasks: Task[], 
  startDate: Date,
  endDate: Date,
) {
  return tasks.filter(task => {
    if (!task.date) return false;
    
    try {
      // Normaliser les dates en comparant seulement les parties YYYY-MM-DD
      const taskDateStr = task.date.split('T')[0];
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      return taskDateStr >= startDateStr && taskDateStr <= endDateStr;
    } catch {
      return false;
    }
  });
}

export function groupTasksByDate(tasks: Task[]) {
  const grouped: Record<string, Task[]> = {};

  tasks.forEach((task) => {
    if (task.date) {
      const taskDate = task.date.split('T')[0]; // Normalisation de la date
      if (!grouped[taskDate]) {
        grouped[taskDate] = [];
      }
      grouped[taskDate].push(task);
    }
  });

  // Tri des tâches par priorité puis par heure
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a: Task, b: Task) => {
      const priorityOrder = {
        high: 1,
        medium: 2, 
        low: 3
      };

      // D'abord par priorité
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      // Puis par heure de début
      const aTime = a.time?.start || '00:00';
      const bTime = b.time?.start || '00:00';
      return aTime.localeCompare(bTime);
    });
  });

  return grouped;
}
import { Task } from '../types/task';

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return tasks.sort((a: Task, b: Task) => {
    const priorityOrder = {
      high: 1,
      medium: 2, 
      low: 3
    };

    // First by priority
    if (a.priority !== b.priority) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // Then by start time
    const aTime = a.time.start;
    const bTime = b.time.start;
    return aTime.localeCompare(bTime);
  });
}

export function validateTaskTime(task: Task, strict = true): boolean {
  // Si la tâche n'a pas d'objet time valide, assigner une plage horaire par défaut
  if (!task.time || typeof task.time !== 'object' || !task.time.start || !task.time.end) {
    task.time = { start: '08:00', end: '09:00' };
    return true;
  }

  // Valider le format des heures (plus flexible en mode non strict)
  const timeRegex = strict
    ? /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    : /^([01]?[0-9]|2[0-3])(:[0-5][0-9])?$/;

  if (!timeRegex.test(task.time.start) || !timeRegex.test(task.time.end)) {
    return false;
  }

  // Normaliser les formats (ajouter :00 si minutes manquantes en mode non strict)
  if (!strict) {
    if (!task.time.start.includes(':')) task.time.start += ':00';
    if (!task.time.end.includes(':')) task.time.end += ':00';
  }

  // Parser les heures/minutes
  const [startHours, startMinutes] = task.time.start.split(':').map(Number);
  const [endHours, endMinutes] = task.time.end.split(':').map(Number);

  // Valider les plages horaires
  if (startHours > 23 || startMinutes > 59 || endHours > 23 || endMinutes > 59) {
    return false;
  }

  // Vérifier que end est après start (sauf si non strict pour les événements instantanés)
  if (strict && (startHours > endHours || (startHours === endHours && startMinutes >= endMinutes))) {
    return false;
  }

  return true;
}

export function filterTasksByTechnician(
  tasks: Task[],
  technicianId: string
): Task[] {
  return tasks.filter((task: Task) =>
    task.technicianId === technicianId
  );
}

export function getTaskPosition(
  task: Task,
  hourHeight: number,
  startHour: number,
  timezone: string = 'UTC'
): { top: number; height: number } {
  // Fallback position if invalid task time
  if (!task?.time?.start || !task?.time?.end) {
    return { top: 0, height: hourHeight };
  }

  try {
    // Convert to timezone-aware dates
    const now = new Date();
    const startDate = new Date(`${now.toISOString().split('T')[0]}T${task.time.start}`);
    const endDate = new Date(`${now.toISOString().split('T')[0]}T${task.time.end}`);

    // Format times according to specified timezone
    const timeFormatter = new Intl.DateTimeFormat('fr', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const [startHours, startMinutes] = timeFormatter.format(startDate)
      .split(':')
      .map(Number);
    const [endHours, endMinutes] = timeFormatter.format(endDate)
      .split(':')
      .map(Number);

    // Calculate total minutes from start of day (timezone adjusted)
    const startTotalMinutes = (startHours - startHour) * 60 + startMinutes;
    const endTotalMinutes = (endHours - startHour) * 60 + endMinutes;
    
    // Convert to pixels based on hourHeight (80px = 60 minutes)
    const top = Math.max(0, startTotalMinutes * (hourHeight / 60));
    const height = Math.max(
      hourHeight,
      (endTotalMinutes - startTotalMinutes) * (hourHeight / 60)
    );
    
    return { top, height };
  } catch (error) {
    console.error('Error calculating task position:', error);
    return { top: 0, height: hourHeight };
  }
}

export function sortTasksByTime(tasks: Task[]): Task[] {
  return tasks.sort((a, b) => {
    return a.time.start.localeCompare(b.time.start);
  });
}
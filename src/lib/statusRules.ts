export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';

export const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress'],
  in_progress: ['blocked', 'done'], 
  blocked: ['in_progress'],
  done: []
};

export function isTransitionAllowed(
  currentStatus: TaskStatus,
  newStatus: TaskStatus
): boolean {
  return ALLOWED_TRANSITIONS[currentStatus].includes(newStatus);
}

export function validateRLS(
  userId: string,
  taskUserId: string,
  userRole?: string
): boolean {
  return userRole === 'admin' || userId === taskUserId;
}
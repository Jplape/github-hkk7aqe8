export interface Task {
  id?: string;
  title: string;
  completed: boolean;
  date?: string;
  description?: string;
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high';
}
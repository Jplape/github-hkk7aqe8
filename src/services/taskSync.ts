import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config';

export interface Task {
  id?: string;
  description: string;
  status: 'pending'|'in_progress'|'completed'|'cancelled';
  created_at?: string;
  updated_at?: string;
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export const taskService = {
  async createTask(task: Omit<Task, 'id'>) {
    const { data, error } = await supabase
      .from('task')
      .insert(task)
      .select();
    if (error) throw error;
    return data[0] as Task;
  },

  async updateTask(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('task')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0] as Task;
  },

  subscribe(callback: (payload: {
    eventType: 'INSERT'|'UPDATE'|'DELETE',
    new: Task,
    old: Task
  }) => void) {
    const channel = supabase
      .channel('task-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'task'
      }, (payload) => {
        callback({
          eventType: payload.eventType as any,
          new: payload.new as Task,
          old: payload.old as Task
        });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
};
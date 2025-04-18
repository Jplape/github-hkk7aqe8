import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { persist } from 'zustand/middleware';

interface Task {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  updated_at: string;
  _status?: 'syncing' | 'synced' | 'error';
}

interface TaskState {
  tasks: Task[];
  pendingSyncs: number;
  initRealtime: () => () => void;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => Promise<void>;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      pendingSyncs: 0,

      initRealtime: () => {
        const channel = supabase
          .channel('tasks_sync')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'task'
          }, (payload) => {
            switch(payload.eventType) {
              case 'INSERT':
                set({tasks: [...get().tasks, payload.new as Task]});
                break;
              case 'UPDATE':
                set({tasks: get().tasks.map(t => 
                  t.id === payload.new.id ? payload.new as Task : t
                )});
                break;
              case 'DELETE':
                set({tasks: get().tasks.filter(t => t.id !== payload.old.id)});
                break;
            }
          })
          .subscribe();

        return () => supabase.removeChannel(channel);
      },

      addTask: async (task, retries = 3) => {
        const tempId = crypto.randomUUID();
        const newTask = {
          ...task,
          id: tempId,
          _status: 'syncing' as const,
          updated_at: new Date().toISOString()
        };

        set({
          tasks: [...get().tasks, newTask],
          pendingSyncs: get().pendingSyncs + 1
        });

        let lastError;
        for (let i = 0; i < retries; i++) {
          try {
            const {data, error} = await supabase
              .from('task')
              .insert(newTask)
              .select()
              .single();

            if (error) throw error;

            set({
              tasks: get().tasks.map(t => t.id === tempId ? data : t),
              pendingSyncs: get().pendingSyncs - 1
            });
            return;
          } catch (error) {
            lastError = error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }

        set({
          tasks: get().tasks.map(t =>
            t.id === tempId ? {...t, _status: 'error'} : t
          ),
          pendingSyncs: get().pendingSyncs - 1
        });
        throw lastError;
      },

      updateTask: async (id: string, updates: Partial<Task>, retries = 3) => {
        const oldTask = get().tasks.find(t => t.id === id);
        if (!oldTask) return;

        set({
          tasks: get().tasks.map(t =>
            t.id === id ? {...t, ...updates, _status: 'syncing'} : t
          ),
          pendingSyncs: get().pendingSyncs + 1
        });

        let lastError;
        for (let i = 0; i < retries; i++) {
          try {
            const {data, error} = await supabase
              .from('task')
              .update({
                ...updates,
                updated_at: new Date().toISOString()
              })
              .eq('id', id)
              .select()
              .single();

            if (error) throw error;

            set({
              tasks: get().tasks.map(t => t.id === id ? data : t),
              pendingSyncs: get().pendingSyncs - 1
            });
            return;
          } catch (error) {
            lastError = error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }

        set({
          tasks: get().tasks.map(t =>
            t.id === id ? {...oldTask, _status: 'error'} : t
          ),
          pendingSyncs: get().pendingSyncs - 1
        });
        throw lastError;
      }
    }),
    {name: 'task-storage'}
  )
);

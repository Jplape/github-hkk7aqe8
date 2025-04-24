import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { persist } from 'zustand/middleware';

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

import { Task } from '../types/task';

interface TaskState {
  tasks: Task[];
  pendingSyncs: number;
  initRealtime: () => () => void;
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id'>>) => Promise<void>;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      pendingSyncs: 0,

      loadTasks: async () => {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error loading tasks:', error);
          return;
        }
        
        set({ tasks: data || [] });
      },
      
      initRealtime: () => {
        console.log('Initializing realtime subscription');
        get().loadTasks(); // Load existing tasks first
        const channel = supabase
          .channel('tasks_sync')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'tasks'
          }, (payload) => {
            console.log('Realtime event:', payload.eventType, payload);
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
              .from('tasks')
              .insert(newTask)
              .select()
              .single();

            if (error) {
              console.error('Supabase insert error:', error);
              throw error;
            }

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
        throw new Error(`Failed to sync task after ${retries} attempts: ${(lastError as Error)?.message || 'Unknown error'}`);
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
              .from('tasks')
              .update({
                ...updates,
                updated_at: new Date().toISOString()
              })
              .eq('id', id)
              .select()
              .single();

            if (error) throw new Error(`Supabase error: ${error.message}`);

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
        throw new Error(`Failed to update task after ${retries} attempts: ${(lastError as Error)?.message || 'Unknown error'}`);
      }
    }),
    {name: 'task-storage'}
  )
);

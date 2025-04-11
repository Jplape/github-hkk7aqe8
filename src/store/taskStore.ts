import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { persist } from 'zustand/middleware';
import { useCalendarStore } from './calendarStore';
import { Task, SyncStatus } from '../types/task';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newDate: string) => Promise<void>;
  initRealtime: () => () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      initRealtime: () => {
        const subscription = supabase
          .channel('tasks_changes')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'tasks'
          }, (payload) => {
            if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
              useTaskStore.getState().updateTask(payload.new.id, payload.new as Partial<Task>);
            }
          })
          .subscribe();

        return () => {
          supabase.removeChannel(subscription);
        };
      },

      addTask: async (task) => {
        const now = new Date().toISOString();
        const newTask = {
          ...task,
          id: `TASK-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
          _status: 'syncing' // Track sync status
        };

        // Optimistic update
        set((state) => ({
          tasks: [...state.tasks, newTask as Task]
        }));

        try {
          const { error } = await supabase
            .from('tasks')
            .insert(newTask);
          
          if (error) throw error;
          
          // Update status on success
          set((state) => ({
            tasks: state.tasks.map(t =>
              t.id === newTask.id
                ? { ...t, _status: 'synced' }
                : t
            )
          }));
        } catch (error) {
          console.error('Failed to add task:', error);
          // Mark as error and queue for retry
          set((state) => ({
            tasks: state.tasks.map(t =>
              t.id === newTask.id
                ? { ...t, _status: 'error' }
                : t
            )
          }));
        }

        useCalendarStore.getState().updateLastSync();
      },

      updateTask: async (id: string, updates: Partial<Task>) => {
        const now = new Date().toISOString();
        
        // Optimistic update
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: now, _status: 'syncing' } as Task
              : task
          )
        }));

        try {
          const { error } = await supabase
            .from('tasks')
            .update({ ...updates, updatedAt: now })
            .eq('id', id);

          if (error) throw error;

          // Update status on success
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, ...updates, updatedAt: now, _status: 'synced' } as Task
                : task
            )
          }));
        } catch (error) {
          console.error('Failed to update task:', {
            error,
            taskId: id,
            updates
          });
          
          // Mark as error and queue for retry
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, _status: 'error' } as Task
                : task
            )
          }));
        }

        useCalendarStore.getState().updateLastSync(); 
      },

      deleteTask: async (id: string) => {
        try {
          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id)
          }));
        } catch (error) {
          console.error('Failed to delete task:', error);
          // Queue for retry later
          set((state) => ({
            tasks: state.tasks.map(task =>
              task.id === id
                ? { ...task, _status: 'pending_deletion' as SyncStatus }
                : task
            )
          }));
        }
        useCalendarStore.getState().updateLastSync();
      },
    
      moveTask: async (taskId: string, newDate: string) => {
        const now = new Date().toISOString();
        
        try {
          const { error } = await supabase
            .from('tasks')
            .update({ date: newDate, updatedAt: now })
            .eq('id', taskId);
    
          if (error) throw error;
    
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId
                ? { ...task, date: newDate, updatedAt: now }
                : task
            )
          }));
        } catch (error) {
          console.error('Failed to move task:', error);
        }
    
        useCalendarStore.getState().updateLastSync();
      }
    }),
    {
      name: 'task-storage',
    }
  )
);

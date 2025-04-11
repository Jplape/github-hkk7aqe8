import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { persist } from 'zustand/middleware';
import { useCalendarStore } from './calendarStore';
import { Task, SyncStatus, TaskStatus } from '../types/task';

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newDate: string) => Promise<void>;
  initRealtime: () => () => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      
      // Initialize realtime subscription
      initRealtime: () => {
        console.log('[TaskStore] Initializing realtime subscription');
        
        const channel = supabase
          .channel('tasks_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'task'
            },
            (payload) => {
              console.log('[TaskStore] Realtime event:', payload.eventType, payload);
              try {
                switch (payload.eventType) {
                  case 'INSERT':
                    set({ tasks: [...get().tasks, payload.new as Task] });
                    break;
                  case 'UPDATE':
                    set({
                      tasks: get().tasks.map(task =>
                        task.id === payload.new.id ? payload.new as Task : task
                      )
                    });
                    break;
                  case 'DELETE':
                    set({
                      tasks: get().tasks.filter(task => task.id !== payload.old.id)
                    });
                    break;
                }
              } catch (error) {
                console.error('[TaskStore] Error processing realtime event:', error);
              }
            }
          )
          .subscribe((status, err) => {
            if (err) {
              console.error('[TaskStore] Subscription error:', err);
            }
            console.log('[TaskStore] Subscription status:', status);
          });
          
        return () => {
          console.log('[TaskStore] Removing realtime subscription');
          supabase.removeChannel(channel);
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
          tasks: [...state.tasks, { ...newTask, status: 'pending' as TaskStatus } as Task]
        }));

        try {
          const { error } = await supabase
            .from('task')
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
        console.log('Current auth session:', await supabase.auth.getSession());
        const now = new Date().toISOString();
        
        try {
          const { error } = await supabase
            .from('task')
            .update({ ...updates, updated_at: now })
            .eq('id', id);

          if (error) {
            let errorDetails = {};
            try {
              errorDetails = {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint,
                status: error.status,
                statusText: error.statusText
              };
            } catch (e) {
              console.error('Error parsing Supabase error:', e);
              errorDetails = { rawError: error };
            }
            
            console.error('Full Supabase update error context:', {
              errorDetails,
              taskId: id,
              updates,
              timestamp: new Date().toISOString()
            });
            throw new Error(`Failed to update task: ${JSON.stringify(errorDetails)}`);
          }
          console.log('Task updated successfully:', {id, updates});

          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, ...updates, updatedAt: now, status: updates.status || task.status } as Task
                : task
            )
          }));
        } catch (error) {
          console.error('Failed to update task:', {
            error: error instanceof Error ? error.message : error,
            taskId: id,
            updates
          });
          throw error;
        }

        useCalendarStore.getState().updateLastSync(); 
      },

      deleteTask: async (id: string) => {
        try {
          const { error } = await supabase
            .from('task')
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
            .from('task')
            .update({ date: newDate, updated_at: now })
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
      },

      updateTaskStatus: async (id: string, status: TaskStatus) => {
        console.log('[TaskStore] Attempting status update', {id, status});
        
        // Verify authentication (Supabase v2+)
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('[TaskStore] Update failed - No authenticated user');
          throw new Error('Authentication required');
        }

        const now = new Date().toISOString();
        
        try {
          // Optimistic update first
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, status, updatedAt: now, _status: 'syncing' as SyncStatus }
                : task
            )
          }));

          // Sync with Supabase
          const { data, error } = await supabase
            .from('task')  // Nom correct de la table
            .update({
              status,
              updated_at: now,  // Colonne correcte selon schema.sql
              equipment_id: null,  // Maintient la relation optionnelle
              intervention_id: null  // Maintient la relation optionnelle
            })
            .eq('id', id)
            .select();

          if (error) {
            console.error('[TaskStore] Supabase update failed:', {
              message: error.message,
              code: error.code,
              details: error.details,
              hint: error.hint
            });
            
            // Revert optimistic update on error
            set((state) => ({
              tasks: state.tasks.map((task) =>
                task.id === id
                  ? { ...task, _status: 'error' as SyncStatus }
                  : task
              )
            }));
            
            throw error;
          }

          console.log('[TaskStore] Update successful', data);
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, _status: 'synced' as SyncStatus }
                : task
            )
          }));
        } catch (error) {
          console.error('[TaskStore] Critical update error:', error);
          throw error;
        }

        useCalendarStore.getState().updateLastSync();
      }
    }),
    {
      name: 'task-storage',
    }
  )
);

import { useEffect, useRef } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useCalendarStore } from '../store/calendarStore';
import { supabase } from '../../lib/supabase';
import type { Task } from '../types/task';
import { saveConflict } from '../services/ConflictHistoryDB';

export function useTaskSync() {
  const { tasks, addTask, updateTask, deleteTask } = useTaskStore();
  const { updateLastSync } = useCalendarStore();
  const pendingSyncs = useRef<Set<string>>(new Set());

  const resolveConflict = (local: Task, remote: Task): Task => {
    const localDate = new Date(local.updatedAt);
    const remoteDate = new Date(remote.updatedAt);
    
    const resolved = remoteDate > localDate 
      ? { ...local, ...remote }
      : { ...remote, ...local };

    saveConflict(local.id, local, remote, resolved);
    return resolved;
  };

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    
    const setupSubscription = () => {
      const subscription = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks'
          },
          (payload) => {
            const p = payload as unknown as {
              new?: Task;
              old?: Task;
              eventType: string
            };
            
            if (!p.new) return;
            const taskId = p.new.id;
            if (!taskId || pendingSyncs.current.has(taskId)) return;

            try {
              switch (p.eventType) {
                case 'INSERT':
                  addTask({
                    ...p.new,
                    origin: 'remote',
                    _status: 'synced'
                  });
                  break;
                case 'UPDATE':
                  const localTask = tasks.find(t => t.id === p.new?.id);
                  if (localTask && p.new) {
                    const resolvedTask = resolveConflict(localTask, p.new);
                    updateTask(resolvedTask.id, {
                      ...resolvedTask,
                      origin: 'remote',
                      _status: 'synced'
                    });
                  }
                  break;
                case 'DELETE':
                  if (p.old) {
                    deleteTask(p.old.id);
                  }
                  break;
              }
              updateLastSync();
              retryCount = 0; // Reset retry counter on success
            } catch (error) {
              console.error('Sync error:', error);
              if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(setupSubscription, 1000 * retryCount);
              }
            }
          }
        )
        .subscribe((_, err) => {
          if (err) {
            console.error('Subscription error:', err);
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(setupSubscription, 1000 * retryCount);
            }
          }
        });

      return subscription;
    };

    const subscription = setupSubscription();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [addTask, updateTask, deleteTask, updateLastSync, tasks]);

  return null;
}
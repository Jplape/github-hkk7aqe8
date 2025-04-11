import { useEffect } from 'react'
import { RealtimePostgresChangesPayload, RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { useTaskStore } from '../store/taskStore'
import { Database } from '../types/supabase'
import { TaskStatus, TimeRange, TaskPriority } from '../types/task'

type TaskChangePayload = RealtimePostgresChangesPayload<Database['public']['Tables']['tasks']['Row']>
type TaskInsertPayload = RealtimePostgresInsertPayload<Database['public']['Tables']['tasks']['Row']>
type TaskUpdatePayload = RealtimePostgresUpdatePayload<Database['public']['Tables']['tasks']['Row']>

export const useTaskSync = () => {
  const { updateTaskStatus, addTask } = useTaskStore()

  useEffect(() => {
    const setupChannel = async () => {
      try {
        const channel = supabase
          .channel('realtime-tasks')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'tasks'
          }, (payload: TaskChangePayload) => {
            const changeType = payload.eventType
            
            console.log('Supabase change event:', changeType, payload.new)
            
            if (changeType === 'INSERT') {
              const insertPayload = payload as TaskInsertPayload
              if (insertPayload.new) {
                // Convertir les données Supabase vers le format Task
                const defaultClient = {
                  id: '',
                  name: 'Client inconnu',
                  email: '',
                  phone: ''
                }

                const taskData = {
                  title: insertPayload.new.title,
                  description: insertPayload.new.description || '',
                  status: insertPayload.new.status as TaskStatus,
                  client: defaultClient,
                  date: insertPayload.new.due_date ? new Date(insertPayload.new.due_date).toISOString() : '',
                  time: { start: '09:00', end: '17:00' } as TimeRange,
                  duration: 0,
                  priority: 'medium' as TaskPriority
                }
                addTask(taskData)
              }
            } else if (changeType === 'UPDATE') {
              const updatePayload = payload as TaskUpdatePayload
              if (updatePayload.new?.status && updatePayload.new?.id &&
                  updatePayload.new.status !== updatePayload.old?.status) {
                // Valider que le status est bien un TaskStatus valide
                updateTaskStatus(
                  updatePayload.new.id,
                  (['pending', 'in_progress', 'completed'] as TaskStatus[]).includes(updatePayload.new.status as TaskStatus)
                    ? updatePayload.new.status as TaskStatus
                    : 'pending'
                )
              }
            }
          })
          .subscribe((_status, err) => {
            if (err) {
              console.error('Subscription error:', err)
              // Réessayer après 5 secondes
              setTimeout(setupChannel, 5000)
            }
          })

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (error) {
        console.error('Failed to setup sync channel:', error)
        // Réessayer après 5 secondes
        setTimeout(setupChannel, 5000)
      }
    }

    const cleanup = setupChannel()
    return () => {
      cleanup.then(fn => fn?.())
    }
  }, [updateTaskStatus, addTask])
}
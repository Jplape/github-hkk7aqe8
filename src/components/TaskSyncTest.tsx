import { useEffect, useState } from 'react';
import { taskService, Task } from '../services/taskSync';

interface LogEntry {
  timestamp: string;
  message: string;
}

export default function TaskSyncTest() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString(),
      message
    }]);
  };

  const testCreate = async () => {
    try {
      const newTask = {
        description: `Tâche ${new Date().toLocaleTimeString()}`,
        status: 'pending' as const
      };
      const created = await taskService.createTask(newTask);
      addLog(`Tâche créée: ${created.id}`);
    } catch (error) {
      addLog(`Erreur création: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testUpdate = async (id: string) => {
    try {
      await taskService.updateTask(id, { status: 'completed' });
      addLog(`Tâche ${id} mise à jour`);
    } catch (error) {
      addLog(`Erreur mise à jour: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  useEffect(() => {
    const unsubscribe = taskService.subscribe((event) => {
      if (event.new?.id) {
        setTasks(prev => {
          const exists = prev.some(t => t.id === event.new.id);
          return exists 
            ? prev.map(t => t.id === event.new.id ? event.new : t)
            : [...prev, event.new];
        });
        addLog(`Événement ${event.eventType}: ${event.new.description}`);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test Synchronisation Tâches</h2>
      <button 
        onClick={testCreate}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
      >
        Créer Tâche Test
      </button>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Journal des Événements:</h3>
        <div className="bg-gray-100 p-3 rounded max-h-40 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="text-sm font-mono">
              [{log.timestamp}] {log.message}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Tâches Synchronisées:</h3>
        <ul className="space-y-2">
          {tasks.filter(t => t.id).map(task => (
            <li key={task.id} className="flex items-center justify-between p-2 border-b">
              <span>
                {task.description} - 
                <span className={`ml-2 ${
                  task.status === 'completed' ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {task.status}
                </span>
              </span>
              {task.status !== 'completed' && (
                <button 
                  onClick={() => task.id && testUpdate(task.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                >
                  Compléter
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
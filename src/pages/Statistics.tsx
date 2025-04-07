import { useTaskStore } from '../store/taskStore';
import { Task } from '../types/task';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Statistics() {
  const { tasks } = useTaskStore();
  const [selectedClient] = useState<string>('all');
  const [dateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });

  // Client list available but not currently used
  // const clients = getClients(tasks);

  const filterTasks = (tasks: Task[]) => {
    let filteredTasks = [...tasks];
    
    // Filter by date range
    filteredTasks = filteredTasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= dateRange.start && taskDate <= dateRange.end;
    });

    // Filter by client
    if (selectedClient !== 'all') {
      filteredTasks = filteredTasks.filter(task => task.client.id === selectedClient);
    }

    return filteredTasks;
  };

  const filteredTasks = filterTasks(tasks);


  const getPriorityData = (tasks: Task[]) => {
    const priorityCount = {
      high: 0,
      medium: 0,
      low: 0
    };

    tasks.forEach(task => {
      priorityCount[task.priority]++;
    });

    return [
      { name: 'High', value: priorityCount.high },
      { name: 'Medium', value: priorityCount.medium },
      { name: 'Low', value: priorityCount.low }
    ];
  };

  const priorityData = getPriorityData(filteredTasks);

  return (
    <div className="p-6">
      {/* Filters and charts implementation */}
      <div className="grid gap-6">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={priorityData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" name="Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
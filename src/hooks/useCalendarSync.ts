import { useState, useEffect, useCallback, useRef } from 'react';
import { useTaskStore } from '../store/taskStore';
import { useCalendarStore } from '../store/calendarStore';
import { filterTasksForDateRange, groupTasksByDate } from '../utils/calendarViewSync';
import { Task } from '../types/task';

export function useCalendarSync() {
  const [visibleTasks, setVisibleTasks] = useState<Task[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<Record<string, Task[]>>({});
  const { tasks } = useTaskStore();
  const { currentDate, view, filters, lastSync, getVisibleDateRange } = useCalendarStore();
  
  // Use a ref to track if we're in the first render
  const isFirstRender = useRef(true);

  const syncTasks = useCallback(() => {
    try {
      const validTasks = [...tasks];

      // Get visible date range based on current view
      const { start, end } = getVisibleDateRange();

      // Filter tasks for the visible range and apply filters
      const filteredTasks = filterTasksForDateRange(validTasks, start, end);

      // Sort tasks by date, time and priority
      const sortedTasks = filteredTasks.sort((a, b) => {
        // Sort by date first
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;

        // Then by time
        const timeCompare = a.time.start.localeCompare(b.time.start);
        if (timeCompare !== 0) return timeCompare;

        // Finally by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      setVisibleTasks(sortedTasks);
      setGroupedTasks(groupTasksByDate(sortedTasks));
    } catch (error) {
      console.error('Error syncing tasks:', error);
      setVisibleTasks([]);
      setGroupedTasks({});
    }
  }, [tasks, currentDate, view, filters, getVisibleDateRange]);

  // Sync when dependencies change, but skip the first render
  // Sync whenever tasks change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      syncTasks();
    }, 100); // Small debounce to avoid excessive updates

    return () => clearTimeout(timeoutId);
  }, [tasks, syncTasks]);

  // Also sync when calendar view/filters change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    syncTasks();
  }, [currentDate, view, filters, lastSync, syncTasks]);

  // Initial sync
  useEffect(() => {
    syncTasks();
  }, []);

  return {
    tasks: visibleTasks,
    groupedTasks,
    forceSync: syncTasks
  };
}
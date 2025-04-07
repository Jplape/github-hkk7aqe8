import { useCallback } from 'react';
import { addDays, addMonths, subMonths, subDays } from 'date-fns';
import { useCalendarStore } from '../store/calendarStore';

export function useCalendarNavigation() {
  const { currentDate, view, setCurrentDate, setView, getVisibleDateRange } = useCalendarStore();

  const navigate = useCallback((direction: 'prev' | 'next') => {
    const currentDate = useCalendarStore.getState().currentDate;
    let newDate = currentDate;
    
    switch (view) {
      case 'month':
        newDate = direction === 'prev'
          ? subMonths(currentDate, 1)
          : addMonths(currentDate, 1);
        break;
      case 'week':
        newDate = direction === 'prev'
          ? subDays(currentDate, 7)
          : addDays(currentDate, 7);
        break;
      case 'day':
        newDate = direction === 'prev'
          ? subDays(currentDate, 1)
          : addDays(currentDate, 1);
        break;
    }
    
    setCurrentDate(newDate);
  }, [view, setCurrentDate]);

  return {
    currentDate,
    view,
    setView,
    navigate,
    getVisibleRange: getVisibleDateRange
  };
}
import { useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';

export function useTaskSubscription() {
  const { initRealtime } = useTaskStore();

  useEffect(() => {
    console.log('Initializing realtime subscription');
    const cleanup = initRealtime();
    
    return () => {
      console.log('Cleaning up realtime subscription');
      cleanup?.();
    };
  }, [initRealtime]);
}
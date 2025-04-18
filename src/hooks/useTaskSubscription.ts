import { useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';

export function useTaskSubscription() {
  const { initRealtime } = useTaskStore();

  useEffect(() => {
    // Unified logging format
    console.debug('[Realtime] Initializing subscription');
    
    let cleanup: (() => void) | undefined;
    const init = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('Starting realtime subscription');
        }
        cleanup = await initRealtime();
      } catch (err) {
        const error = err as Error;
        if (error instanceof Error) {
          console.error(`[${navigator.userAgent}] Subscription error:`, {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        } else {
          console.error(`[${navigator.userAgent}] Unknown subscription error:`, err);
        }
      }
    };

    init();

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Cleaning up subscription');
      }
      if (cleanup) {
        try {
          cleanup();
          if (process.env.NODE_ENV === 'development') {
            console.log('Cleanup completed');
          }
        } catch (err) {
          const error = err as Error;
          if (error instanceof Error) {
            console.error(`[${navigator.userAgent}] Cleanup error:`, {
              name: error.name,
              message: error.message,
              stack: error.stack
            });
          } else {
            console.error(`[${navigator.userAgent}] Unknown cleanup error:`, err);
          }
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('No cleanup needed');
        }
      }
    };
  }, [initRealtime]);
}
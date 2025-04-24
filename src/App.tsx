import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import useSyncReports from './hooks/useSyncReports';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Teams from './pages/Teams';
import Clients from './pages/Clients';
import Equipment from './pages/Equipment';
import Tasks from './pages/Tasks';
import TestTaskPage from './pages/TestTaskPage';
import Statistics from './pages/Statistics';
import Chatbot from './pages/Chatbot';
import Settings from './pages/Settings';
import InterventionReports from './pages/InterventionReports';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SyncStatus } from './components/SyncStatus';
import { useTaskSubscription } from './hooks/useTaskSubscription';

// Block extension errors and messages
if (typeof window !== 'undefined') {
  window.addEventListener('error', (e) => {
    if (e.message.includes('sliderBarShow')) {
      e.preventDefault();
    }
  });

  if (navigator.userAgent.includes('Chrome')) {
    const originalLog = console.log;
    console.log = function(message?: any, ...optionalParams: any[]) {
      if (typeof message === 'string' &&
          !message.includes('content api') &&
          !message.includes('isOpened') &&
          !message.includes('is_settings_open')) {
        originalLog(message, ...optionalParams);
      }
    };
  }
}


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

export default function App() {
  const user = useAuthStore((state) => state.user);
  useSyncReports(); // Initialize reports sync with Firestore
  useTaskSubscription(); // Initialize realtime task updates

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <>
          <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
              <Route path="/test-task-sync" element={<TestTaskPage />} />
              
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/equipment" element={<Equipment />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/intervention-reports" element={<InterventionReports />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
        </>
        <SyncStatus />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

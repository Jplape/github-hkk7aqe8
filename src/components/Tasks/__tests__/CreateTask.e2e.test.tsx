import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTaskStore } from '../../../store/taskStore';
import Tasks from '../../../pages/Tasks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      cacheTime: 0,
    },
  },
});

// Reset store before each test
beforeEach(() => {
  useTaskStore.setState({ tasks: [] });
});

describe('Task Creation E2E', () => {
  it('should create a task and sync with backend', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Tasks />
      </QueryClientProvider>
    );

    // Open modal
    const addButton = await screen.findByRole('button', { name: /add task/i });
    fireEvent.click(addButton);

    // Fill form
    const titleInput = screen.getByLabelText(/title/i);
    fireEvent.change(titleInput, { target: { value: 'New Task' } });

    const dateInput = screen.getByLabelText(/date/i);
    fireEvent.change(dateInput, { target: { value: '2025-04-20' } });

    // Submit
    const submitButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(submitButton);

    // Verify
    await waitFor(() => {
      const store = useTaskStore.getState();
      expect(store.tasks.some(t => t.title === 'New Task')).toBeTruthy();
    });
  });
});
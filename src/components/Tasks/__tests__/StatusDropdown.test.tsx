import { render, screen, fireEvent } from '@testing-library/react';
import StatusDropdown from '../StatusDropdown';
import { useTaskStore } from '../../../store/taskStore';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'react-hot-toast';

jest.mock('../../../store/taskStore');
jest.mock('../../../store/authStore');
jest.mock('react-hot-toast');

describe('StatusDropdown', () => {
  const mockUpdateTaskStatus = jest.fn();
  const mockUser = { id: 'user1', role: 'technician' };

  beforeEach(() => {
    (useTaskStore as unknown as jest.Mock).mockReturnValue({
      updateTaskStatus: mockUpdateTaskStatus
    });
    (useAuthStore as unknown as jest.Mock).mockReturnValue({
      user: mockUser
    });
  });

  it('should display error toast when status update fails', async () => {
    const error = new Error('Test error');
    mockUpdateTaskStatus.mockRejectedValue(error);

    render(
      <StatusDropdown 
        taskId="task1" 
        currentStatus="todo" 
        taskUserId="user1" 
      />
    );

    fireEvent.click(screen.getByText('À faire'));
    fireEvent.click(screen.getByText('En cours'));

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(toast.error).toHaveBeenCalledWith('Test error');
  });

  it('should display formatted error message from store', async () => {
    const error = new Error('Failed to update task after 3 attempts: Supabase error: connection failed');
    mockUpdateTaskStatus.mockRejectedValue(error);

    render(
      <StatusDropdown 
        taskId="task1" 
        currentStatus="todo" 
        taskUserId="user1" 
      />
    );

    fireEvent.click(screen.getByText('À faire'));
    fireEvent.click(screen.getByText('En cours'));

    await new Promise(resolve => setTimeout(resolve, 0));

    expect(toast.error).toHaveBeenCalledWith('Failed to update task after 3 attempts: Supabase error: connection failed');
  });
});
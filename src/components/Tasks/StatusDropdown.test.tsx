/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusDropdown from './StatusDropdown';
import * as statusRules from '../../lib/statusRules';

// Mock des stores
const mockUpdateTaskStatus = jest.fn();
const mockUser = { id: 'user-123', role: 'user' };

jest.mock('../../store/authStore', () => ({
  useAuthStore: () => ({ user: mockUser })
}));

jest.mock('../../store/taskStore', () => ({
  useTaskStore: () => ({ updateTaskStatus: mockUpdateTaskStatus })
}));

jest.mock('../../lib/statusRules');

describe('StatusDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render current status', () => {
    render(<StatusDropdown taskId="task-1" currentStatus="todo" taskUserId="user-123" />);
    expect(screen.getByText('À faire')).toBeInTheDocument();
  });

  it('should allow valid transitions', async () => {
    (statusRules.isTransitionAllowed as jest.Mock).mockReturnValue(true);
    (statusRules.validateRLS as jest.Mock).mockReturnValue(true);

    render(<StatusDropdown taskId="task-1" currentStatus="todo" taskUserId="user-123" />);
    fireEvent.click(screen.getByText('À faire'));
    fireEvent.click(screen.getByText('En cours'));

    expect(mockUpdateTaskStatus).toHaveBeenCalledWith('task-1', 'in_progress');
  });

  it('should block invalid transitions', async () => {
    (statusRules.isTransitionAllowed as jest.Mock).mockReturnValue(false);

    render(<StatusDropdown taskId="task-1" currentStatus="todo" taskUserId="user-123" />);
    fireEvent.click(screen.getByText('À faire'));
    fireEvent.click(screen.getByText('Terminée'));

    expect(mockUpdateTaskStatus).not.toHaveBeenCalled();
  });

  it('should enforce RLS rules', async () => {
    (statusRules.isTransitionAllowed as jest.Mock).mockReturnValue(true);
    (statusRules.validateRLS as jest.Mock).mockReturnValue(false);

    render(<StatusDropdown taskId="task-1" currentStatus="todo" taskUserId="user-123" />);
    fireEvent.click(screen.getByText('À faire'));
    fireEvent.click(screen.getByText('En cours'));

    expect(mockUpdateTaskStatus).not.toHaveBeenCalled();
  });
});
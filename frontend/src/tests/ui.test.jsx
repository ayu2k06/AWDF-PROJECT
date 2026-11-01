import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Modal, StatusBadge } from '../components/ui/index';

describe('shared UI components', () => {
  it('renders the task status label and style variant', () => {
    render(<StatusBadge status="in-progress" />);

    expect(screen.getByText('In Progress')).toHaveClass('status-in-progress');
  });

  it('renders an accessible modal and calls its close action', () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="Create task">Task form content</Modal>);

    expect(screen.getByRole('dialog', { name: 'Create task' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

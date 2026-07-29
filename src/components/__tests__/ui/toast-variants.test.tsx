import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastClose,
} from '../../ui/toast';

describe('Toast Variants', () => {
  const ToastWrapper = ({ children }: { children: React.ReactNode }) => (
    <ToastProvider>
      {children}
      <ToastViewport data-testid="toast-viewport" />
    </ToastProvider>
  );

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should show success toast', async () => {
    render(
      <ToastWrapper>
        <Toast data-testid="success-toast" variant="default">
          <ToastTitle>Operation successful</ToastTitle>
        </Toast>
      </ToastWrapper>
    );

    const toast = screen.getByTestId('success-toast');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass('border-l-2');
    expect(screen.getByText('Operation successful')).toBeInTheDocument();
  });

  it('should show error toast', async () => {
    render(
      <ToastWrapper>
        <Toast data-testid="error-toast" variant="destructive">
          <ToastTitle>Operation failed</ToastTitle>
        </Toast>
      </ToastWrapper>
    );

    const toast = screen.getByTestId('error-toast');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass('bg-destructive');
    expect(toast).toHaveClass('text-destructive-foreground');
    expect(screen.getByText('Operation failed')).toBeInTheDocument();
  });

  it('should show warning toast', async () => {
    render(
      <ToastWrapper>
        <Toast data-testid="warning-toast" variant="warning">
          <ToastTitle>Warning message</ToastTitle>
        </Toast>
      </ToastWrapper>
    );

    const toast = screen.getByTestId('warning-toast');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveClass('bg-warning');
    expect(toast).toHaveClass('text-warning-foreground');
    expect(screen.getByText('Warning message')).toBeInTheDocument();
  });

  it('should handle toast with description', () => {
    render(
      <ToastWrapper>
        <Toast data-testid="toast-with-description">
          <ToastTitle>Title</ToastTitle>
          <ToastDescription>Description text</ToastDescription>
        </Toast>
      </ToastWrapper>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description text')).toBeInTheDocument();
  });

  it('should handle toast with action', () => {
    const handleAction = jest.fn();
    render(
      <ToastWrapper>
        <Toast data-testid="toast-with-action">
          <ToastTitle>Action Toast</ToastTitle>
          <ToastAction 
            onClick={handleAction} 
            data-testid="toast-action"
            altText="Perform action"
          >
            Action
          </ToastAction>
        </Toast>
      </ToastWrapper>
    );

    const actionButton = screen.getByTestId('toast-action');
    fireEvent.click(actionButton);
    expect(handleAction).toHaveBeenCalled();
  });

  it('should handle toast close', () => {
    const handleOpenChange = jest.fn();
    render(
      <ToastWrapper>
        <Toast 
          data-testid="toast-with-close" 
          onOpenChange={handleOpenChange}
        >
          <ToastTitle>Closeable Toast</ToastTitle>
          <ToastClose data-testid="toast-close" />
        </Toast>
      </ToastWrapper>
    );

    const closeButton = screen.getByTestId('toast-close');
    fireEvent.click(closeButton);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});

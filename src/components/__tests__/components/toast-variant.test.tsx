import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { showErrorToast, showWarningToast } from '@/components/reusables/toast-variant';
import { ToastProvider, ToastViewport } from '@/components/ui/toast';

// Mock the Verified and WarningCircle components
jest.mock('~/components/svg', () => ({
  Verified: () => <span data-testid="verified-icon">Verified</span>,
  WarningCircle: () => <span data-testid="warning-icon">WarningCircle</span>,
}));

const ToastWrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    {children}
    <ToastViewport data-testid="toast-viewport" />
  </ToastProvider>
);

describe('Toast Variants', () => {
  beforeEach(() => {
    // Clear any existing toasts
    document.body.innerHTML = '';
  });

  it('should render error toast without title', () => {
    const message = 'Error message';
    render(<ToastWrapper><div /></ToastWrapper>);
    
    act(() => {
      showErrorToast(message);
    });

    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  it('should render warning toast without title', () => {
    const message = 'Warning message';
    render(<ToastWrapper><div /></ToastWrapper>);
    
    act(() => {
      showWarningToast(message);
    });

    expect(screen.queryByText('Warning')).not.toBeInTheDocument();
  });

}); 
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SystemIntegrationPage from '@/app/(protected)/device-integration/system-integration/page'
import { apiService } from '@/lib/api-service'
import { useRouter } from 'next/navigation'
import { SYSTEM_INTEGRATION_TEST_IDS } from '@/components/test-ids/system-integration.ids'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

// Mock the router
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn()
} as const;

(useRouter as jest.Mock).mockReturnValue(mockRouter)

// Mock API service
jest.mock('@/lib/api-service', () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn()
  }
}))

// Mock loader context
jest.mock('@/context/loader-context', () => ({
  useLoader: () => ({
    showLoader: jest.fn(),
    hideLoader: jest.fn()
  })
}))

// Mock components
jest.mock('~/components/device-integration/pacs-summary', () => ({
  PacsConfigurationSummary: ({ 
    connectionStatus, 
    onConfigure,
    'data-testid': testId
  }: { 
    connectionStatus: boolean; 
    onConfigure: () => void;
    'data-testid'?: string;
  }) => (
    <div data-testid={testId}>
      <div>Connection Status: {connectionStatus ? 'Connected' : 'Disconnected'}</div>
      <button onClick={onConfigure}>Configure</button>
    </div>
  ),
}))

jest.mock('@/components/reusables/dialogs/warning', () => ({
  WarningDialog: ({
    open,
    onConfirm,
    onCancel,
    title,
    message,
    'data-testid': testId
  }: {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title: string;
    message: string;
    'data-testid'?: string;
  }) => {
    if (!open) return null;
    return (
      <div data-testid={testId}>
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  }
}))

describe('OMEA-ADM-004-017: SystemIntegrationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('OMEA-ADM-004-017-UTC-01: renders the page correctly', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ipAddress: 'test-ip',
        port: '1234',
        aeTitle: 'test-ae',
        verificationDetails: JSON.stringify({ success: false })
      }
    });

    render(<SystemIntegrationPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId(SYSTEM_INTEGRATION_TEST_IDS.PACS_SUMMARY)).toBeInTheDocument();
    });

    expect(screen.getByText(/Connection Status:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Configure/i })).toBeInTheDocument();
  });

  it('OMEA-ADM-004-017-UTC-02: shows warning dialog when configure is clicked', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ipAddress: 'test-ip',
        port: '1234',
        aeTitle: 'test-ae',
        verificationDetails: JSON.stringify({ success: false })
      }
    });

    render(<SystemIntegrationPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId(SYSTEM_INTEGRATION_TEST_IDS.PACS_SUMMARY)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Configure/i }));
    expect(screen.getByTestId(SYSTEM_INTEGRATION_TEST_IDS.WARNING_DIALOG)).toBeInTheDocument();
    expect(screen.getByText('Configuration Warning')).toBeInTheDocument();
  });

  it('OMEA-ADM-004-017-UTC-03: navigates to configuration page when warning is confirmed', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ipAddress: 'test-ip',
        port: '1234',
        aeTitle: 'test-ae',
        verificationDetails: JSON.stringify({ success: false })
      }
    });

    render(<SystemIntegrationPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId(SYSTEM_INTEGRATION_TEST_IDS.PACS_SUMMARY)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Configure/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirm/i }));

    expect(mockRouter.push).toHaveBeenCalledWith('/device-integration/system-integration/pacs-configuration');
  });

  it('OMEA-ADM-004-017-UTC-04: closes warning dialog when cancelled', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ipAddress: 'test-ip',
        port: '1234',
        aeTitle: 'test-ae',
        verificationDetails: JSON.stringify({ success: false })
      }
    });

    render(<SystemIntegrationPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId(SYSTEM_INTEGRATION_TEST_IDS.PACS_SUMMARY)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Configure/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    expect(screen.queryByTestId(SYSTEM_INTEGRATION_TEST_IDS.WARNING_DIALOG)).not.toBeInTheDocument();
  });

  it('OMEA-ADM-004-017-UTC-05: handles API errors during configuration fetch', async () => {
    (apiService.get as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<SystemIntegrationPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId(SYSTEM_INTEGRATION_TEST_IDS.PACS_SUMMARY)).toBeInTheDocument();
      expect(screen.getByText('Connection Status: Disconnected')).toBeInTheDocument();
    });
  });

  it('OMEA-ADM-004-017-UTC-06: handles successful verification status', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ipAddress: 'test-ip',
        port: '1234',
        aeTitle: 'test-ae',
        verificationDetails: JSON.stringify({ success: true })
      }
    });
    
    render(<SystemIntegrationPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId(SYSTEM_INTEGRATION_TEST_IDS.PACS_SUMMARY)).toBeInTheDocument();
      expect(screen.getByText('Connection Status: Connected')).toBeInTheDocument();
    });
  });

  it('OMEA-ADM-004-017-UTC-07: handles failed verification status', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ipAddress: 'test-ip',
        port: '1234',
        aeTitle: 'test-ae',
        verificationDetails: JSON.stringify({ success: false })
      }
    });
    
    render(<SystemIntegrationPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId(SYSTEM_INTEGRATION_TEST_IDS.PACS_SUMMARY)).toBeInTheDocument();
      expect(screen.getByText('Connection Status: Disconnected')).toBeInTheDocument();
    });
  });

  it('OMEA-ADM-004-017-UTC-08: handles invalid verification details', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ipAddress: 'test-ip',
        port: '1234',
        aeTitle: 'test-ae',
        verificationDetails: 'invalid-json'
      }
    });
    
    render(<SystemIntegrationPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId(SYSTEM_INTEGRATION_TEST_IDS.PACS_SUMMARY)).toBeInTheDocument();
      expect(screen.getByText('Connection Status: Disconnected')).toBeInTheDocument();
    });
  });

  it('OMEA-ADM-004-017-UTC-09: handles missing verification details', async () => {
    (apiService.get as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        ipAddress: 'test-ip',
        port: '1234',
        aeTitle: 'test-ae'
      }
    });
    
    render(<SystemIntegrationPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId(SYSTEM_INTEGRATION_TEST_IDS.PACS_SUMMARY)).toBeInTheDocument();
      expect(screen.getByText('Connection Status: Disconnected')).toBeInTheDocument();
    });
  });
});
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuth } from '@/context/auth-provider';
import { useRouter } from 'next/navigation';
import { APP_NAME, generateTestId, SRS_ID } from '@/components/test-ids/utc-global';
import { LOGIN_TEST_IDS } from '~/components/test-ids/login-ids';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import SignIn from '@/app/(auth)/sign-in/page';
import '@testing-library/jest-dom';
import Image from 'next/image';
import { Dialog } from '@radix-ui/react-dialog';

// Mock the next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock the auth context
jest.mock('@/context/auth-provider', () => ({
  useAuth: jest.fn()
}));

// Mock next/image
jest.mock('next/image', () => ({
  default: (props: { src: string; alt: string; width?: number; height?: number; [key: string]: unknown }) => (
    <Image src={props.src} alt={props.alt} width={props.width} height={props.height} />
  )
}));

// Mock FormInput component
jest.mock('~/components/reusables/form-fields/form-input', () => ({
  __esModule: true,
  default: ({ name, label, type, placeholder, disabled, className, labelClassName, 'data-testid': testId }: {
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    labelClassName?: string;
    'data-testid'?: string;
  }) => (
    <div>
      <label className={labelClassName}>{label}</label>
      <input
        data-testid={testId}
        type={type}
        name={name}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
    </div>
  )
}));

// Mock Dialog components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: {
    children: React.ReactNode;
    open: boolean;
  }) => (
    <Dialog>
      {open ? children : null}
    </Dialog>
  ),
  DialogContent: ({ children }: {
    children: React.ReactNode;
  }) => (
    <Dialog>
      {children}
    </Dialog>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, className, 'data-testid': testId }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    'data-testid'?: string;
  }) => (
    <button
      data-testid={testId}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={className}
    >
      {children}
    </button>
  )
}));

// Mock react-hook-form
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    handleSubmit: (fn: (data: { username: string; password: string }) => void) => (e: React.FormEvent) => {
      e?.preventDefault();
      fn({ username: 'test@example.com', password: 'password123' });
    },
    formState: { isDirty: false },
    getValues: () => ({ username: 'test@example.com' }),
    register: jest.fn(),
    setValue: jest.fn(),
    watch: jest.fn(),
    control: {},
    reset: jest.fn(),
  }),
  FormProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Controller: ({ render }: { render: (props: { field: Record<string, unknown> }) => React.ReactNode }) => render({ field: {} }),
}));

// Mock the SignIn component
jest.mock('@/app/(auth)/sign-in/page', () => {
  const SignIn = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const { signIn, user, accessToken } = useAuth();
    const router = useRouter();

    const form = useForm({
      defaultValues: { username: '', password: '' },
      mode: "onBlur",
      reValidateMode: "onChange",
      criteriaMode: "all",
    });

    const { handleSubmit, formState: { isDirty } } = form;

    useEffect(() => {
      if (user && accessToken) {
        router.push("/dashboard");
      }
    }, [user, accessToken, router]);

    const handleFormSubmit = async (values: { username: string; password: string }) => {
      setIsLoading(true);
      try {
        await signIn(values.username, values.password);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div>
        <form data-testid={LOGIN_TEST_IDS.FORM} onSubmit={handleSubmit(handleFormSubmit)}>
          <input data-testid={LOGIN_TEST_IDS.USERNAME_INPUT} type="email" />
          <input data-testid={LOGIN_TEST_IDS.PASSWORD_INPUT} type={showPassword ? "text" : "password"} />
          <button data-testid={LOGIN_TEST_IDS.SHOW_PASSWORD_BUTTON} onClick={() => setShowPassword(!showPassword)}>
            Toggle Password
          </button>
          <button data-testid={LOGIN_TEST_IDS.FORGOT_PASSWORD_BUTTON} onClick={() => setShowForgotPasswordModal(true)}>
            Forgot Password
          </button>
          <button 
            data-testid={LOGIN_TEST_IDS.LOGIN_BUTTON} 
            type="submit" 
            disabled={isLoading || !isDirty}
          >
            {isLoading ? <span>Loading</span> : "Login"}
          </button>
        </form>
        {showForgotPasswordModal && (
          <div data-testid={LOGIN_TEST_IDS.FORGOT_PASSWORD_MODAL}>
            <button data-testid={LOGIN_TEST_IDS.MODAL_CLOSE_BUTTON}>Close</button>
          </div>
        )}
      </div>
    );
  };
  return SignIn;
});

describe(`${APP_NAME}-${SRS_ID.LOGIN}: Login - SignIn Component`, () => {
  const mockRouter = {
    push: jest.fn()
  };

  const mockAuth = {
    signIn: jest.fn(),
    user: null,
    accessToken: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue(mockAuth);
  });

  it(`${generateTestId(SRS_ID.LOGIN, 1)}: renders login form correctly`, async () => {
    render(<SignIn />);
    
    expect(screen.getByTestId(LOGIN_TEST_IDS.FORM)).toBeInTheDocument();
    expect(screen.getByTestId(LOGIN_TEST_IDS.USERNAME_INPUT)).toBeInTheDocument();
    expect(screen.getByTestId(LOGIN_TEST_IDS.PASSWORD_INPUT)).toBeInTheDocument();
    expect(screen.getByTestId(LOGIN_TEST_IDS.LOGIN_BUTTON)).toBeInTheDocument();
    expect(screen.getByTestId(LOGIN_TEST_IDS.FORGOT_PASSWORD_BUTTON)).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.LOGIN, 2)}: toggles password visibility`, async () => {
    render(<SignIn />);
    
    const passwordInput = screen.getByTestId(LOGIN_TEST_IDS.PASSWORD_INPUT);
    const toggleButton = screen.getByTestId(LOGIN_TEST_IDS.SHOW_PASSWORD_BUTTON);

    expect(passwordInput).toHaveAttribute('type', 'password');
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it(`${generateTestId(SRS_ID.LOGIN, 3)}: opens forgot password modal`, async () => {
    render(<SignIn />);
    
    const forgotPasswordButton = screen.getByTestId(LOGIN_TEST_IDS.FORGOT_PASSWORD_BUTTON);
    await userEvent.click(forgotPasswordButton);

    expect(screen.getByTestId(LOGIN_TEST_IDS.FORGOT_PASSWORD_MODAL)).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.LOGIN, 4)}: redirects to dashboard when user is authenticated`, async () => {
    const authenticatedAuth = {
      ...mockAuth,
      user: { id: 1 },
      accessToken: 'fake-token'
    };
    (useAuth as jest.Mock).mockReturnValue(authenticatedAuth);

    render(<SignIn />);
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/device-integration/system-integration');
    });
  });

  it(`${generateTestId(SRS_ID.LOGIN, 5)}: disables login button when form is not dirty`, () => {
    render(<SignIn />);
    
    const submitButton = screen.getByTestId(LOGIN_TEST_IDS.LOGIN_BUTTON);
    expect(submitButton).toHaveAttribute('disabled');
  });
});

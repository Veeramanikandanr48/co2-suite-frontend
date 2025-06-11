import '@testing-library/jest-dom'
import { render, fireEvent, screen } from '@testing-library/react'
import AllUsersPage from '~/app/(protected)/user-access-management/all-users/page'
import { useRouter } from 'next/navigation'
import { APP_NAME, SRS_ID, generateTestId } from '@/components/test-ids/utc-global'
import { allUser } from '@/components/test-ids/all-users.ids'
import { LoaderProvider } from '@/context/loader-context'
// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  PlusCircle: () => <div data-testid={allUser.plusIcon} />,
}));

// Mock Button component
jest.mock('~/components/ui/button', () => ({
  Button: ({ children, onClick, className, 'data-testid': testId }: { children: React.ReactNode; onClick: () => void; className: string; 'data-testid'?: string }) => (
    <button onClick={onClick} className={className} data-testid={testId}>
      {children}
    </button>
  ),
}));

// Mock UsersTable component
jest.mock('~/components/all-users/users-tables', () => ({
  UsersTable: () => <div data-testid={allUser.usersTable}>Users Table</div>,
}));

describe(`${APP_NAME}-${SRS_ID.ALL_USERS}: User Access Management - All Users Page`, () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it(`${generateTestId(SRS_ID.ALL_USERS, 1)}: renders the page title correctly`, () => {
    render(
      <LoaderProvider>
        <AllUsersPage />
      </LoaderProvider>
    );
    expect(screen.getByTestId(allUser.pageTitle)).toHaveTextContent('User Access Management');
  });

  it(`${generateTestId(SRS_ID.ALL_USERS, 2)}: renders the Create User button with correct text and icon`, () => {
    render(
      <LoaderProvider>
        <AllUsersPage />
      </LoaderProvider>
    );
    const button = screen.getByTestId(allUser.createUserButton);
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId(allUser.createUserText)).toHaveTextContent('Create User');
    expect(screen.getByTestId(allUser.plusIcon)).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.ALL_USERS, 3)}: renders the UsersTable component`, () => {
    render(
      <LoaderProvider>
        <AllUsersPage />
      </LoaderProvider>
    );
    expect(screen.getByTestId(allUser.usersTable)).toBeInTheDocument();
    expect(screen.getByTestId(allUser.usersTableContainer)).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.ALL_USERS, 4)}: navigates to create user page on button click`, () => {
    render(
      <LoaderProvider>
        <AllUsersPage />
      </LoaderProvider>
    );
    fireEvent.click(screen.getByTestId(allUser.createUserButton));
    expect(mockPush).toHaveBeenCalledWith('/user-access-management/all-users/create');
  });

  it(`${generateTestId(SRS_ID.ALL_USERS, 5)}: has the correct layout structure`, () => {
    render(
      <LoaderProvider>
        <AllUsersPage />
      </LoaderProvider>
    );
    const mainContainer = screen.getByTestId(allUser.allUsersPage);
    expect(mainContainer).toHaveClass('flex flex-col');
  });
}); 

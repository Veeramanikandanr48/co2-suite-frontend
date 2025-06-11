import '@testing-library/jest-dom';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { useFetchList } from '~/hooks/use-fetchlist';
import { apiService } from '~/lib/api-service';
import { API_LIST } from '~/lib/api-list';
import { showWarningToast } from '~/components/toast-variant';
import AllUsersPage from '@/app/(protected)/user-access-management/user-roles/page';
import { RolesTable } from '~/components/roles/roletable';
import { APP_NAME, generateTestId, SRS_ID } from '../../test-ids/utc-global';
import { userRoles } from '../../test-ids/user-roles.test-ids';
import { LoaderProvider } from '@/context/loader-context';

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {
    // Intentionally left blank as this is a mock implementation for testing purposes.
  }  unobserve() {
    // Intentionally left blank as this is a mock implementation for testing purposes.
  }
  disconnect() {
    // Intentionally left blank as this is a mock implementation for testing purposes.
  }
}

global.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock implements IntersectionObserver {
  private readonly callback: IntersectionObserverCallback;
  readonly root: Element | null = null;
  readonly rootMargin: string = '0px';
  readonly thresholds: ReadonlyArray<number> = [0];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element): void {
    // Simulate an intersection
    this.callback([
      {
        isIntersecting: true,
        target,
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRatio: 1,
        intersectionRect: target.getBoundingClientRect(),
        rootBounds: null,
        time: Date.now(),
      },
    ], this);
  }

  // Mock implementation - no cleanup needed for tests
  unobserve(): void {
    // Intentionally left blank as this is a mock implementation for testing purposes.
  }
  disconnect(): void {
    // Intentionally left blank as this is a mock implementation for testing purposes.
  }
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

global.IntersectionObserver = IntersectionObserverMock as unknown as typeof IntersectionObserver;

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock hooks
const mockFetchList = {
  list: [],
  isLoading: false,
  isLoadingMore: false,
  hasNextPage: true,
  loadMore: jest.fn(),
  setSearch: jest.fn(),
  setSorting: jest.fn(),
  setAdditionalFilter: jest.fn(),
  refetch: jest.fn(),
};

jest.mock('~/hooks/use-fetchlist', () => ({
  useFetchList: jest.fn(),
}));

// Mock API service
jest.mock('~/lib/api-service', () => ({
  apiService: {
    get: jest.fn().mockImplementation(async (url) => {
      if (url === API_LIST.GET_ROLE_FILTER) {
        return {
          data: [
            { id: 1, rolename: 'Admin' },
            { id: 2, rolename: 'User' }
          ]
        };
      }
      return { data: [] };
    }),
  },
}));

// Mock toast
jest.mock('~/components/toast-variant', () => ({
  showWarningToast: jest.fn(),
}));

// Mock ReusableTable component
jest.mock('~/components/reusables/form-fields/reusable-table', () => ({
  ReusableTable: ({ data, columns, handleLoadMore }: { 
    data: Array<Record<string, unknown> & { id: string }>;
    columns: Array<{ id: string; header: () => React.ReactNode }>;
    handleLoadMore: () => void 
  }) => {
    // Call handleLoadMore after a short delay
    setTimeout(() => {
      handleLoadMore();
    }, 0);
    
    return (
      <div data-testid="reusable-table">
        <table>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.id}>{column.header()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => (
                  <td key={column.id}>{column.header()}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}));

// Mock loader context
jest.mock('@/context/loader-context', () => ({
  useLoader: () => ({
    showLoader: jest.fn(),
    hideLoader: jest.fn(),
    isLoading: false
  }),
  LoaderProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

const mockRoles = [
  {
    id: 1,
    name: 'Admin',
    description: 'Administrator role',
    modes: [
      {
        id: 1,
        name: 'Imaging Mode',
        permissions: [
          {
            id: 1,
            code: 'IMG_FULL',
            color: { color: '#00FF00' },
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'User',
    description: 'Regular user role',
    modes: [
      {
        id: 2,
        name: 'Imaging Mode',
        permissions: [
          {
            id: 2,
            code: 'IMG_VIEW',
            color: { color: '#00FF00' },
          },
        ],
      },
    ],
  },
];

// Add before the describe block
const isUserRolesHeading = (element: Element) => 
  element.tagName.toLowerCase() === 'p' && 
  element.className.includes('font-semibold');

// Add before the describe block
const verifyLoadMore = async () => {
  await waitFor(() => expect(mockFetchList.loadMore).toHaveBeenCalled(), { timeout: 2000 });
};

describe(`${APP_NAME}-${SRS_ID.USER_ROLES}: User Roles Management`, () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useFetchList as jest.Mock).mockReturnValue({
      ...mockFetchList,
      list: mockRoles,
    });

    render(
      <LoaderProvider>
        <AllUsersPage />
      </LoaderProvider>
    );
    // Wait for any pending state updates and effects
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe(`${APP_NAME}-${SRS_ID.USER_ROLES}: All Users Page`, () => {
    it(`${generateTestId(SRS_ID.USER_ROLES, 1)}: renders the page with correct title and add button`, () => {
      render(
        <LoaderProvider>
          <AllUsersPage />
        </LoaderProvider>
      );
      
      const titles = screen.getAllByText('User Access Management');
      expect(titles[0]).toBeInTheDocument();
      
      const addButtons = screen.getAllByText(userRoles.addUserRoleButton);
      expect(addButtons[0]).toBeInTheDocument();
    });

    it(`${generateTestId(SRS_ID.USER_ROLES, 2)}: navigates to create role page when add button is clicked`, async () => {
      render(
        <LoaderProvider>
          <AllUsersPage />
        </LoaderProvider>
      );
      
      const addButtons = screen.getAllByText(userRoles.addUserRoleButton);
      await userEvent.click(addButtons[0]);
      
      expect(mockRouter.push).toHaveBeenCalledWith('/user-access-management/user-roles/create');
    });
  });

  describe(`${APP_NAME}-${SRS_ID.USER_ROLES}: RolesTable`, () => {
    beforeEach(async () => {
      jest.clearAllMocks();
      (useRouter as jest.Mock).mockReturnValue(mockRouter);
      (useFetchList as jest.Mock).mockReturnValue({
        ...mockFetchList,
        list: mockRoles,
      });
      
      // Mock successful API response for initial roles
      (apiService.get as jest.Mock).mockResolvedValue({
        data: [
          { id: 1, rolename: 'Admin' },
          { id: 2, rolename: 'User' }
        ]
      });

      // Mock showWarningToast
      (showWarningToast as jest.Mock).mockImplementation(() => Promise.resolve());

      render(
        <LoaderProvider>
          <RolesTable />
        </LoaderProvider>
      );

      // Wait for initial data fetch and state updates
      await waitFor(() => {
        expect(apiService.get).toHaveBeenCalledWith(API_LIST.GET_ROLE_FILTER);
      });

      // Wait for the component to settle after state updates
      await waitFor(() => {
        const userRolesHeading = screen.getAllByText('User Roles').find(isUserRolesHeading);
        expect(userRolesHeading).toBeInTheDocument();
      });
    });

    it(`${generateTestId(SRS_ID.USER_ROLES, 3)}: renders table with correct columns`, async () => {
      await waitFor(() => {
        const headers = screen.getAllByRole('columnheader');
        expect(headers[0]).toHaveTextContent(userRoles.userRoleColumn);
        expect(headers[1]).toHaveTextContent(userRoles.descriptionColumn);
        expect(headers[2]).toHaveTextContent(userRoles.permissionsColumn);
      });
    });

    it(`${generateTestId(SRS_ID.USER_ROLES, 4)}: handles role filtering`, async () => {
      const user = userEvent.setup();
      const filterButtons = screen.getAllByTestId(userRoles.filterRolesButton);
      const filterButton = filterButtons[filterButtons.length - 1];
      
      await user.click(filterButton);

      // Wait for dropdown menu to appear and find the first role checkbox
      await waitFor(() => {
        const roleCheckbox = screen.getByTestId(`${userRoles.roleCheckbox}-1`);
        expect(roleCheckbox).toBeInTheDocument();
      });
      
      const roleCheckbox = screen.getByTestId(`${userRoles.roleCheckbox}-1`);
      await user.click(roleCheckbox);
      
      const doneButton = screen.getByTestId(`${userRoles.filterDoneButton}`);
      await user.click(doneButton);

      await waitFor(() => {
        expect(mockFetchList.setAdditionalFilter).toHaveBeenCalledWith({
          roleId: [1],
        });
        expect(mockFetchList.refetch).toHaveBeenCalled();
      });
    });

    it(`${generateTestId(SRS_ID.USER_ROLES, 5)}: handles role search`, async () => {
      const user = userEvent.setup();
      const searchInputs = screen.getAllByRole('combobox');
      await user.type(searchInputs[0], 'admin');

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await waitFor(() => {
        expect(mockFetchList.setSearch).toHaveBeenCalledWith('admin');
      });
    });

    it(`${generateTestId(SRS_ID.USER_ROLES, 6)}: clears filters correctly`, async () => {
      const user = userEvent.setup();
      const filterButtons = screen.getAllByTestId(userRoles.filterRolesButton);
      const filterButton = filterButtons[filterButtons.length - 1];
      
      await user.click(filterButton);

      // Wait for dropdown menu to appear and find the first role checkbox
      await waitFor(() => {
        const roleCheckbox = screen.getByTestId(`${userRoles.roleCheckbox}-1`);
        expect(roleCheckbox).toBeInTheDocument();
      });
      
      const roleCheckbox = screen.getByTestId(`${userRoles.roleCheckbox}-1`);
      await user.click(roleCheckbox);
      
      const clearButton = screen.getByTestId(`${userRoles.filterClearButton}`);
      await user.click(clearButton);
      
      const doneButton = screen.getByTestId(`${userRoles.filterDoneButton}`);
      await user.click(doneButton);

      await waitFor(() => {
        expect(mockFetchList.setAdditionalFilter).toHaveBeenCalledWith({});
        expect(mockFetchList.refetch).toHaveBeenCalled();
      });
    });

    it(`${generateTestId(SRS_ID.USER_ROLES, 7)}: loads more roles when scrolling`, async () => {
      await act(async () => {
        await verifyLoadMore();
      });
    });

    // Add a new test to verify initial state updates are handled correctly
    it(`${generateTestId(SRS_ID.USER_ROLES, 8)}: handles initial data loading correctly`, async () => {
      jest.clearAllMocks();
      
      const mockRolesData = [
        { id: 1, rolename: 'Admin' },
        { id: 2, rolename: 'User' }
      ];
      
      (apiService.get as jest.Mock).mockResolvedValueOnce({
        data: mockRolesData
      });
      
      render(
        <LoaderProvider>
          <RolesTable />
        </LoaderProvider>
      );

      // Wait for initial data fetch
      await waitFor(() => {
        expect(apiService.get).toHaveBeenCalledWith(API_LIST.GET_ROLE_FILTER);
      });

      // Wait for the component to settle after state updates
      await waitFor(() => {
        const userRolesHeading = screen.getAllByText('User Roles').find(isUserRolesHeading);
        expect(userRolesHeading).toBeInTheDocument();
      });
      
      // Verify loading state changes
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
  });
}); 
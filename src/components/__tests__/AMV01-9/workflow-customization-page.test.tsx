import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import Secondary from '~/app/(protected)/workflow-customization/secondary/page';
import { apiService } from '~/lib/api-service';
import { API_LIST } from '~/lib/api-list';
import { ESelectedStatus } from '~/enums/workflow-customization-enum';
import { WorkflowMaster } from '~/types/workflow';
import { generateTestId, APP_NAME, SRS_ID } from '../../test-ids/utc-global';
import { workflowCustomizationTestIds } from '../../test-ids/workflow-customization.ids';
import { LoaderProvider } from '@/context/loader-context';

// Mock API service
jest.mock('~/lib/api-service', () => ({
  apiService: {
    post: jest.fn(),
    get: jest.fn(),
    getById: jest.fn(),
    put: jest.fn(),
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

// Mock components
jest.mock('~/components/workflow-customization/workflow-list', () => ({
  __esModule: true,
  default: ({ 
    standardWorkflows = [] as WorkflowMaster[], 
    customWorkflows = [] as WorkflowMaster[], 
    onSearch, 
    onSort, 
    onSelectWorkflow,
    onDuplicateEdit,
    onEditWorkflow
  }: {
    standardWorkflows?: WorkflowMaster[];
    customWorkflows?: WorkflowMaster[];
    onSearch: (searchTerm: string) => void;
    onSort: (sortOptions: { field: string; order: number }) => void;
    onSelectWorkflow: (workflow: WorkflowMaster) => void;
    onDuplicateEdit: (workflow: WorkflowMaster) => void;
    onEditWorkflow?: (workflow: WorkflowMaster) => void;
  }) => (
    <div data-testid={workflowCustomizationTestIds.page.content.sidebar.content}>
      <input 
        type="text" 
        data-testid={workflowCustomizationTestIds.page.content.sidebar.search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <button 
        data-testid={workflowCustomizationTestIds.page.content.sidebar.sort}
        onClick={() => onSort({ field: "name", order: 1 })}
      >
        Sort
      </button>
      <div data-testid={workflowCustomizationTestIds.page.content.sidebar.standardWorkflows}>
        {standardWorkflows?.map((workflow: WorkflowMaster) => (
           <button 
            key={workflow.id}
            data-testid={`standard-workflow-${workflow.id}`}
            onClick={() => onSelectWorkflow(workflow)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSelectWorkflow(workflow); }}
            tabIndex={0}
          >
            {workflow.name}
          </button>
        ))}
      </div>
      <div data-testid={workflowCustomizationTestIds.page.content.sidebar.customWorkflows}>
        {customWorkflows?.map((workflow: WorkflowMaster) => (
          <button 
            key={workflow.id}
            data-testid={`custom-workflow-${workflow.id}`}
            onClick={() => onSelectWorkflow(workflow)}
            className="workflow-button"
          >
            {workflow.name}
            <button 
              data-testid={workflowCustomizationTestIds.page.content.sidebar.editButton(workflow.id)}
              onClick={(e) => {
                e.stopPropagation();
                onEditWorkflow?.(workflow);
              }}
            >
              Edit
            </button>
            <button 
              data-testid={`duplicate-${workflow.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateEdit(workflow);
              }}
            >
              Duplicate
            </button>
          </button>
        ))}
      </div>
    </div>
  )
}));

jest.mock('~/components/workflow-customization/workflow-card', () => ({
  __esModule: true,
  default: (props: { workflow?: { name?: string; description?: string; createdBy?: string; createdAt?: string }; heading?: string; description?: string; createdBy?: string; lastUpdated?: string; }) => {
    const workflow = props.workflow || {
      name: props.heading,
      description: props.description,
      createdBy: props.createdBy,
      createdAt: props.lastUpdated,
    };
    return (
      <div data-testid={workflowCustomizationTestIds.page.content.main.card}>
        <h2>{workflow?.name ?? ''}</h2>
        <p>{workflow?.description ?? ''}</p>
        <p>{workflow?.createdBy ?? ''}</p>
        <p>{workflow?.createdAt ?? ''}</p>
      </div>
    );
  },
}));

jest.mock('~/components/workflow-customization/anatomy-accordion', () => ({
  __esModule: true,
  default: ({ anatomy, onValueChange }: { anatomy: { id: number; name: string }; onValueChange?: (value: string) => void }) => (
    <button 
      data-testid={workflowCustomizationTestIds.page.content.main.anatomy.item(anatomy.id)}
      onClick={() => onValueChange?.(String(anatomy.id))}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onValueChange?.(String(anatomy.id));
        }
      }}
    >
      {anatomy.name}
      <div>Expanded Content</div>
    </button>
  )
}));

jest.mock('~/components/workflow-customization/action-template', () => ({
  __esModule: true,
  default: ({ onConfirm, onCancel }: { onConfirm?: () => void, onCancel?: () => void }) => (
    <div data-testid={workflowCustomizationTestIds.page.dialogs.actionTemplate.container}>
      <div data-testid="anatomy-1">
        Anatomy 1{' '}
        <button data-testid="select-anatomy-1">Select</button>
      </div>
      <div data-testid="view-1">
        View 1{' '}
        <button data-testid="select-view-1">Select</button>
      </div>
      <div data-testid="criteria-1">
        Criteria 1{' '}
        <button data-testid="select-criteria-1">Select</button>
      </div>
      <button data-testid="save-button" onClick={() => onConfirm && onConfirm()}>Save</button>
      <button data-testid="cancel-button" onClick={() => onCancel && onCancel()}>Cancel</button>
    </div>
  ),
}));

// Mock data
const mockWorkflows = {
  standardWorkflows: [
    { 
      id: 1, 
      name: 'Standard 1', 
      description: 'Desc 1', 
      createdBy: 'User 1', 
      updatedAt: '2024-01-01',
      status: 'ACTIVE'
    },
    { 
      id: 2, 
      name: 'Standard 2', 
      description: 'Desc 2', 
      createdBy: 'User 2', 
      updatedAt: '2024-01-02',
      status: 'ACTIVE'
    }
  ],
  customWorkflows: [
    { 
      id: 3, 
      name: 'Custom 1', 
      description: 'Desc 3', 
      createdBy: 'User 3', 
      updatedAt: '2024-01-03',
      status: 'ACTIVE'
    },
    { 
      id: 4, 
      name: 'Custom 2', 
      description: 'Desc 4', 
      createdBy: 'User 4', 
      updatedAt: '2024-01-04',
      status: 'ACTIVE'
    }
  ]
};

const mockWorkflowMasters = [
  {
    id: 1,
    name: 'Anatomy 1',
    selectedStatus: ESelectedStatus.SELECTED,
    diagnosticViews: [
      {
        id: 1,
        name: 'View 1',
        selectedStatus: ESelectedStatus.SELECTED,
        qualityCriterias: [
          { id: 1, name: 'Quality 1', selectedStatus: ESelectedStatus.SELECTED }
        ],
        annotations: [],
        imageAcquisition: 1
      }
    ]
  },
  {
    id: 2,
    name: 'Anatomy 2',
    selectedStatus: ESelectedStatus.UNSELECTED,
    diagnosticViews: [
      {
        id: 2,
        name: 'View 2',
        selectedStatus: ESelectedStatus.UNSELECTED,
        qualityCriterias: [
          { id: 2, name: 'Quality 2', selectedStatus: ESelectedStatus.UNSELECTED }
        ],
        annotations: [],
        imageAcquisition: 1
      }
    ]
  }
];

describe(`${APP_NAME}-${SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE}: WorkflowCustomizationPage`, () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Mock API responses
    (apiService.get as jest.Mock).mockImplementation((url) => {
      if (url === API_LIST.GET_WORKFLOW_MASTER_DATA) {
        return Promise.resolve({
          data: mockWorkflowMasters
        });
      }
      return Promise.reject(new Error('API Error'));
    });

    // Mock post response for initial workflow load
    (apiService.post as jest.Mock).mockImplementation((url) => {
      if (url === API_LIST.GET_ALL_WORKFLOWS) {
        return Promise.resolve({
          data: {
            listData: mockWorkflows.customWorkflows,
            standardWorkflowListData: mockWorkflows.standardWorkflows
          }
        });
      }
      if (url === API_LIST.CREATE_WORKFLOW) {
        return Promise.resolve({ data: { protocolId: 1 } });
      }
      return Promise.resolve({ data: { protocolId: 1 } });
    });

    // Mock getById response
    (apiService.getById as jest.Mock).mockImplementation((url) => {
      if (url === API_LIST.GET_WORKFLOW_BY_ID) {
        return Promise.resolve({ 
          data: mockWorkflowMasters 
        });
      }
      return Promise.reject(new Error('API Error'));
    });
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 89)}: renders initial state correctly`, async () => {
    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByTestId(workflowCustomizationTestIds.page.container)).toBeInTheDocument();
      expect(screen.getByTestId(workflowCustomizationTestIds.page.header.container)).toBeInTheDocument();
      expect(screen.getByTestId(workflowCustomizationTestIds.page.content.container)).toBeInTheDocument();
    });

    expect(screen.getByTestId(workflowCustomizationTestIds.page.header.title)).toHaveTextContent('Customization');
    expect(screen.getByTestId(workflowCustomizationTestIds.page.header.addButton)).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 90)}: loads and displays workflows`, async () => {
    // Mock API response for initial load
    (apiService.post as jest.Mock).mockImplementation((url) => {
      if (url === API_LIST.GET_ALL_WORKFLOWS) {
        return Promise.resolve({
          data: {
            listData: mockWorkflows.customWorkflows,
            standardWorkflowListData: mockWorkflows.standardWorkflows
          }
        });
      }
      return Promise.reject(new Error('API Error'));
    });

    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });

    // Wait for workflows to load
    await waitFor(() => {
      expect(screen.getByTestId(workflowCustomizationTestIds.page.content.sidebar.content)).toBeInTheDocument();
    });

    // Wait for standard workflows to render
    await waitFor(() => {
      mockWorkflows.standardWorkflows.forEach(workflow => {
        expect(screen.getByTestId(`standard-workflow-${workflow.id}`)).toBeInTheDocument();
      });
    });

    // Wait for custom workflows to render
    await waitFor(() => {
      mockWorkflows.customWorkflows.forEach(workflow => {
        expect(screen.getByTestId(`custom-workflow-${workflow.id}`)).toBeInTheDocument();
      });
    });
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 91)}: handles workflow selection`, async () => {
    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });

    // Wait for workflows to load
    await waitFor(() => {
      expect(screen.getByTestId(workflowCustomizationTestIds.page.content.sidebar.standardWorkflows)).toBeInTheDocument();
      mockWorkflows.standardWorkflows.forEach(workflow => {
        expect(screen.getByTestId(`standard-workflow-${workflow.id}`)).toBeInTheDocument();
      });
    });

    const workflow = mockWorkflows.standardWorkflows[0];
    await act(async () => {
      fireEvent.click(screen.getByTestId(`standard-workflow-${workflow.id}`));
    });

    expect(apiService.getById).toHaveBeenCalledWith(API_LIST.GET_WORKFLOW_BY_ID, workflow.id);
    expect(screen.getByTestId(`standard-workflow-${workflow.id}`)).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 92)}: handles search functionality`, async () => {
    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });

    const searchInput = screen.getByTestId(workflowCustomizationTestIds.page.content.sidebar.search);
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'test' } });
    });

    expect(apiService.post).toHaveBeenCalledWith(
      API_LIST.GET_ALL_WORKFLOWS,
      { searchInput: 'test', sortField: 'updatedAt', sortOrder: 0 },
      expect.any(Object)
    );
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 93)}: handles sort functionality`, async () => {
    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });

    const sortButton = screen.getByTestId(workflowCustomizationTestIds.page.content.sidebar.sort);
    await act(async () => {
      fireEvent.click(sortButton);
    });

    expect(apiService.post).toHaveBeenCalledWith(
      API_LIST.GET_ALL_WORKFLOWS,
      { searchInput: '', sortField: 'name', sortOrder: 1 },
      expect.any(Object)
    );
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 95)}: handles anatomy accordion interaction`, async () => {
    // Mock API response for initial load
    (apiService.post as jest.Mock).mockImplementation((url) => {
      if (url === API_LIST.GET_ALL_WORKFLOWS) {
        return Promise.resolve({
          data: {
            listData: mockWorkflows.customWorkflows,
            standardWorkflowListData: mockWorkflows.standardWorkflows
          }
        });
      }
      return Promise.reject(new Error('API Error'));
    });

    // Mock API response for workflow by id
    (apiService.getById as jest.Mock).mockImplementation((url) => {
      if (url === API_LIST.GET_WORKFLOW_BY_ID) {
        return Promise.resolve({
          data: mockWorkflowMasters
        });
      }
      return Promise.reject(new Error('API Error'));
    });

    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByTestId(workflowCustomizationTestIds.page.content.sidebar.content)).toBeInTheDocument();
    });

    // Select a workflow to load anatomies
    const workflow = mockWorkflows.standardWorkflows[0];
    await act(async () => {
      fireEvent.click(screen.getByTestId(`standard-workflow-${workflow.id}`));
    });

    // Wait for anatomy to load
    await waitFor(() => {
      const anatomyButtons = screen.getAllByTestId(workflowCustomizationTestIds.page.content.main.anatomy.item(mockWorkflowMasters[0].id));
      expect(anatomyButtons.length).toBeGreaterThan(0);
    });

    // Click on an anatomy accordion
    const anatomyButtons = screen.getAllByTestId(workflowCustomizationTestIds.page.content.main.anatomy.item(mockWorkflowMasters[0].id));
    await act(async () => {
      fireEvent.click(anatomyButtons[0]);
    });

    await waitFor(() => {
      expect(screen.getByText('Expanded Content')).toBeInTheDocument();
    });
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 96)}: handles add workflow flow`, async () => {
    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });

    // Click add workflow button
    await act(async () => {
      fireEvent.click(screen.getByText('Add A Workflow'));
    });

    // Check if dialog opens
    expect(screen.getByText('New Hospital Custom Workflows')).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 97)}: handles error states gracefully`, async () => {
    // Mock API error
    (apiService.post as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });

    // Component should still render without crashing
    expect(screen.getByTestId(workflowCustomizationTestIds.page.container)).toBeInTheDocument();
    expect(screen.getByTestId(workflowCustomizationTestIds.page.header.title)).toHaveTextContent('Customization');
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 100)}: handles workflow selection and accordion interactions`, async () => {
    // Mock API response for initial load
    (apiService.post as jest.Mock).mockImplementation((url) => {
      if (url === API_LIST.GET_ALL_WORKFLOWS) {
        return Promise.resolve({
          data: {
            listData: mockWorkflows.customWorkflows,
            standardWorkflowListData: mockWorkflows.standardWorkflows
          }
        });
      }
      return Promise.reject(new Error('API Error'));
    });

    // Mock API response for workflow by id
    (apiService.getById as jest.Mock).mockImplementation((url) => {
      if (url === API_LIST.GET_WORKFLOW_BY_ID) {
        return Promise.resolve({
          data: mockWorkflowMasters
        });
      }
      return Promise.reject(new Error('API Error'));
    });

    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });

    // Wait for workflows to load
    await waitFor(() => {
      expect(screen.getByTestId(workflowCustomizationTestIds.page.content.sidebar.content)).toBeInTheDocument();
    });

    // Select a workflow
    await act(async () => {
      fireEvent.click(screen.getByTestId(`custom-workflow-${mockWorkflows.customWorkflows[0].id}`));
    });

    // Verify workflow details are displayed
    await waitFor(() => {
      expect(screen.getByTestId(workflowCustomizationTestIds.page.content.main.card)).toBeInTheDocument();
    });

    // Click on an accordion
    await act(async () => {
      const anatomyButtons = screen.getAllByTestId(workflowCustomizationTestIds.page.content.main.anatomy.item(mockWorkflowMasters[0].id));
      fireEvent.click(anatomyButtons[0]);
    });

    // Verify accordion content is displayed
    await waitFor(() => {
      expect(screen.getByText('Expanded Content')).toBeInTheDocument();
    });
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 102)}: handles API errors gracefully in all endpoints`, async () => {
    // Mock API errors
    (apiService.getById as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    
    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByTestId(workflowCustomizationTestIds.page.container)).toBeInTheDocument();
    });

    // Try to select a workflow
    const workflow = mockWorkflows.standardWorkflows[0];
    await act(async () => {
      fireEvent.click(screen.getByTestId(`standard-workflow-${workflow.id}`));
    });

    // Verify error handling
    expect(screen.getByTestId(workflowCustomizationTestIds.page.container)).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 103)}: handles workflow master data loading errors`, async () => {
    // Mock workflow master data loading error
    (apiService.get as jest.Mock).mockRejectedValueOnce(new Error('Failed to load workflow masters'));
    
    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });

    // Click add workflow button
    await act(async () => {
      fireEvent.click(screen.getByTestId(workflowCustomizationTestIds.page.header.addButton));
    });

    // Component should handle the error gracefully
    expect(screen.getByTestId(workflowCustomizationTestIds.page.container)).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 104)}: handles workflow selection with invalid data`, async () => {
    // Mock invalid workflow data
    (apiService.getById as jest.Mock).mockResolvedValueOnce({
      data: null
    });

    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByTestId(workflowCustomizationTestIds.page.container)).toBeInTheDocument();
    });

    const workflow = mockWorkflows.standardWorkflows[0];
    await act(async () => {
      fireEvent.click(screen.getByTestId(`standard-workflow-${workflow.id}`));
    });

    // Component should handle invalid data gracefully
    expect(screen.getByTestId(workflowCustomizationTestIds.page.container)).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 105)}: handles error in handleWorkflowMaster (creation)`, async () => {
    (apiService.post as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });
    // Open Add Workflow dialog
    await act(async () => {
      fireEvent.click(screen.getByText('Add A Workflow'));
    });
    // Fill in the form
    const nameInput = screen.getByLabelText('Workflow Name *');
    const descInput = screen.getByLabelText('Description');
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Error Workflow' } });
      fireEvent.change(descInput, { target: { value: 'Error Desc' } });
      fireEvent.click(screen.getByText('Create'));
    });
    // Simulate action template dialog confirm (which triggers handleWorkflowMaster)
    // Open action template dialog
    // For simplicity, directly trigger the save button in the mocked action template
    await act(async () => {
      fireEvent.click(screen.getByTestId('save-button'));
    });
    // The dialog should remain open due to error (error path coverage)
    expect(screen.getByTestId(workflowCustomizationTestIds.page.dialogs.actionTemplate.container)).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 107)}: handles accordion change handler`, async () => {
    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });
    // Select a workflow to load anatomies
    await act(async () => {
      fireEvent.click(screen.getByTestId('standard-workflow-1'));
    });
    // Click on an anatomy accordion
    const anatomyButtons = screen.getAllByTestId(workflowCustomizationTestIds.page.content.main.anatomy.item(mockWorkflowMasters[0].id));
    await act(async () => {
      fireEvent.click(anatomyButtons[0]);
    });
    // Check for expanded content
    expect(screen.getByText('Expanded Content')).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 108)}: handles error in fetchWorkflowList`, async () => {
    // Mock API error
    (apiService.post as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch workflow list'));
    
    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });

    // Component should handle error gracefully
    expect(screen.getByTestId(workflowCustomizationTestIds.page.container)).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 109)}: handles error in getWorkflowById`, async () => {
    // Mock API error for getWorkflowById
    (apiService.getById as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch workflow'));
    
    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });

    // Select a workflow to trigger getWorkflowById
    const workflow = mockWorkflows.standardWorkflows[0];
    await act(async () => {
      fireEvent.click(screen.getByTestId(`standard-workflow-${workflow.id}`));
    });

    // Component should handle error gracefully
    expect(screen.getByTestId(workflowCustomizationTestIds.page.container)).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_CUSTOMIZATION_PAGE, 110)}: handles create confirm with NEW status`, async () => {
    await act(async () => {
      render(
        <LoaderProvider>
          <Secondary />
        </LoaderProvider>
      );
    });

    // Click add workflow button
    await act(async () => {
      fireEvent.click(screen.getByText('Add A Workflow'));
    });

    // Fill in the form
    const nameInput = screen.getByLabelText('Workflow Name *');
    const descInput = screen.getByLabelText('Description');

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'New Workflow' } });
      fireEvent.change(descInput, { target: { value: 'New Description' } });
      fireEvent.click(screen.getByText('Create'));
    });

    // Verify action template dialog opens
    await waitFor(() => {
      expect(screen.getByTestId(workflowCustomizationTestIds.page.dialogs.actionTemplate.container)).toBeInTheDocument();
    });
  });
});
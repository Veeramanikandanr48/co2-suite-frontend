import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import WorkflowListSidebar from '../../../components/workflow-customization/workflow-list';
import { APP_NAME, SRS_ID, generateTestId } from '../../test-ids/utc-global';
import { workflowListTestIds } from '../../test-ids/workflow-customization.ids';

// Mock SearchBar component
jest.mock('~/components/reusables/form-fields/search-bar', () => ({
  __esModule: true,
  default: ({ onSearch, placeholder, 'data-testid': testId }: { onSearch: (value: string) => void; placeholder: string; 'data-testid'?: string }) => (
    <input
      type="text"
      placeholder={placeholder}
      data-testid={testId}
      onChange={(e) => onSearch(e.target.value)}
    />
  ),
}));

// Mock ResizeObserver for JSDOM
global.ResizeObserver = class {
  observe() {
    // No-op: mock implementation for environments without ResizeObserver
  } unobserve() {
    // No-op: mock implementation for environments without ResizeObserver
  }
  disconnect() {
    // No-op: mock implementation for environments without ResizeObserver
  }
};

// Mock data
const mockStandardWorkflows = [
  { id: 1, name: 'Standard Workflow 1', description: 'Description 1', createdBy: 'User 1', updatedAt: '2024-01-01' },
  { id: 2, name: 'Standard Workflow 2', description: 'Description 2', createdBy: 'User 2', updatedAt: '2024-01-02' }
];

const mockCustomWorkflows = [
  { id: 3, name: 'Custom Workflow 1', description: 'Description 3', createdBy: 'User 3', updatedAt: '2024-01-03' },
  { id: 4, name: 'Custom Workflow 2', description: 'Description 4', createdBy: 'User 4', updatedAt: '2024-01-04' }
];

// Mock handlers
const mockHandlers = {
  onSearch: jest.fn(),
  onSort: jest.fn(),
  onSelectWorkflow: jest.fn(),
  onDuplicateEdit: jest.fn()
};

describe(`${APP_NAME}-${SRS_ID.WORKFLOW_LIST_SIDEBAR}: WorkflowListSidebar`, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_LIST_SIDEBAR, 113)}: renders standard and custom workflows`, () => {
    render(
      <WorkflowListSidebar
        standardWorkflows={mockStandardWorkflows}
        customWorkflows={mockCustomWorkflows}
        selectedWorkflow={null}
        sorting={{ field: 'updatedAt', order: 0 }}
        {...mockHandlers}
      />
    );

    // Check standard workflows section
    expect(screen.getByTestId(workflowListTestIds.sections.standard.title)).toHaveTextContent('OMEA Standard Workflows');
    mockStandardWorkflows.forEach(workflow => {
      const item = screen.getByTestId(workflowListTestIds.sections.standard.item(workflow.id));
      expect(item).toBeInTheDocument();
      expect(item).toHaveTextContent(workflow.name);
    });

    // Check custom workflows section
    expect(screen.getByTestId(workflowListTestIds.sections.custom.title)).toHaveTextContent('Hospital Standard Workflows');
    mockCustomWorkflows.forEach(workflow => {
      const item = screen.getByTestId(workflowListTestIds.sections.custom.item(workflow.id));
      expect(item).toBeInTheDocument();
      expect(item).toHaveTextContent(workflow.name);
    });
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_LIST_SIDEBAR, 114)}: handles workflow selection`, () => {
    render(
      <WorkflowListSidebar
        standardWorkflows={mockStandardWorkflows}
        customWorkflows={mockCustomWorkflows}
        selectedWorkflow={null}
        sorting={{ field: 'updatedAt', order: 0 }}
        {...mockHandlers}
      />
    );

    // Click on a standard workflow
    const standardWorkflowItem = screen.getByTestId(workflowListTestIds.sections.standard.item(mockStandardWorkflows[0].id));
    fireEvent.click(standardWorkflowItem);
    expect(mockHandlers.onSelectWorkflow).toHaveBeenCalledWith(mockStandardWorkflows[0]);

    // Click on a custom workflow
    const customWorkflowItem = screen.getByTestId(workflowListTestIds.sections.custom.item(mockCustomWorkflows[0].id));
    fireEvent.click(customWorkflowItem);
    expect(mockHandlers.onSelectWorkflow).toHaveBeenCalledWith(mockCustomWorkflows[0]);
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_LIST_SIDEBAR, 115)}: highlights selected workflow`, () => {
    const selectedWorkflow = mockStandardWorkflows[0];
    render(
      <WorkflowListSidebar
        standardWorkflows={mockStandardWorkflows}
        customWorkflows={mockCustomWorkflows}
        selectedWorkflow={selectedWorkflow}
        sorting={{ field: 'updatedAt', order: 0 }}
        {...mockHandlers}
      />
    );

    const selectedItem = screen.getByTestId(workflowListTestIds.sections.standard.item(selectedWorkflow.id));
    expect(selectedItem).toHaveClass('bg-light-300');
    expect(selectedItem).toHaveClass('text-neutral-800');
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_LIST_SIDEBAR, 116)}: handles search input`, () => {
    render(
      <WorkflowListSidebar
        standardWorkflows={mockStandardWorkflows}
        customWorkflows={mockCustomWorkflows}
        selectedWorkflow={null}
        sorting={{ field: 'updatedAt', order: 0 }}
        {...mockHandlers}
      />
    );

    // Find the search input using the test ID
    const searchInput = screen.getByTestId(workflowListTestIds.search.input);
    expect(searchInput).toBeInTheDocument();

    // Type in the search input
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Verify the search handler was called with the correct value
    expect(mockHandlers.onSearch).toHaveBeenCalledWith('test');
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_LIST_SIDEBAR, 117)}: handles sorting`, () => {
    render(
      <WorkflowListSidebar
        standardWorkflows={mockStandardWorkflows}
        customWorkflows={mockCustomWorkflows}
        selectedWorkflow={null}
        sorting={{ field: 'updatedAt', order: 0 }}
        {...mockHandlers}
      />
    );

    const sortButton = screen.getByTestId(workflowListTestIds.header.sortButton);
    fireEvent.click(sortButton);
    expect(mockHandlers.onSort).toHaveBeenCalledWith({ field: 'name', order: 1 });
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_LIST_SIDEBAR, 118)}: handles duplicate and edit`, () => {
    render(
      <WorkflowListSidebar
        standardWorkflows={mockStandardWorkflows}
        customWorkflows={mockCustomWorkflows}
        selectedWorkflow={null}
        sorting={{ field: 'updatedAt', order: 0 }}
        {...mockHandlers}
      />
    );

    // Open the popover for the first custom workflow
    const menuButton = screen.getByTestId(workflowListTestIds.sections.custom.menu.button(mockCustomWorkflows[0].id));
    fireEvent.click(menuButton);

    // Click the duplicate button
    const duplicateButton = screen.getByTestId(workflowListTestIds.sections.custom.menu.duplicateButton(mockCustomWorkflows[0].id));
    fireEvent.click(duplicateButton);
    expect(mockHandlers.onDuplicateEdit).toHaveBeenCalledWith(mockCustomWorkflows[0]);
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_LIST_SIDEBAR, 119)}: displays empty state when no workflows`, () => {
    render(
      <WorkflowListSidebar
        standardWorkflows={[]}
        customWorkflows={[]}
        selectedWorkflow={null}
        sorting={{ field: 'updatedAt', order: 0 }}
        {...mockHandlers}
      />
    );

    // Check standard workflows empty state
    const standardEmptyMessage = screen.getByTestId(workflowListTestIds.sections.standard.emptyMessage);
    expect(standardEmptyMessage).toBeInTheDocument();
    expect(standardEmptyMessage).toHaveTextContent('No OMEA Standard Workflows found');

    // Check custom workflows empty state
    const customEmptyMessage = screen.getByTestId(workflowListTestIds.sections.custom.emptyMessage);
    expect(customEmptyMessage).toBeInTheDocument();
    expect(customEmptyMessage).toHaveTextContent('No Hospital Standard Workflows found');
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_LIST_SIDEBAR, 120)}: updates sort order on multiple clicks`, () => {
    let sorting = { field: 'updatedAt', order: 0 };
    const handleSort = jest.fn((newSort) => {
      sorting = newSort;
    });
    const { rerender } = render(
      <WorkflowListSidebar
        standardWorkflows={mockStandardWorkflows}
        customWorkflows={mockCustomWorkflows}
        selectedWorkflow={null}
        sorting={sorting}
        {...mockHandlers}
        onSort={handleSort}
      />
    );

    const sortButton = screen.getByTestId(workflowListTestIds.header.sortButton);
    // First click - ascending
    fireEvent.click(sortButton);
    expect(handleSort).toHaveBeenCalledWith({ field: 'name', order: 1 });
    rerender(
      <WorkflowListSidebar
        standardWorkflows={mockStandardWorkflows}
        customWorkflows={mockCustomWorkflows}
        selectedWorkflow={null}
        sorting={{ field: 'name', order: 1 }}
        {...mockHandlers}
        onSort={handleSort}
      />
    );
    // Second click - reset
    fireEvent.click(sortButton);
    expect(handleSort).toHaveBeenCalledWith({ field: 'name', order: 0 });
    rerender(
      <WorkflowListSidebar
        standardWorkflows={mockStandardWorkflows}
        customWorkflows={mockCustomWorkflows}
        selectedWorkflow={null}
        sorting={{ field: 'name', order: 0 }}
        {...mockHandlers}
        onSort={handleSort}
      />
    );
    // Third click - ascending again
    fireEvent.click(sortButton);
    expect(handleSort).toHaveBeenCalledWith({ field: 'name', order: 1 });
  });

  it(`${generateTestId(SRS_ID.WORKFLOW_LIST_SIDEBAR, 121)}: prevents event propagation on duplicate button click`, () => {
    render(
      <WorkflowListSidebar
        standardWorkflows={mockStandardWorkflows}
        customWorkflows={mockCustomWorkflows}
        selectedWorkflow={null}
        sorting={{ field: 'updatedAt', order: 0 }}
        {...mockHandlers}
      />
    );

    // Open the popover for the first custom workflow
    const menuButton = screen.getByTestId(workflowListTestIds.sections.custom.menu.button(mockCustomWorkflows[0].id));
    fireEvent.click(menuButton);

    // Click the duplicate button
    const duplicateButton = screen.getByTestId(workflowListTestIds.sections.custom.menu.duplicateButton(mockCustomWorkflows[0].id));
    fireEvent.click(duplicateButton);

    // Verify that onSelectWorkflow was not called when clicking duplicate button
    expect(mockHandlers.onSelectWorkflow).not.toHaveBeenCalled();
    expect(mockHandlers.onDuplicateEdit).toHaveBeenCalled();
  });
}); 
import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AddWorkflowDialog from '~/components/workflow-customization/add-workflow';
import { WorkflowConfigurationSchema } from '~/lib/schemas';
import { FORM_DEFAULT_VALUES } from '~/lib/variables';
import { generateTestId, APP_NAME, SRS_ID } from '../../test-ids/utc-global';
import { workflowTestIds } from '../../test-ids/workflow.ids';

// Mock SVG components
jest.mock('~/components/svg', () => ({
  Close: () => <div data-testid={workflowTestIds.addWorkflow.closeIcon}>Close</div>,
  PlusCircle: () => <div data-testid={workflowTestIds.addWorkflow.plusCircleIcon}>Plus</div>
}));

// Wrapper component for form context
const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const form = useForm({
    resolver: zodResolver(WorkflowConfigurationSchema),
    defaultValues: FORM_DEFAULT_VALUES.workflowConfiguration,
    mode: "onChange"
  });

  return <FormProvider {...form}>{children}</FormProvider>;
};

describe(`${APP_NAME}-${SRS_ID.ACTION_TEMPLATE}: AddWorkflowDialog`, () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    headerLabel: 'Test Header',
    nameLabel: 'Test Name Label',
    namePlaceholder: 'Test Name Placeholder',
    descriptionLabel: 'Test Description Label',
    descriptionPlaceholder: 'Test Description Placeholder',
    confirmLabel: 'Test Confirm',
    cancelLabel: 'Test Cancel'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`${generateTestId(SRS_ID.ADD_WORKFLOW, 51)}: renders when open`, () => {
    render(
      <FormWrapper>
        <AddWorkflowDialog {...defaultProps} />
      </FormWrapper>
    );

    expect(screen.getByText(defaultProps.headerLabel)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.nameLabel)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(defaultProps.namePlaceholder)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.descriptionLabel)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(defaultProps.descriptionPlaceholder)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.confirmLabel)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.cancelLabel)).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.ADD_WORKFLOW, 52)}: does not render when closed`, () => {
    render(
      <FormWrapper>
        <AddWorkflowDialog {...defaultProps} open={false} />
      </FormWrapper>
    );

    expect(screen.queryByText(defaultProps.headerLabel)).not.toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.ADD_WORKFLOW, 53)}: calls onConfirm when confirm button is clicked`, async () => {
    render(
      <FormWrapper>
        <AddWorkflowDialog {...defaultProps} />
      </FormWrapper>
    );

    // Fill in required fields with valid data
    const nameInput = screen.getByPlaceholderText(defaultProps.namePlaceholder);
    const descriptionInput = screen.getByPlaceholderText(defaultProps.descriptionPlaceholder);

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test Workflow' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    });

    // Ensure confirm button is enabled
    const confirmButton = screen.getByText(defaultProps.confirmLabel);
    expect(confirmButton).not.toBeDisabled();

    // Click confirm button
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ADD_WORKFLOW, 54)}: calls onCancel when cancel button is clicked`, async () => {
    render(
      <FormWrapper>
        <AddWorkflowDialog {...defaultProps} />
      </FormWrapper>
    );

    await act(async () => {
      fireEvent.click(screen.getByText(defaultProps.cancelLabel));
    });
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ADD_WORKFLOW, 55)}: calls onCancel when close icon is clicked`, async () => {
    render(
      <FormWrapper>
        <AddWorkflowDialog {...defaultProps} />
      </FormWrapper>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId(workflowTestIds.addWorkflow.closeButton));
    });
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ADD_WORKFLOW, 56)}: handles form input changes`, () => {
    render(
      <FormWrapper>
        <AddWorkflowDialog {...defaultProps} />
      </FormWrapper>
    );

    const nameInput = screen.getByPlaceholderText(defaultProps.namePlaceholder);
    const descriptionInput = screen.getByPlaceholderText(defaultProps.descriptionPlaceholder);

    fireEvent.change(nameInput, { target: { value: 'Test Name' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    expect(nameInput).toHaveValue('Test Name');
    expect(descriptionInput).toHaveValue('Test Description');
  });

  it(`${generateTestId(SRS_ID.ADD_WORKFLOW, 57)}: uses default labels when custom labels are not provided`, async () => {
    const minimalProps = {
      open: true,
      onOpenChange: jest.fn(),
      onConfirm: jest.fn(),
      onCancel: jest.fn()
    };
    
    render(
      <FormWrapper>
        <AddWorkflowDialog {...minimalProps} />
      </FormWrapper>
    );

    expect(screen.getByText('New Hospital Custom Workflows')).toBeInTheDocument();
    expect(screen.getByText('Workflow Name *')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.ADD_WORKFLOW, 58)}: renders confirm icon when provided`, () => {
    render(
      <FormWrapper>
        <AddWorkflowDialog {...defaultProps} confirmIcon={<div data-testid={workflowTestIds.addWorkflow.plusCircleIcon}>Custom</div>} />
      </FormWrapper>
    );

    expect(screen.getByTestId(workflowTestIds.addWorkflow.plusCircleIcon)).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.ADD_WORKFLOW, 59)}: disables confirm button when form is invalid`, () => {
    render(
      <FormWrapper>
        <AddWorkflowDialog {...defaultProps} />
      </FormWrapper>
    );

    const confirmButton = screen.getByText(defaultProps.confirmLabel);
    expect(confirmButton).toBeDisabled();
  });
}); 
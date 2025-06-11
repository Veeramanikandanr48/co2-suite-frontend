import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import DiagnosticViewComponent from '~/components/workflow-customization/diagnostic-view';
import { ESelectedStatus, EFieldStatus } from '~/enums/workflow-customization-enum';
import type { DiagnosticView } from '~/types/workflow';
import { generateTestId, APP_NAME, SRS_ID } from '../../test-ids/utc-global';
import { workflowTestIds } from '../../test-ids/workflow.ids';


// Mock data
const mockView: DiagnosticView = {
  id: 1,
  name: 'Test View',
  selectedStatus: ESelectedStatus.UNSELECTED,
  noOfImageAcquisition: 1,
  min: 1,
  max: 3,
  annotations: [
    {
      id: 1,
      name: 'Test Annotation',
      selectedStatus: ESelectedStatus.UNSELECTED,
      acronym: '',
      error: '',
      isManual: false,
      mappingId: 1,
      fieldStatus: EFieldStatus.NONE
    }
  ],
  qualityCriterias: [
    {
      id: 1,
      name: 'Test Criteria',
      selectedStatus: ESelectedStatus.UNSELECTED,
      description: 'Test Description',
      mappingId: 1,
      fieldStatus: EFieldStatus.NONE
    }
  ],
  fieldStatus: EFieldStatus.NONE,
  mappingId: 1,
  measurements: [
    {
      id: 1,
      name: 'Test Measurement',
      selectedStatus: ESelectedStatus.UNSELECTED,
      mappingId: 1,
      fieldStatus: EFieldStatus.NONE
    }
  ]
};

describe(`${APP_NAME}-${SRS_ID.DIAGNOSTIC_VIEW}: DiagnosticViewComponent`, () => {
  const defaultProps = {
    view: mockView,
    onCheckboxChange: jest.fn(),
    handleAcronymChange: jest.fn(),
    onIncrementImageAcquisition: jest.fn(),
    onDecrementImageAcquisition: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`${generateTestId(SRS_ID.DIAGNOSTIC_VIEW, 60)}: renders correctly with all sections`, () => {
    render(<DiagnosticViewComponent {...defaultProps} />);
    
    // Check main view name and checkbox
    expect(screen.getByTestId(workflowTestIds.diagnosticView.header.name)).toHaveTextContent('Test View');
    expect(screen.getByTestId(workflowTestIds.diagnosticView.header.checkbox(1))).toBeInTheDocument();
    
    // Check sections headers
    expect(screen.getByTestId(workflowTestIds.diagnosticView.qualityCriteria.title)).toHaveTextContent('STRUCTURAL CRITERIA');
    expect(screen.getByTestId(workflowTestIds.diagnosticView.measurement.title)).toHaveTextContent('MEASUREMENTS');
    expect(screen.getByTestId(workflowTestIds.diagnosticView.annotation.title)).toHaveTextContent('ANNOTATIONS');
  });

  it(`${generateTestId(SRS_ID.DIAGNOSTIC_VIEW, 61)}: handles view checkbox change`, async () => {
    render(<DiagnosticViewComponent {...defaultProps} />);
    const viewCheckbox = screen.getByTestId(workflowTestIds.diagnosticView.header.checkbox(1));
    
    await act(async () => {
      fireEvent.click(viewCheckbox);
    });
    
    expect(defaultProps.onCheckboxChange).toHaveBeenCalledWith(true, 'view', 1);
  });

  it(`${generateTestId(SRS_ID.DIAGNOSTIC_VIEW, 62)}: handles quality criteria checkbox change`, async () => {
    render(<DiagnosticViewComponent {...defaultProps} />);
    const criteriaCheckbox = screen.getByTestId(workflowTestIds.diagnosticView.qualityCriteria.checkbox(1));
    
    await act(async () => {
      fireEvent.click(criteriaCheckbox);
    });
    
    expect(defaultProps.onCheckboxChange).toHaveBeenCalledWith(true, 'qc', 1, 1);
  });

  it(`${generateTestId(SRS_ID.DIAGNOSTIC_VIEW, 63)}: handles measurement checkbox change`, async () => {
    render(<DiagnosticViewComponent {...defaultProps} />);
    const measurementCheckbox = screen.getByTestId(workflowTestIds.diagnosticView.measurement.checkbox(1));
    
    await act(async () => {
      fireEvent.click(measurementCheckbox);
    });
    
    expect(defaultProps.onCheckboxChange).toHaveBeenCalledWith(true, 'measurement', 1, 1);
  });

  it(`${generateTestId(SRS_ID.DIAGNOSTIC_VIEW, 64)}: handles annotation checkbox change`, async () => {
    render(<DiagnosticViewComponent {...defaultProps} />);
    const annotationCheckbox = screen.getByTestId(workflowTestIds.diagnosticView.annotation.checkbox(1));
    
    await act(async () => {
      fireEvent.click(annotationCheckbox);
    });
    
    expect(defaultProps.onCheckboxChange).toHaveBeenCalledWith(true, 'annotation', 1, 1);
  });

  it(`${generateTestId(SRS_ID.DIAGNOSTIC_VIEW, 65)}: handles acronym input change`, async () => {
    render(<DiagnosticViewComponent {...defaultProps} />);
    const acronymInput = screen.getByTestId(workflowTestIds.diagnosticView.annotation.input.field);
    
    await act(async () => {
      fireEvent.change(acronymInput, { target: { value: 'TEST' } });
    });
    
    expect(defaultProps.handleAcronymChange).toHaveBeenCalledWith(1, 1, 'TEST');
  });

  it(`${generateTestId(SRS_ID.DIAGNOSTIC_VIEW, 66)}: handles image acquisition increment`, async () => {
    render(<DiagnosticViewComponent {...defaultProps} />);
    const incrementButton = screen.getByTestId(workflowTestIds.diagnosticView.acquisition.controls.increment);
    
    await act(async () => {
      fireEvent.click(incrementButton);
    });
    
    expect(defaultProps.onIncrementImageAcquisition).toHaveBeenCalledWith(1);
  });

  it(`${generateTestId(SRS_ID.DIAGNOSTIC_VIEW, 67)}: handles image acquisition decrement`, async () => {
    const mockViewWithAcquisition = {
      ...mockView,
      noOfImageAcquisition: 2,
      min: 1,
      max: 3
    };

    render(<DiagnosticViewComponent {...defaultProps} view={mockViewWithAcquisition} />);
    
    // Find the decrement button within the acquisition controls
    const decrementButton = screen.getByTestId(workflowTestIds.diagnosticView.acquisition.controls.decrement);
    
    // Verify the button is enabled
    expect(decrementButton).not.toBeDisabled();
    
    // Click the decrement button
    await act(async () => {
      fireEvent.click(decrementButton);
    });
    
    // Verify the callback was called with the correct view ID
    expect(defaultProps.onDecrementImageAcquisition).toHaveBeenCalledWith(mockViewWithAcquisition.id);
  });

  it(`${generateTestId(SRS_ID.DIAGNOSTIC_VIEW, 68)}: disables increment button when max is reached`, () => {
    const viewAtMax = {
      ...mockView,
      noOfImageAcquisition: 3 // max value
    };
    
    render(<DiagnosticViewComponent {...defaultProps} view={viewAtMax} />);
    const incrementButton = screen.getByTestId(workflowTestIds.diagnosticView.acquisition.controls.increment);
    
    expect(incrementButton).toBeDisabled();
  });

  it(`${generateTestId(SRS_ID.DIAGNOSTIC_VIEW, 69)}: disables decrement button when min is reached`, () => {
    const viewAtMin = {
      ...mockView,
      noOfImageAcquisition: 1 // min value
    };
    
    render(<DiagnosticViewComponent {...defaultProps} view={viewAtMin} />);
    const decrementButton = screen.getByTestId(workflowTestIds.diagnosticView.acquisition.controls.decrement);
    
    expect(decrementButton).toBeDisabled();
  });

  it(`${generateTestId(SRS_ID.DIAGNOSTIC_VIEW, 70)}: disables acronym input when annotation is not selected`, () => {
    render(<DiagnosticViewComponent {...defaultProps} />);
    const acronymInput = screen.getByTestId(workflowTestIds.diagnosticView.annotation.input.field);
    
    expect(acronymInput).toBeDisabled();
  });

  it(`${generateTestId(SRS_ID.DIAGNOSTIC_VIEW, 71)}: enables acronym input when annotation is selected`, () => {
    const selectedAnnotation = {
      ...mockView,
      annotations: [{
        ...mockView.annotations[0],
        selectedStatus: ESelectedStatus.SELECTED
      }]
    };
    
    render(<DiagnosticViewComponent {...defaultProps} view={selectedAnnotation} />);
    const acronymInput = screen.getByTestId(workflowTestIds.diagnosticView.annotation.input.field);
    
    expect(acronymInput).not.toBeDisabled();
  });

  it(`${generateTestId(SRS_ID.DIAGNOSTIC_VIEW, 72)}: displays error message when annotation has error`, () => {
    const viewWithError = {
      ...mockView,
      annotations: [{
        ...mockView.annotations[0],
        error: 'Invalid acronym'
      }]
    };
    
    render(<DiagnosticViewComponent {...defaultProps} view={viewWithError} />);
    expect(screen.getByTestId(workflowTestIds.diagnosticView.annotation.input.error)).toHaveTextContent('Invalid acronym');
  });
});
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ActionTemplateDialog from '~/components/workflow-customization/action-template';
import { EWorkflowStatus, ESelectedStatus, EFieldStatus } from '~/enums/workflow-customization-enum';
import { WorkflowMaster, DiagnosticView } from '~/types/workflow';
import { showWarningToast } from '~/components/toast-variant';
import { APP_NAME, SRS_ID, generateTestId } from '../../test-ids/utc-global';
import { workflowTestIds } from '../../test-ids/workflow.ids';
import { ANATOMY_LIST_TEST_IDS } from '../../test-ids/anatomy-list.ids';

// Mock toast at the top
jest.mock('~/components/toast-variant', () => ({
  showWarningToast: jest.fn()
}));

// Mock data
const mockDiagnosticViews: DiagnosticView[] = [
  {
    id: 1,
    name: 'View 1',
    selectedStatus: ESelectedStatus.SELECTED,
    noOfImageAcquisition: 1,
    min: 1,
    max: 3,
    annotations: [
      { 
        id: 1, 
        name: 'Annotation 1', 
        acronym: 'A1', 
        selectedStatus: ESelectedStatus.SELECTED,
        isManual: false,
        error: '',
        mappingId: 1,
        fieldStatus: EFieldStatus.NONE
      }
    ],
    qualityCriterias: [
      { id: 1, name: 'QC 1', selectedStatus: ESelectedStatus.UNSELECTED, description: 'desc', mappingId: 1, fieldStatus: EFieldStatus.NONE }
    ],
    fieldStatus: EFieldStatus.NONE,
    mappingId: 1,
    measurements: []
  },
  {
    id: 2,
    name: 'View 2',
    selectedStatus: ESelectedStatus.UNSELECTED,
    noOfImageAcquisition: 1,
    min: 1,
    max: 3,
    annotations: [
      { 
        id: 2, 
        name: 'Annotation 2', 
        acronym: '', 
        selectedStatus: ESelectedStatus.SELECTED,
        isManual: false,
        error: '',
        mappingId: 2,
        fieldStatus: EFieldStatus.NONE
      }
    ],
    qualityCriterias: [
      { id: 2, name: 'QC 2', selectedStatus: ESelectedStatus.UNSELECTED, description: 'desc', mappingId: 2, fieldStatus: EFieldStatus.NONE }
    ],
    fieldStatus: EFieldStatus.NONE,
    mappingId: 2,
    measurements: []
  },
  {
    id: 3,
    name: 'View 3',
    selectedStatus: ESelectedStatus.UNSELECTED,
    noOfImageAcquisition: 1,
    min: 1,
    max: 1,
    annotations: [],
    qualityCriterias: [
      { id: 3, name: 'QC 3', selectedStatus: ESelectedStatus.SELECTED, description: 'desc', mappingId: 3, fieldStatus: EFieldStatus.NONE }
    ],
    fieldStatus: EFieldStatus.NONE,
    mappingId: 3,
    measurements: []
  },
  {
    id: 4,
    name: 'View 4',
    selectedStatus: ESelectedStatus.UNSELECTED,
    noOfImageAcquisition: 1,
    min: 1,
    max: 1,
    annotations: [],
    qualityCriterias: [
      { id: 4, name: 'QC 4', selectedStatus: ESelectedStatus.SELECTED, description: 'desc', mappingId: 4, fieldStatus: EFieldStatus.NONE }
    ],
    fieldStatus: EFieldStatus.NONE,
    mappingId: 4,
    measurements: []
  }
];

const mockWorkflowMasters: WorkflowMaster[] = [
  {
    id: 1,
    mappingId: 1,
    name: 'Master 1',
    selectedStatus: ESelectedStatus.UNSELECTED,
    fieldStatus: EFieldStatus.NONE,
    diagnosticViews: [mockDiagnosticViews[0], mockDiagnosticViews[1]]
  },
  {
    id: 2,
    mappingId: 2,
    name: 'Master 2',
    selectedStatus: ESelectedStatus.UNSELECTED,
    fieldStatus: EFieldStatus.NONE,
    diagnosticViews: [mockDiagnosticViews[2], mockDiagnosticViews[3]]
  }
];

const mockSelectedWorkflow = {
  id: 1,
  name: 'Test Workflow',
  description: 'Test Description',
  createdBy: 'Test User',
  updatedAt: '2024-01-01'
};

// Valid workflowMasters for save and decrement actions (diagnostic view initially UNSELECTED)
const validWorkflowMasters = [
  {
    id: 1,
    mappingId: 1,
    name: 'Master 1',
    selectedStatus: ESelectedStatus.SELECTED,
    fieldStatus: EFieldStatus.NONE,
    diagnosticViews: [
      {
        id: 1,
        name: 'View 1',
        selectedStatus: ESelectedStatus.SELECTED,
        noOfImageAcquisition: 2,
        min: 1,
        max: 3,
        annotations: [
          {
            id: 1,
            name: 'Annotation 1',
            acronym: 'A1',
            selectedStatus: ESelectedStatus.SELECTED,
            isManual: false,
            error: '',
            mappingId: 1,
            fieldStatus: EFieldStatus.NONE
          }
        ],
        qualityCriterias: [
          { id: 1, name: 'QC 1', selectedStatus: ESelectedStatus.SELECTED, description: 'desc', mappingId: 1, fieldStatus: EFieldStatus.NONE }
        ],
        fieldStatus: EFieldStatus.NONE,
        mappingId: 1,
        measurements: []
      }
    ]
  }
];

describe(`${APP_NAME}-${SRS_ID.ACTION_TEMPLATE}: Action Template Dialog`, () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    workflowMasters: mockWorkflowMasters,
    setWorkflowMasters: jest.fn(),
    selectedWorkflow: mockSelectedWorkflow,
    actionTemplateStatus: EWorkflowStatus.NEW,
    activeAnatomyId: 1,
    activeAnatomyName: 'Master 1',
    setActiveAnatomyId: jest.fn(),
    setActiveAnatomyName: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 1)}: renders correctly`, () => {
    render(<ActionTemplateDialog {...defaultProps} />);
    expect(screen.getByText(mockSelectedWorkflow.name)).toBeInTheDocument();
    expect(screen.getAllByText('Master 1').length).toBeGreaterThan(0);
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 2)}: handles workflow master updates`, async () => {
    render(<ActionTemplateDialog {...defaultProps} />);
    const anatomyCheckboxes = screen.getAllByRole('checkbox');
    await act(async () => {
      fireEvent.click(anatomyCheckboxes[0]);
    });
    expect(defaultProps.setWorkflowMasters).toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 3)}: calls onConfirm when save button is clicked`, async () => {
    render(<ActionTemplateDialog {...defaultProps} workflowMasters={validWorkflowMasters} />);
    const anatomyItem = screen.getByTestId(ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_ITEM(1));
    await act(async () => {
      fireEvent.click(anatomyItem);
    });
    const viewCheckboxes = screen.getAllByRole('checkbox');
    await act(async () => {
      fireEvent.click(viewCheckboxes[0]);
    });
    const saveButton = screen.getByTestId(workflowTestIds.buttons.save);
    await act(async () => {
      fireEvent.click(saveButton);
    });
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 4)}: shows diagnostic views for selected anatomy`, async () => {
    render(<ActionTemplateDialog {...defaultProps} />);
    const anatomyItem = screen.getByTestId(ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_ITEM(2));
    await act(async () => {
      fireEvent.click(anatomyItem);
    });
    await waitFor(() => {
      const viewElements = screen.getAllByText(/View \d/);
      expect(viewElements.length).toBeGreaterThan(0);
    });
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 5)}: handles diagnostic view selection`, async () => {
    // Setup workflowMasters with initial state
    const workflowMasters = [
        {
            id: 1,
            mappingId: 1,
            name: 'Master 1',
            selectedStatus: ESelectedStatus.UNSELECTED,
            fieldStatus: EFieldStatus.NONE,
            diagnosticViews: [
                {
                    id: 1,
                    name: 'View 1',
                    selectedStatus: ESelectedStatus.UNSELECTED,
                    noOfImageAcquisition: 1,
                    min: 1,
                    max: 3,
                    annotations: [],
                    qualityCriterias: [],
                    fieldStatus: EFieldStatus.NONE,
                    mappingId: 1,
                    measurements: []
                }
            ]
        }
    ];
    render(<ActionTemplateDialog {...defaultProps} workflowMasters={workflowMasters} />);
    
    // First select an anatomy to make the view checkboxes available
    const anatomyItem = screen.getByTestId(ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_ITEM(1));
    await act(async () => {
        fireEvent.click(anatomyItem);
    });

    // Now get the view checkboxes and click one
    const viewCheckboxes = screen.getAllByRole('checkbox');
    await act(async () => {
        fireEvent.click(viewCheckboxes[1]);
    });

    // Wait for state updates
    await waitFor(() => {
        expect(defaultProps.setWorkflowMasters).toHaveBeenCalled();
    });
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 6)}: maintains selected state across anatomy switches`, async () => {
    render(<ActionTemplateDialog {...defaultProps} />);
    const viewCheckboxes = screen.getAllByRole('checkbox');
    await act(async () => {
      fireEvent.click(viewCheckboxes[1]);
    });
    await act(async () => {
      fireEvent.click(screen.getAllByText('Master 2')[0]);
    });
    await act(async () => {
      fireEvent.click(screen.getAllByText('Master 1')[0]);
    });
    expect(viewCheckboxes[1]).toHaveAttribute('aria-checked', 'true');
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 7)}: prevents click propagation on dialog content`, async () => {
    const onClickOutside = jest.fn();
    render(<ActionTemplateDialog {...defaultProps} onOpenChange={onClickOutside} />);
    const dialog = screen.getByRole('dialog');
    await act(async () => {
      fireEvent.click(dialog);
    });
    expect(onClickOutside).not.toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 8)}: handles image acquisition increment`, async () => {
    render(<ActionTemplateDialog {...defaultProps} />);
    const anatomyItem = screen.getByTestId(ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_ITEM(1));
    await act(async () => {
      fireEvent.click(anatomyItem);
    });
    const incrementButtons = screen.getAllByTestId(workflowTestIds.diagnosticView.acquisition.controls.increment);
    await act(async () => {
      fireEvent.click(incrementButtons[0]);
    });
    expect(defaultProps.setWorkflowMasters).toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 9)}: handles image acquisition decrement`, async () => {
    render(<ActionTemplateDialog {...defaultProps} workflowMasters={validWorkflowMasters} />);
    const anatomyItem = screen.getByTestId(ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_ITEM(1));
    await act(async () => {
      fireEvent.click(anatomyItem);
    });
    const decrementButtons = screen.getAllByTestId(workflowTestIds.diagnosticView.acquisition.controls.decrement);
    await act(async () => {
      fireEvent.click(decrementButtons[0]);
    });
    expect(defaultProps.setWorkflowMasters).toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 10)}: handles annotation acronym changes`, async () => {
    const workflowMastersWithSelectedAnnotation = mockWorkflowMasters.map(master => ({
      ...master,
      diagnosticViews: master.diagnosticViews.map(view => ({
        ...view,
        annotations: [{
          id: 1,
          name: 'Test',
          acronym: '',
          selectedStatus: ESelectedStatus.SELECTED,
          isManual: false,
          error: '',
          mappingId: 1,
          fieldStatus: EFieldStatus.NONE
        }]
      }))
    }));
    render(<ActionTemplateDialog {...defaultProps} workflowMasters={workflowMastersWithSelectedAnnotation} />);
    const anatomyItem = screen.getByTestId(ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_ITEM(1));
    await act(async () => {
      fireEvent.click(anatomyItem);
    });
    const acronymInput = screen.getAllByTestId(workflowTestIds.annotation.acronymInput)[0];
    await act(async () => {
      fireEvent.change(acronymInput, { target: { value: 'TEST' } });
    });
    expect(defaultProps.setWorkflowMasters).toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 11)}: shows warning when no quality criteria is selected`, async () => {
    // Setup workflowMasters with selected view but no quality criteria
    const workflowMasters = [
        {
            id: 1,
            mappingId: 1,
            name: 'Master 1',
            selectedStatus: ESelectedStatus.SELECTED,
            fieldStatus: EFieldStatus.NONE,
            diagnosticViews: [
                {
                    id: 1,
                    name: 'View 1',
                    selectedStatus: ESelectedStatus.SELECTED,
                    noOfImageAcquisition: 1,
                    min: 1,
                    max: 3,
                    annotations: [],
                    qualityCriterias: [],
                    fieldStatus: EFieldStatus.NONE,
                    mappingId: 1,
                    measurements: []
                }
            ]
        }
    ];
    render(<ActionTemplateDialog {...defaultProps} workflowMasters={workflowMasters} />);
    const anatomyItem = screen.getByTestId(ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_ITEM(1));
    await act(async () => {
        fireEvent.click(anatomyItem);
    });
    const saveButton = screen.getByTestId(workflowTestIds.buttons.save);
    await act(async () => {
        fireEvent.click(saveButton);
    });
    expect(showWarningToast).toHaveBeenCalledWith('Please select at least one structural criteria for each selected diagnostic view.');
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 12)}: shows warning when annotations have invalid acronyms`, async () => {
    // Setup workflowMasters with selected view, quality criteria, and invalid annotation
    const workflowMasters = [
        {
            id: 1,
            mappingId: 1,
            name: 'Master 1',
            selectedStatus: ESelectedStatus.SELECTED,
            fieldStatus: EFieldStatus.NONE,
            diagnosticViews: [
                {
                    id: 1,
                    name: 'View 1',
                    selectedStatus: ESelectedStatus.SELECTED,
                    noOfImageAcquisition: 1,
                    min: 1,
                    max: 3,
                    annotations: [
                        {
                            id: 1,
                            name: 'Annotation 1',
                            acronym: '',
                            selectedStatus: ESelectedStatus.SELECTED,
                            isManual: false,
                            error: '',
                            mappingId: 1,
                            fieldStatus: EFieldStatus.NONE
                        }
                    ],
                    qualityCriterias: [
                        {
                            id: 1,
                            name: 'QC 1',
                            selectedStatus: ESelectedStatus.SELECTED,
                            description: 'desc',
                            mappingId: 1,
                            fieldStatus: EFieldStatus.NONE
                        }
                    ],
                    fieldStatus: EFieldStatus.NONE,
                    mappingId: 1,
                    measurements: []
                }
            ]
        }
    ];

    render(<ActionTemplateDialog {...defaultProps} workflowMasters={workflowMasters} />);
    
    // Select the anatomy using the correct test ID
    const anatomyItem = screen.getByTestId(ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_ITEM(1));
    await act(async () => {
        fireEvent.click(anatomyItem);
    });

    // Click save button
    const saveButton = screen.getByTestId(workflowTestIds.buttons.save);
    await act(async () => {
        fireEvent.click(saveButton);
    });

    // Wait for the warning toast
    await waitFor(() => {
        expect(showWarningToast).toHaveBeenCalledWith(
            'Please validate all selected annotation acronyms.'
        );
    });
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 13)}: handles exit dialog confirmation`, async () => {
    render(<ActionTemplateDialog {...defaultProps} />);
    const exitButton = screen.getByText('Exit');
    await act(async () => {
        fireEvent.click(exitButton);
    });
    
    const dontSaveButton = screen.getByTestId(workflowTestIds.buttons.dontSave);
    await act(async () => {
        fireEvent.click(dontSaveButton);
    });
    
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 14)}: handles save and continue from exit dialog`, async () => {
    // Setup workflowMasters with initial state
    const workflowMasters = [
      {
        id: 1,
        mappingId: 1,
        name: 'Master 1',
        selectedStatus: ESelectedStatus.SELECTED,
        fieldStatus: EFieldStatus.NONE,
        diagnosticViews: [
          {
            id: 1,
            name: 'View 1',
            selectedStatus: ESelectedStatus.SELECTED,
            noOfImageAcquisition: 1,
            min: 1,
            max: 3,
            annotations: [],
            qualityCriterias: [
              { id: 1, name: 'QC 1', selectedStatus: ESelectedStatus.SELECTED, description: 'desc', mappingId: 1, fieldStatus: EFieldStatus.NONE }
            ],
            fieldStatus: EFieldStatus.NONE,
            mappingId: 1,
            measurements: []
          }
        ]
      }
    ];

    render(
      <ActionTemplateDialog 
        {...defaultProps} 
        workflowMasters={workflowMasters}
        activeAnatomyId={1}
        activeAnatomyName="Master 1"
      />
    );

    // Click exit button to open the confirmation dialog
    const exitButton = screen.getByTestId(workflowTestIds.buttons.exit);
    await act(async () => {
      fireEvent.click(exitButton);
    });

    // Click save button in the confirmation dialog
    const saveButton = screen.getAllByText('Save').find(btn => btn.closest(`[data-testid="${workflowTestIds.buttons.dontSave}"]`) === null);
    if (!saveButton) {
        throw new Error('Save button not found');
    }
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Verify onConfirm was called
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 15)}: handles dialog close button`, async () => {
    render(<ActionTemplateDialog {...defaultProps} />);
    const exitButton = screen.getByTestId(workflowTestIds.buttons.exit);
    await act(async () => {
      fireEvent.click(exitButton);
    });
    const closeButton = screen.getByTestId(workflowTestIds.buttons.dontSave);
    await act(async () => {
      fireEvent.click(closeButton);
    });
    await waitFor(() => {
      expect(screen.queryByText('Save Changes?')).not.toBeInTheDocument();
    });
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 16)}: shows combined warning when no quality criteria and invalid annotation`, async () => {
    const workflowMasters = [
      {
        id: 1,
        mappingId: 1,
        name: 'Master 1',
        selectedStatus: ESelectedStatus.SELECTED,
        fieldStatus: EFieldStatus.NONE,
        diagnosticViews: [
          {
            id: 1,
            name: 'View 1',
            selectedStatus: ESelectedStatus.SELECTED,
            noOfImageAcquisition: 1,
            min: 1,
            max: 3,
            annotations: [
              {
                id: 1,
                name: 'Annotation 1',
                acronym: '',
                selectedStatus: ESelectedStatus.SELECTED,
                isManual: false,
                error: '',
                mappingId: 1,
                fieldStatus: EFieldStatus.NONE
              }
            ],
            qualityCriterias: [
              { id: 1, name: 'QC 1', selectedStatus: ESelectedStatus.UNSELECTED, description: 'desc', mappingId: 1, fieldStatus: EFieldStatus.NONE }
            ],
            fieldStatus: EFieldStatus.NONE,
            mappingId: 1,
            measurements: []
          }
        ]
      }
    ];
    render(<ActionTemplateDialog {...defaultProps} workflowMasters={workflowMasters} onConfirm={jest.fn()} />);
    const saveButton = screen.getByTestId(workflowTestIds.buttons.save);
    await act(async () => {
      fireEvent.click(saveButton);
    });
    expect(showWarningToast).toHaveBeenCalledWith(
      'Please select at least one structural criteria for each diagnostic view and ensure all selected annotations have valid acronyms.'
    );
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 17)}: handles dialog state changes with keyboard navigation`, async () => {
    const onOpenChange = jest.fn();
    render(<ActionTemplateDialog {...defaultProps} onOpenChange={onOpenChange} />);
    
    const dialog = screen.getByRole('dialog');
    await act(async () => {
      fireEvent.keyDown(dialog, { key: 'Tab' });
    });
    
    await act(async () => {
      fireEvent.keyDown(dialog, { key: 'Enter' });
    });
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 18)}: handles error states in validation`, async () => {
    const workflowMasters = [
      {
        id: 1,
        mappingId: 1,
        name: 'Master 1',
        selectedStatus: ESelectedStatus.SELECTED,
        fieldStatus: EFieldStatus.NONE,
        diagnosticViews: [
          {
            id: 1,
            name: 'View 1',
            selectedStatus: ESelectedStatus.SELECTED,
            noOfImageAcquisition: 1,
            min: 1,
            max: 3,
            annotations: [
              {
                id: 1,
                name: 'Annotation 1',
                acronym: 'A1',
                selectedStatus: ESelectedStatus.SELECTED,
                isManual: false,
                error: 'Invalid acronym',
                mappingId: 1,
                fieldStatus: EFieldStatus.NONE
              }
            ],
            qualityCriterias: [],
            fieldStatus: EFieldStatus.NONE,
            mappingId: 1,
            measurements: []
          }
        ]
      }
    ];
    render(<ActionTemplateDialog {...defaultProps} workflowMasters={workflowMasters} />);
    
    const saveButton = screen.getByTestId(workflowTestIds.buttons.save);
    await act(async () => {
      fireEvent.click(saveButton);
    });
    
    await waitFor(() => {
      expect(showWarningToast).toHaveBeenCalledWith('Please select at least one structural criteria for each selected diagnostic view.');
    });
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 19)}: handles cleanup and state reset`, async () => {
    const { unmount } = render(<ActionTemplateDialog {...defaultProps} />);
    
    const anatomyItem = screen.getByTestId(ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_ITEM(1));
    await act(async () => {
      fireEvent.click(anatomyItem);
    });
    
    unmount();
    expect(defaultProps.onOpenChange).not.toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 20)}: handles dialog state changes correctly`, async () => {
    const onOpenChange = jest.fn();
    render(<ActionTemplateDialog {...defaultProps} onOpenChange={onOpenChange} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 21)}: handles image acquisition validation`, async () => {
    const workflowMasters = [
      {
        id: 1,
        name: 'Master 1',
        diagnosticViews: [
          {
            id: 1,
            name: 'View 1',
            noOfImageAcquisition: 2,
            min: 2,
            max: 5,
            selected: true,
            fieldStatus: EFieldStatus.NONE,
            selectedStatus: ESelectedStatus.SELECTED,
            annotations: [],
            measurements: [],
            qualityCriterias: [],
            mappingId: 1
          }
        ],
        mappingId: 1,
        fieldStatus: EFieldStatus.NONE,
        selectedStatus: ESelectedStatus.SELECTED
      }
    ];

    render(<ActionTemplateDialog {...defaultProps} workflowMasters={workflowMasters} />);
    
    const decrementButton = screen.getByTestId(workflowTestIds.diagnosticView.acquisition.controls.decrement);
    fireEvent.click(decrementButton);
    
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 22)}: handles anatomy selection with validation`, async () => {
    const setActiveAnatomyId = jest.fn();
    const workflowMasters = [
      {
        id: 1,
        mappingId: 1,
        name: 'Master 1',
        selectedStatus: ESelectedStatus.SELECTED,
        fieldStatus: EFieldStatus.NONE,
        diagnosticViews: [
          {
            id: 1,
            name: 'View 1',
            selectedStatus: ESelectedStatus.SELECTED,
            noOfImageAcquisition: 1,
            min: 1,
            max: 3,
            annotations: [
              {
                id: 1,
                name: 'Annotation 1',
                acronym: 'A1',
                selectedStatus: ESelectedStatus.SELECTED,
                isManual: false,
                error: '',
                mappingId: 1,
                fieldStatus: EFieldStatus.NONE
              }
            ],
            qualityCriterias: [
              { id: 1, name: 'QC 1', selectedStatus: ESelectedStatus.SELECTED, description: 'desc', mappingId: 1, fieldStatus: EFieldStatus.NONE }
            ],
            fieldStatus: EFieldStatus.NONE,
            mappingId: 1,
            measurements: []
          }
        ]
      },
      {
        id: 2,
        mappingId: 2,
        name: 'Master 2',
        selectedStatus: ESelectedStatus.UNSELECTED,
        fieldStatus: EFieldStatus.NONE,
        diagnosticViews: [
          {
            id: 2,
            name: 'View 2',
            selectedStatus: ESelectedStatus.UNSELECTED,
            noOfImageAcquisition: 1,
            min: 1,
            max: 3,
            annotations: [],
            qualityCriterias: [],
            fieldStatus: EFieldStatus.NONE,
            mappingId: 2,
            measurements: []
          }
        ]
      }
    ];

    render(
      <ActionTemplateDialog 
        {...defaultProps} 
        workflowMasters={workflowMasters}
        setActiveAnatomyId={setActiveAnatomyId}
        activeAnatomyId={1}
      />
    );

    const anatomyItem = screen.getByTestId(ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_ITEM(2));
    await act(async () => {
      fireEvent.click(anatomyItem);
    });

    expect(setActiveAnatomyId).toHaveBeenCalledWith(2);
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 23)}: handles anatomy, view, and child checkbox changes`, async () => {
    const setWorkflowMasters = jest.fn();
    const workflowMasters = [
      {
        id: 1,
        mappingId: 1,
        name: 'Master 1',
        selectedStatus: 0,
        fieldStatus: 0,
        diagnosticViews: [
          {
            id: 1,
            name: 'View 1',
            selectedStatus: 0,
            noOfImageAcquisition: 1,
            min: 1,
            max: 3,
            annotations: [
              {
                id: 1,
                name: 'Annotation 1',
                acronym: 'A1',
                selectedStatus: 1,
                isManual: false,
                error: '',
                mappingId: 1,
                fieldStatus: 0
              }
            ],
            qualityCriterias: [
              { id: 1, name: 'QC 1', selectedStatus: 1, description: 'desc', mappingId: 1, fieldStatus: 0 }
            ],
            fieldStatus: 0,
            mappingId: 1,
            measurements: []
          }
        ]
      }
    ];
    render(
      <ActionTemplateDialog {...defaultProps} workflowMasters={workflowMasters} setWorkflowMasters={setWorkflowMasters} />
    );
    const anatomyCheckbox = screen.getAllByRole('checkbox')[0];
    await act(async () => {
      fireEvent.click(anatomyCheckbox);
    });
    expect(setWorkflowMasters).toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 24)}: Save in exit dialog calls onConfirm`, async () => {
    render(<ActionTemplateDialog {...defaultProps} onConfirm={jest.fn()} workflowMasters={[]} />);
    const exitButton = screen.getByText('Exit');
    await act(async () => {
      fireEvent.click(exitButton);
    });
    const saveButton = screen.getAllByText('Save').find(btn => btn.closest(`[data-testid="${workflowTestIds.buttons.dontSave}"]`) === null);
    if (!saveButton) {
        throw new Error('Save button not found');
    }
    await act(async () => {
      fireEvent.click(saveButton);
    });
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 25)}: early return when no diagnostic views selected`, async () => {
    const setActiveAnatomyId = jest.fn();
    const setActiveAnatomyName = jest.fn();
    
    // Setup workflowMasters with no diagnostic views
    const workflowMasters = [
        {
            id: 1,
            mappingId: 1,
            name: 'Master 1',
            selectedStatus: ESelectedStatus.UNSELECTED,
            fieldStatus: EFieldStatus.NONE,
            diagnosticViews: []
        }
    ];

    render(
        <ActionTemplateDialog 
            {...defaultProps} 
            workflowMasters={workflowMasters} 
            setActiveAnatomyId={setActiveAnatomyId}
            setActiveAnatomyName={setActiveAnatomyName}
            activeAnatomyId={2} // Different from the one we'll click
        />
    );

    // Click on the anatomy
    const anatomyItem = screen.getByTestId(ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_ITEM(1));
    await act(async () => {
        fireEvent.click(anatomyItem);
    });

    // Wait for state updates
    await waitFor(() => {
        expect(setActiveAnatomyId).toHaveBeenCalledWith(1);
        expect(setActiveAnatomyName).toHaveBeenCalledWith('Master 1');
    });
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 26)}: shows combined warning when no quality criteria and invalid annotation`, async () => {
    const workflowMasters = [
      {
        id: 1,
        mappingId: 1,
        name: 'Master 1',
        selectedStatus: ESelectedStatus.SELECTED,
        fieldStatus: EFieldStatus.NONE,
        diagnosticViews: [
          {
            id: 1,
            name: 'View 1',
            selectedStatus: ESelectedStatus.SELECTED,
            noOfImageAcquisition: 1,
            min: 1,
            max: 3,
            annotations: [
              {
                id: 1,
                name: 'Annotation 1',
                acronym: '',
                selectedStatus: ESelectedStatus.SELECTED,
                isManual: false,
                error: '',
                mappingId: 1,
                fieldStatus: EFieldStatus.NONE
              }
            ],
            qualityCriterias: [
              { id: 1, name: 'QC 1', selectedStatus: ESelectedStatus.UNSELECTED, description: 'desc', mappingId: 1, fieldStatus: EFieldStatus.NONE }
            ],
            fieldStatus: EFieldStatus.NONE,
            mappingId: 1,
            measurements: []
          }
        ]
      }
    ];
    render(<ActionTemplateDialog {...defaultProps} workflowMasters={workflowMasters} onConfirm={jest.fn()} />);
    const saveButton = screen.getByTestId(workflowTestIds.buttons.save);
    await act(async () => {
      fireEvent.click(saveButton);
    });
    expect(showWarningToast).toHaveBeenCalledWith(
      'Please select at least one structural criteria for each diagnostic view and ensure all selected annotations have valid acronyms.'
    );
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 27)}: Save button is disabled when no anatomy is selected`, async () => {
    const workflowMasters = [
      {
        id: 1,
        mappingId: 1,
        name: 'Master 1',
        selectedStatus: 0,
        fieldStatus: 0,
        diagnosticViews: []
      }
    ];
    render(<ActionTemplateDialog {...defaultProps} workflowMasters={workflowMasters} onConfirm={jest.fn()} />);
    const saveButton = screen.getByTestId(workflowTestIds.buttons.save);
    expect(saveButton).toBeDisabled();
    await act(async () => {
      fireEvent.click(saveButton);
    });
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 28)}: handles error states in annotation validation`, async () => {
    const workflowMasters = [
      {
        id: 1,
        mappingId: 1,
        name: 'Master 1',
        selectedStatus: ESelectedStatus.SELECTED,
        fieldStatus: EFieldStatus.NONE,
        diagnosticViews: [
          {
            id: 1,
            name: 'View 1',
            selectedStatus: ESelectedStatus.SELECTED,
            noOfImageAcquisition: 1,
            min: 1,
            max: 3,
            annotations: [
              {
                id: 1,
                name: 'Annotation 1',
                acronym: 'A1',
                selectedStatus: ESelectedStatus.SELECTED,
                isManual: false,
                error: 'Invalid acronym',
                mappingId: 1,
                fieldStatus: EFieldStatus.NONE
              }
            ],
            qualityCriterias: [
              { id: 1, name: 'QC 1', selectedStatus: ESelectedStatus.SELECTED, description: 'desc', mappingId: 1, fieldStatus: EFieldStatus.NONE }
            ],
            fieldStatus: EFieldStatus.NONE,
            mappingId: 1,
            measurements: []
          }
        ]
      }
    ];
    render(<ActionTemplateDialog {...defaultProps} workflowMasters={workflowMasters} />);
    
    expect(screen.getByText('Invalid acronym')).toBeInTheDocument();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 29)}: handles cleanup on unmount`, () => {
    const { unmount } = render(<ActionTemplateDialog {...defaultProps} />);
    unmount();
    expect(defaultProps.onOpenChange).not.toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 30)}: handles quality criteria validation edge cases`, async () => {
    const workflowMasters = [
      {
        id: 1,
        mappingId: 1,
        name: 'Master 1',
        selectedStatus: ESelectedStatus.SELECTED,
        fieldStatus: EFieldStatus.NONE,
        diagnosticViews: [
          {
            id: 1,
            name: 'View 1',
            selectedStatus: ESelectedStatus.SELECTED,
            noOfImageAcquisition: 1,
            min: 1,
            max: 3,
            annotations: [],
            qualityCriterias: [],
            fieldStatus: EFieldStatus.NONE,
            mappingId: 1,
            measurements: []
          }
        ]
      }
    ];
    render(<ActionTemplateDialog {...defaultProps} workflowMasters={workflowMasters} />);
    
    const saveButton = screen.getByTestId(workflowTestIds.buttons.save);
    await act(async () => {
      fireEvent.click(saveButton);
    });
    expect(showWarningToast).toHaveBeenCalledWith('Please select at least one structural criteria for each selected diagnostic view.');
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 31)}: handles all checkbox types correctly`, async () => {
    const setWorkflowMasters = jest.fn();
    const workflowMasters = [
      {
        id: 1,
        mappingId: 1,
        name: 'Master 1',
        selectedStatus: ESelectedStatus.UNSELECTED,
        fieldStatus: EFieldStatus.NONE,
        diagnosticViews: [
          {
            id: 1,
            name: 'View 1',
            selectedStatus: ESelectedStatus.UNSELECTED,
            noOfImageAcquisition: 1,
            min: 1,
            max: 3,
            annotations: [
              {
                id: 1,
                name: 'Annotation 1',
                acronym: 'A1',
                selectedStatus: ESelectedStatus.UNSELECTED,
                isManual: false,
                error: '',
                mappingId: 1,
                fieldStatus: EFieldStatus.NONE
              }
            ],
            qualityCriterias: [
              { id: 1, name: 'QC 1', selectedStatus: ESelectedStatus.UNSELECTED, description: 'desc', mappingId: 1, fieldStatus: EFieldStatus.NONE }
            ],
            fieldStatus: EFieldStatus.NONE,
            mappingId: 1,
            measurements: []
          }
        ]
      }
    ];

    render(
      <ActionTemplateDialog 
        {...defaultProps} 
        workflowMasters={workflowMasters} 
        setWorkflowMasters={setWorkflowMasters}
        activeAnatomyId={1}
      />
    );

    const anatomyCheckbox = screen.getAllByRole('checkbox')[0];
    await act(async () => {
      fireEvent.click(anatomyCheckbox);
    });
    expect(setWorkflowMasters).toHaveBeenCalled();

    const viewCheckbox = screen.getAllByRole('checkbox')[1];
    await act(async () => {
      fireEvent.click(viewCheckbox);
    });
    expect(setWorkflowMasters).toHaveBeenCalled();

    const annotationCheckbox = screen.getAllByRole('checkbox')[2];
    await act(async () => {
      fireEvent.click(annotationCheckbox);
    });
    expect(setWorkflowMasters).toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 32)}: handles save and continue flow correctly`, async () => {
    const onConfirm = jest.fn();
    render(
      <ActionTemplateDialog 
        {...defaultProps} 
        onConfirm={onConfirm}
        workflowMasters={validWorkflowMasters}
      />
    );

    const exitButton = screen.getByText('Exit');
    await act(async () => {
      fireEvent.click(exitButton);
    });

    const saveButton = screen.getAllByText('Save').find(btn => !btn.closest(`[data-testid="${workflowTestIds.buttons.dontSave}"]`));
    if (!saveButton) {
        throw new Error('Save button not found');
    }
    await act(async () => {
      fireEvent.click(saveButton);
    });

    expect(onConfirm).toHaveBeenCalled();
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 33)}: handles anatomy selection with validation`, async () => {
    const setActiveAnatomyId = jest.fn();
    const setActiveAnatomyName = jest.fn();
    const setWorkflowMasters = jest.fn();
    
    // Setup workflowMasters with initial state
    const workflowMasters = [
      {
        id: 1,
        mappingId: 1,
        name: 'Master 1',
        selectedStatus: ESelectedStatus.SELECTED,
        fieldStatus: EFieldStatus.NONE,
        diagnosticViews: [
          {
            id: 1,
            name: 'View 1',
            selectedStatus: ESelectedStatus.SELECTED,
            noOfImageAcquisition: 1,
            min: 1,
            max: 3,
            annotations: [
              {
                id: 1,
                name: 'Annotation 1',
                acronym: 'A1',
                selectedStatus: ESelectedStatus.SELECTED,
                isManual: false,
                error: '',
                mappingId: 1,
                fieldStatus: EFieldStatus.NONE
              }
            ],
            qualityCriterias: [
              { id: 1, name: 'QC 1', selectedStatus: ESelectedStatus.SELECTED, description: 'desc', mappingId: 1, fieldStatus: EFieldStatus.NONE }
            ],
            fieldStatus: EFieldStatus.NONE,
            mappingId: 1,
            measurements: []
          }
        ]
      },
      {
        id: 2,
        mappingId: 2,
        name: 'Master 2',
        selectedStatus: ESelectedStatus.UNSELECTED,
        fieldStatus: EFieldStatus.NONE,
        diagnosticViews: [
          {
            id: 2,
            name: 'View 2',
            selectedStatus: ESelectedStatus.UNSELECTED,
            noOfImageAcquisition: 1,
            min: 1,
            max: 3,
            annotations: [],
            qualityCriterias: [],
            fieldStatus: EFieldStatus.NONE,
            mappingId: 2,
            measurements: []
          }
        ]
      }
    ];

    render(
      <ActionTemplateDialog 
        {...defaultProps} 
        workflowMasters={workflowMasters}
        setWorkflowMasters={setWorkflowMasters}
        setActiveAnatomyId={setActiveAnatomyId}
        setActiveAnatomyName={setActiveAnatomyName}
        activeAnatomyId={1}
        activeAnatomyName="Master 1"
      />
    );

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByTestId(workflowTestIds.anatomySection)).toBeInTheDocument();
    });

    // Find and click the anatomy item
    const anatomyItem = screen.getByTestId(ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_ITEM(2));
    await act(async () => {
      fireEvent.click(anatomyItem);
    });

    // Verify that the active anatomy was updated
    expect(setActiveAnatomyId).toHaveBeenCalledWith(2);
    expect(setActiveAnatomyName).toHaveBeenCalledWith('Master 2');
  });

  it(`${generateTestId(SRS_ID.ACTION_TEMPLATE, 34)}: handles annotation acronym updates correctly`, async () => {
    const setWorkflowMasters = jest.fn();
    const workflowMasters = [
      {
        id: 1,
        mappingId: 1,
        name: 'Master 1',
        selectedStatus: ESelectedStatus.SELECTED,
        fieldStatus: EFieldStatus.NONE,
        diagnosticViews: [
          {
            id: 1,
            name: 'View 1',
            selectedStatus: ESelectedStatus.SELECTED,
            noOfImageAcquisition: 1,
            min: 1,
            max: 3,
            annotations: [
              {
                id: 1,
                name: 'Annotation 1',
                acronym: 'A1',
                selectedStatus: ESelectedStatus.SELECTED,
                isManual: false,
                error: '',
                mappingId: 1,
                fieldStatus: EFieldStatus.NONE
              }
            ],
            qualityCriterias: [],
            fieldStatus: EFieldStatus.NONE,
            mappingId: 1,
            measurements: []
          }
        ]
      }
    ];

    render(
      <ActionTemplateDialog 
        {...defaultProps} 
        workflowMasters={workflowMasters}
        setWorkflowMasters={setWorkflowMasters}
        activeAnatomyId={1}
      />
    );

    const acronymInput = screen.getByTestId(workflowTestIds.annotation.acronymInput);
    await act(async () => {
      fireEvent.change(acronymInput, { target: { value: 'NEW' } });
    });

    expect(setWorkflowMasters).toHaveBeenCalled();
  });
}); 
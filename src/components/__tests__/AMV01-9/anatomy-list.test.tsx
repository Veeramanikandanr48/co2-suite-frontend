import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AnatomyList from '@/components/workflow-customization/anatomy-list';
import { ESelectedStatus, EFieldStatus } from '~/enums/workflow-customization-enum';
import type { WorkflowMaster } from '~/types/workflow';
import { APP_NAME, generateTestId, SRS_ID } from '../../test-ids/utc-global';
import { ANATOMY_LIST_TEST_IDS } from '../../test-ids/anatomy-list.ids';

// Mock data
const mockAnatomies: WorkflowMaster[] = [
  {
    id: 1,
    name: 'Anatomy 1',
    selectedStatus: ESelectedStatus.UNSELECTED,
    fieldStatus: EFieldStatus.NONE,
    mappingId: 1,
    diagnosticViews: [
      {
        id: 1,
        name: 'View 1',
        selectedStatus: ESelectedStatus.UNSELECTED,
        noOfImageAcquisition: 1,
        min: 1,
        max: 1,
        annotations: [],
        qualityCriterias: [],
        fieldStatus: EFieldStatus.NONE,
        mappingId: 1,
        measurements: []
      }
    ]
  },
  {
    id: 2,
    name: 'Anatomy 2',
    selectedStatus: ESelectedStatus.UNSELECTED,
    fieldStatus: EFieldStatus.NONE,
    mappingId: 2,
    diagnosticViews: [
      {
        id: 2,
        name: 'View 2',
        selectedStatus: ESelectedStatus.UNSELECTED,
        noOfImageAcquisition: 1,
        min: 1,
        max: 1,
        annotations: [],
        qualityCriterias: [],
        fieldStatus: EFieldStatus.NONE,
        mappingId: 2,
        measurements: []
      }
    ]
  }
];

describe( `${APP_NAME}-${SRS_ID.ANATOMY_LIST} AnatomyList`, () => {
  const defaultProps = {
    anatomies: mockAnatomies,
    activeAnatomyId: 1,
    onToggle: jest.fn(),
    onSelect: jest.fn(),
    onActiveAnatomyNameChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it (`${generateTestId(SRS_ID.ANATOMY_LIST ,1 )}: handles anatomy selection`, async () => {
    const onActiveAnatomyNameChange = jest.fn();
    render(<AnatomyList {...defaultProps} onActiveAnatomyNameChange={onActiveAnatomyNameChange} />);
    const anatomyItem = screen.getByTestId(ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_ITEM(2));
    
    await act(async () => {
      fireEvent.click(anatomyItem);
    });
    
    expect(defaultProps.onSelect).toHaveBeenCalledWith(2);
    expect(onActiveAnatomyNameChange).toHaveBeenCalledWith('Anatomy 2');
  });

  it (`${generateTestId(SRS_ID.ANATOMY_LIST ,2 )}:handles anatomy toggle`, async () => {
    render(<AnatomyList {...defaultProps} />);
    const triStateCheckbox = screen.getAllByRole('checkbox')[0];
    
    await act(async () => {
      fireEvent.click(triStateCheckbox);
    });
    
    expect(defaultProps.onToggle).toHaveBeenCalledWith(1);
  });

  it  (`${generateTestId(SRS_ID.ANATOMY_LIST ,3)}: applies active styles to selected anatomy`, () => {
    render(<AnatomyList {...defaultProps} />);
    const activeAnatomy = screen.getByTestId('anatomy-list-item-1');
    
    expect(activeAnatomy).toHaveClass('bg-light-300');
    expect(activeAnatomy).toHaveClass('text-neutral-800');
  });

  it (`${generateTestId(SRS_ID.ANATOMY_LIST ,4)}: applies hover styles to non-selected anatomies`, () => {
    render(<AnatomyList {...defaultProps} />);
    const nonActiveAnatomy = screen.getByTestId('anatomy-list-item-2');
    
    expect(nonActiveAnatomy).toHaveClass('hover:bg-gray-50');
    expect(nonActiveAnatomy).toHaveClass('text-neutral-400');
  });

  it (`${generateTestId(SRS_ID.ANATOMY_LIST ,5)}: displays correct diagnostic view count`, () => {
    const anatomiesWithSelectedViews = [
      {
        ...mockAnatomies[0],
        diagnosticViews: [
          {
            ...mockAnatomies[0].diagnosticViews[0],
            selectedStatus: ESelectedStatus.SELECTED
          }
        ]
      },
      mockAnatomies[1]
    ];
    
    render(<AnatomyList {...defaultProps} anatomies={anatomiesWithSelectedViews} />);
    expect(screen.getByText('1/1 Planes')).toBeInTheDocument();
  });

}); 
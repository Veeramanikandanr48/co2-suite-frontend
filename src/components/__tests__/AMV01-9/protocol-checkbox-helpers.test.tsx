import ProtocolCheckboxHelpers from '~/lib/protocol-checkbox-helpers';
import { ESelectedStatus, EFieldStatus } from '~/enums/workflow-customization-enum';
import type { WorkflowMaster, DiagnosticView } from '~/types/workflow';
import { generateTestId, APP_NAME, SRS_ID } from '../../test-ids/utc-global';

describe(`${APP_NAME}-${SRS_ID.PROTOCOL_CHECKBOX}: ProtocolCheckboxHelpers`, () => {
  const mockDiagnosticView: DiagnosticView = {
    id: 1,
    name: 'Test View',
    mappingId: 1,
    fieldStatus: EFieldStatus.NEW,
    selectedStatus: ESelectedStatus.UNSELECTED,
    noOfImageAcquisition: 1,
    min: 1,
    max: 1,
    qualityCriterias: [
      { 
        id: 1, 
        name: 'Test QC',
        mappingId: 1,
        fieldStatus: EFieldStatus.NEW,
        selectedStatus: ESelectedStatus.UNSELECTED,
        description: 'Test Description'
      }
    ],
    measurements: [
      { 
        id: 1, 
        name: 'Test Measurement',
        mappingId: 1,
        fieldStatus: EFieldStatus.NEW,
        selectedStatus: ESelectedStatus.UNSELECTED
      }
    ],
    annotations: [
      { 
        id: 1, 
        name: 'Test Annotation',
        mappingId: 1,
        fieldStatus: EFieldStatus.NEW,
        selectedStatus: ESelectedStatus.UNSELECTED,
        isManual: false,
        acronym: 'TEST',
        error: ''
      }
    ]
  };

  const mockAnatomy: WorkflowMaster = {
    id: 1,
    name: 'Test Anatomy',
    mappingId: 1,
    fieldStatus: EFieldStatus.NEW,
    selectedStatus: ESelectedStatus.UNSELECTED,
    diagnosticViews: [mockDiagnosticView]
  };

  describe(`${APP_NAME}-${SRS_ID.PROTOCOL_CHECKBOX}: selectOrUnselectAllInAnatomy`, () => {
    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 35)}: should select all items in anatomy`, () => {
      const result = ProtocolCheckboxHelpers.selectOrUnselectAllInAnatomy(
        mockAnatomy,
        ESelectedStatus.SELECTED
      );

      expect(result.selectedStatus).toBe(ESelectedStatus.SELECTED);
      expect(result.diagnosticViews[0].selectedStatus).toBe(ESelectedStatus.SELECTED);
      expect(result.diagnosticViews[0].qualityCriterias[0].selectedStatus).toBe(ESelectedStatus.SELECTED);
      expect(result.diagnosticViews[0].measurements[0].selectedStatus).toBe(ESelectedStatus.SELECTED);
      expect(result.diagnosticViews[0].annotations[0].selectedStatus).toBe(ESelectedStatus.SELECTED);
    });

    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 36)}: should unselect all items in anatomy`, () => {
      const result = ProtocolCheckboxHelpers.selectOrUnselectAllInAnatomy(
        mockAnatomy,
        ESelectedStatus.UNSELECTED
      );

      expect(result.selectedStatus).toBe(ESelectedStatus.UNSELECTED);
      expect(result.diagnosticViews[0].selectedStatus).toBe(ESelectedStatus.UNSELECTED);
      expect(result.diagnosticViews[0].qualityCriterias[0].selectedStatus).toBe(ESelectedStatus.UNSELECTED);
      expect(result.diagnosticViews[0].measurements[0].selectedStatus).toBe(ESelectedStatus.UNSELECTED);
      expect(result.diagnosticViews[0].annotations[0].selectedStatus).toBe(ESelectedStatus.UNSELECTED);
    });
  });

  describe(`${APP_NAME}-${SRS_ID.PROTOCOL_CHECKBOX}: setDiagnosticViewAndChildrenStatus`, () => {
    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 37)}: should set status for diagnostic view and its children`, () => {
      const result = ProtocolCheckboxHelpers.setDiagnosticViewAndChildrenStatus(
        mockDiagnosticView,
        ESelectedStatus.SELECTED
      );

      expect(result.selectedStatus).toBe(ESelectedStatus.SELECTED);
      expect(result.qualityCriterias[0].selectedStatus).toBe(ESelectedStatus.SELECTED);
      expect(result.measurements[0].selectedStatus).toBe(ESelectedStatus.SELECTED);
      expect(result.annotations[0].selectedStatus).toBe(ESelectedStatus.SELECTED);
    });
  });

  describe(`${APP_NAME}-${SRS_ID.PROTOCOL_CHECKBOX}: computeAnatomyTriState`, () => {
    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 38)}: should return UNSELECTED when no views are selected`, () => {
      const views = [
        { ...mockDiagnosticView, selectedStatus: ESelectedStatus.UNSELECTED },
        { ...mockDiagnosticView, id: 2, selectedStatus: ESelectedStatus.UNSELECTED }
      ];

      const result = ProtocolCheckboxHelpers.computeAnatomyTriState(views);
      expect(result).toBe(ESelectedStatus.UNSELECTED);
    });

    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 39)}: should return SELECTED when all views are selected`, () => {
      const views = [
        { ...mockDiagnosticView, selectedStatus: ESelectedStatus.SELECTED },
        { ...mockDiagnosticView, id: 2, selectedStatus: ESelectedStatus.SELECTED }
      ];

      const result = ProtocolCheckboxHelpers.computeAnatomyTriState(views);
      expect(result).toBe(ESelectedStatus.SELECTED);
    });

    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 40)}: should return INTERMEDIATE when some views are selected`, () => {
      const views = [
        { ...mockDiagnosticView, selectedStatus: ESelectedStatus.SELECTED },
        { ...mockDiagnosticView, id: 2, selectedStatus: ESelectedStatus.UNSELECTED }
      ];

      const result = ProtocolCheckboxHelpers.computeAnatomyTriState(views);
      expect(result).toBe(ESelectedStatus.INTERMEDIATE);
    });
  });

  describe(`${APP_NAME}-${SRS_ID.PROTOCOL_CHECKBOX}: updateChildStatus`, () => {
    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 41)}: should update quality criteria status`, () => {
      const result = ProtocolCheckboxHelpers.updateChildStatus(
        mockDiagnosticView,
        'qc',
        1,
        true
      );

      expect(result.qualityCriterias[0].selectedStatus).toBe(ESelectedStatus.SELECTED);
    });

    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 42)}: should update measurement status`, () => {
      const result = ProtocolCheckboxHelpers.updateChildStatus(
        mockDiagnosticView,
        'measurement',
        1,
        true
      );

      expect(result.measurements[0].selectedStatus).toBe(ESelectedStatus.SELECTED);
    });

    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 43)}: should update annotation status`, () => {
      const result = ProtocolCheckboxHelpers.updateChildStatus(
        mockDiagnosticView,
        'annotation',
        1,
        true
      );

      expect(result.annotations[0].selectedStatus).toBe(ESelectedStatus.SELECTED);
      expect(result.annotations[0].acronym).toBe('TEST');
    });
  });

  describe(`${APP_NAME}-${SRS_ID.PROTOCOL_CHECKBOX}: validateAcronym`, () => {
    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 44)}: should return empty string for valid acronym`, () => {
      const result = ProtocolCheckboxHelpers.validateAcronym('ABC123');
      expect(result).toBe('');
    });

    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 45)}: should return error for empty string`, () => {
      const result = ProtocolCheckboxHelpers.validateAcronym('');
      expect(result).toBe('Acronym is required when annotation is selected');
    });

    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 46)}: should return error for too long acronym`, () => {
      const result = ProtocolCheckboxHelpers.validateAcronym('ABCDEFGHIJK'); // 11 chars
      expect(result).toBe('Acronym must be less than 10 characters');
    });

    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 47)}: should return error for invalid characters`, () => {
      const result = ProtocolCheckboxHelpers.validateAcronym('abc!@#');
      expect(result).toBe('Acronym must contain only uppercase letters and numbers');
    });
  });

  describe(`${APP_NAME}-${SRS_ID.PROTOCOL_CHECKBOX}: filterSelected`, () => {
    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 48)}: should filter selected items`, () => {
      const items = [
        { id: 1, name: 'Test 1', mappingId: 1, fieldStatus: EFieldStatus.NEW, selectedStatus: ESelectedStatus.SELECTED },
        { id: 2, name: 'Test 2', mappingId: 2, fieldStatus: EFieldStatus.NEW, selectedStatus: ESelectedStatus.UNSELECTED },
        { id: 3, name: 'Test 3', mappingId: 3, fieldStatus: EFieldStatus.NEW, selectedStatus: ESelectedStatus.SELECTED }
      ];

      const result = ProtocolCheckboxHelpers.filterSelected(items);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(3);
    });

    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 49)}: should return empty array for undefined input`, () => {
      const result = ProtocolCheckboxHelpers.filterSelected();
      expect(result).toEqual([]);
    });
  });

  describe(`${APP_NAME}-${SRS_ID.PROTOCOL_CHECKBOX}: getFilteredDiagnosticViews`, () => {
    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 50)}: should filter and transform diagnostic views`, () => {
      const views = [
        {
          ...mockDiagnosticView,
          selectedStatus: ESelectedStatus.SELECTED,
          qualityCriterias: [
            { 
              id: 1, 
              name: 'Test QC',
              mappingId: 1,
              fieldStatus: EFieldStatus.NEW,
              selectedStatus: ESelectedStatus.SELECTED,
              description: 'Test Description'
            },
            { 
              id: 2, 
              name: 'Test QC 2',
              mappingId: 2,
              fieldStatus: EFieldStatus.NEW,
              selectedStatus: ESelectedStatus.UNSELECTED,
              description: 'Test Description 2'
            }
          ],
          measurements: [
            { 
              id: 1, 
              name: 'Test Measurement',
              mappingId: 1,
              fieldStatus: EFieldStatus.NEW,
              selectedStatus: ESelectedStatus.SELECTED
            },
            { 
              id: 2, 
              name: 'Test Measurement 2',
              mappingId: 2,
              fieldStatus: EFieldStatus.NEW,
              selectedStatus: ESelectedStatus.UNSELECTED
            }
          ],
          annotations: [
            { 
              id: 1, 
              name: 'Test Annotation',
              mappingId: 1,
              fieldStatus: EFieldStatus.NEW,
              selectedStatus: ESelectedStatus.SELECTED,
              isManual: false,
              acronym: 'TEST',
              error: ''
            },
            { 
              id: 2, 
              name: 'Test Annotation 2',
              mappingId: 2,
              fieldStatus: EFieldStatus.NEW,
              selectedStatus: ESelectedStatus.UNSELECTED,
              isManual: false,
              acronym: 'TEST2',
              error: ''
            }
          ]
        },
        {
          ...mockDiagnosticView,
          id: 2,
          selectedStatus: ESelectedStatus.UNSELECTED
        }
      ];

      const result = ProtocolCheckboxHelpers.getFilteredDiagnosticViews(views);
      expect(result).toHaveLength(1);
      expect(result[0].qualityCriterias).toHaveLength(1);
      expect(result[0].measurements).toHaveLength(1);
      expect(result[0].annotations).toHaveLength(1);
    });
  });

  describe(`${APP_NAME}-${SRS_ID.PROTOCOL_CHECKBOX}: setAnatomyAndChildrenStatus`, () => {
    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 51)}: should set status for anatomy and all its children`, () => {
      const result = ProtocolCheckboxHelpers.setAnatomyAndChildrenStatus(
        mockAnatomy,
        ESelectedStatus.SELECTED
      );

      expect(result.selectedStatus).toBe(ESelectedStatus.SELECTED);
      expect(result.diagnosticViews[0].selectedStatus).toBe(ESelectedStatus.SELECTED);
      expect(result.diagnosticViews[0].qualityCriterias[0].selectedStatus).toBe(ESelectedStatus.SELECTED);
      expect(result.diagnosticViews[0].measurements[0].selectedStatus).toBe(ESelectedStatus.SELECTED);
      expect(result.diagnosticViews[0].annotations[0].selectedStatus).toBe(ESelectedStatus.SELECTED);
    });
  });

  describe(`${APP_NAME}-${SRS_ID.PROTOCOL_CHECKBOX}: updateViewStatus`, () => {
    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 52)}: should set view status based on children status`, () => {
      const view = {
        ...mockDiagnosticView,
        qualityCriterias: [
          { ...mockDiagnosticView.qualityCriterias[0], selectedStatus: ESelectedStatus.SELECTED }
        ],
        measurements: [
          { ...mockDiagnosticView.measurements[0], selectedStatus: ESelectedStatus.SELECTED }
        ],
        annotations: [
          { ...mockDiagnosticView.annotations[0], selectedStatus: ESelectedStatus.SELECTED }
        ]
      };

      const result = ProtocolCheckboxHelpers.updateViewStatus(view);
      expect(result.selectedStatus).toBe(ESelectedStatus.SELECTED);
    });
  });

  describe(`${APP_NAME}-${SRS_ID.PROTOCOL_CHECKBOX}: updateAnnotationWithError`, () => {
    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 53)}: should update annotation with error`, () => {
      const annotation = {
        ...mockDiagnosticView.annotations[0],
        acronym: 'TEST'
      };

      const result = ProtocolCheckboxHelpers.updateAnnotationWithError(annotation, 'NEW');
      expect(result.acronym).toBe('NEW');
      expect(result.error).toBe('');
    });

    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 54)}: should handle undefined value`, () => {
      const annotation = {
        ...mockDiagnosticView.annotations[0],
        acronym: 'TEST'
      };

      const result = ProtocolCheckboxHelpers.updateAnnotationWithError(annotation, undefined);
      expect(result.acronym).toBe('TEST');
    });
  });

  describe(`${APP_NAME}-${SRS_ID.PROTOCOL_CHECKBOX}: isAnatomySelected`, () => {
    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 55)}: should return true for selected anatomy`, () => {
      const anatomy = {
        ...mockAnatomy,
        selectedStatus: ESelectedStatus.SELECTED
      };

      const result = ProtocolCheckboxHelpers.isAnatomySelected(anatomy);
      expect(result).toBe(true);
    });

    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 56)}: should return true for intermediate anatomy`, () => {
      const anatomy = {
        ...mockAnatomy,
        selectedStatus: ESelectedStatus.INTERMEDIATE
      };

      const result = ProtocolCheckboxHelpers.isAnatomySelected(anatomy);
      expect(result).toBe(true);
    });

    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 57)}: should return false for unselected anatomy`, () => {
      const anatomy = {
        ...mockAnatomy,
        selectedStatus: ESelectedStatus.UNSELECTED
      };

      const result = ProtocolCheckboxHelpers.isAnatomySelected(anatomy);
      expect(result).toBe(false);
    });
  });

  describe(`${APP_NAME}-${SRS_ID.PROTOCOL_CHECKBOX}: image acquisition methods`, () => {
    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 58)}: should increment image acquisition when below max`, () => {
      const view = {
        ...mockDiagnosticView,
        noOfImageAcquisition: 1,
        max: 3
      };

      const result = ProtocolCheckboxHelpers.incrementImageAcquisition(view);
      expect(result.noOfImageAcquisition).toBe(2);
    });

    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 59)}: should not increment image acquisition when at max`, () => {
      const view = {
        ...mockDiagnosticView,
        noOfImageAcquisition: 3,
        max: 3
      };

      const result = ProtocolCheckboxHelpers.incrementImageAcquisition(view);
      expect(result.noOfImageAcquisition).toBe(3);
    });

    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 60)}: should decrement image acquisition when above min`, () => {
      const view = {
        ...mockDiagnosticView,
        noOfImageAcquisition: 2,
        min: 1
      };

      const result = ProtocolCheckboxHelpers.decrementImageAcquisition(view);
      expect(result.noOfImageAcquisition).toBe(1);
    });

    it(`${generateTestId(SRS_ID.PROTOCOL_CHECKBOX, 61)}: should not decrement image acquisition when at min`, () => {
      const view = {
        ...mockDiagnosticView,
        noOfImageAcquisition: 1,
        min: 1
      };

      const result = ProtocolCheckboxHelpers.decrementImageAcquisition(view);
      expect(result.noOfImageAcquisition).toBe(1);
    });
  });
});
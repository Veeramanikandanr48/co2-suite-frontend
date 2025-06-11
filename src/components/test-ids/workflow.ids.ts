const workflowTestIds = {
  // Dialog elements
  actionTemplateDialog: 'action-template-dialog',
  dialogOverlay: 'dialog-overlay',
  dialogContent: 'dialog-content',
  dialogTitle: 'dialog-title',
  dialogFooter: 'dialog-footer',

  // Main sections
  anatomySection: 'anatomy-section',
  workflowSection: 'workflow-section',
  detailSection: 'detail-section',

  // Workflow card
  workflowCard: {
    container: 'workflow-card',
    heading: 'workflow-heading',
    description: 'workflow-description',
    createdBy: 'workflow-created-by',
    lastUpdated: 'workflow-last-updated'
  },

  // Anatomy elements
  anatomy: {
    container: 'anatomy-container',
    title: 'anatomy-title',
    list: 'anatomy-list',
    item: (id: number) => `anatomy-${id}`,
    selected: 'selected-anatomy'
  },

  // Diagnostic View
  diagnosticView: {
    container: 'diagnostic-view-container',
    header: {
      container: 'diagnostic-view-header',
      checkbox: (id: number) => `diagnostic-view-checkbox-${id}`,
      name: 'diagnostic-view-name',
      selected: 'selected-diagnostic-view'
    },
    acquisition: {
      container: 'diagnostic-view-acquisition',
      label: 'diagnostic-view-acquisition-label',
      controls: {
        container: 'diagnostic-view-acquisition-controls',
        increment: 'increment-image-acquisition',
        decrement: 'decrement-image-acquisition',
        count: 'image-acquisition-count'
      }
    },
    qualityCriteria: {
      container: 'quality-criteria-container',
      title: 'quality-criteria-title',
      list: 'quality-criteria-list',
      item: (id: number) => `quality-criteria-item-${id}`,
      checkbox: (id: number) => `quality-criteria-checkbox-${id}`,
      selected: 'selected-quality-criteria'
    },
    measurement: {
      container: 'measurement-container',
      title: 'measurement-title',
      list: 'measurement-list',
      item: (id: number) => `measurement-item-${id}`,
      checkbox: (id: number) => `measurement-checkbox-${id}`,
      selected: 'selected-measurement',
      empty: 'measurement-empty'
    },
    annotation: {
      container: 'annotation-container',
      title: 'annotation-title',
      list: 'annotation-list',
      item: (id: number) => `annotation-item-${id}`,
      checkbox: (id: number) => `annotation-checkbox-${id}`,
      selected: 'selected-annotation',
      input: {
        container: 'annotation-input-container',
        field: 'annotation-acronym-input',
        error: 'annotation-error'
      },
      empty: 'annotation-empty'
    }
  },

  // Quality criteria elements
  qualityCriteria: {
    container: 'quality-criteria-container',
    title: 'quality-criteria-title',
    checkbox: (id: number) => `quality-criteria-checkbox-${id}`,
    selected: 'selected-quality-criteria'
  },

  // Measurement elements
  measurement: {
    container: 'measurement-container',
    title: 'measurement-title',
    checkbox: (id: number) => `measurement-checkbox-${id}`,
    selected: 'selected-measurement'
  },

  // Annotation elements
  annotation: {
    container: 'annotation-container',
    title: 'annotation-title',
    checkbox: (id: number) => `annotation-checkbox-${id}`,
    selected: 'selected-annotation',
    acronymInput: 'annotation-acronym-input'
  },

  // Footer buttons
  buttons: {
    exit: 'exit-button',
    save: 'save-button',
    dontSave: 'dont-save-button',
    exitDialogSave: 'exit-dialog-save-button'
  },

  // Add Workflow Dialog
  addWorkflow: {
    dialog: 'add-workflow-dialog',
    overlay: 'add-workflow-overlay',
    content: 'add-workflow-content',
    title: 'add-workflow-title',
    header: 'add-workflow-header',
    closeButton: 'add-workflow-close',
    nameInput: 'add-workflow-name-input',
    descriptionInput: 'add-workflow-description-input',
    confirmButton: 'add-workflow-confirm',
    cancelButton: 'add-workflow-cancel',
    form: 'add-workflow-form',
    closeIcon: 'close-icon',
    plusCircleIcon: 'plus-circle-icon'
  },

  // Duplicate Template Dialog
  duplicateTemplate: {
    dialog: 'duplicate-template-dialog',
    overlay: 'duplicate-template-overlay',
    content: 'duplicate-template-content',
    header: {
      container: 'duplicate-template-header',
      title: 'duplicate-template-header-title',
      closeButton: 'duplicate-template-close'
    },
    body: {
      container: 'duplicate-template-body',
      title: 'duplicate-template-title',
      description: 'duplicate-template-description'
    },
    footer: {
      container: 'duplicate-template-footer',
      confirmButton: 'duplicate-template-confirm',
      cancelButton: 'duplicate-template-cancel'
    }
  },
};

export {
    workflowTestIds,
}

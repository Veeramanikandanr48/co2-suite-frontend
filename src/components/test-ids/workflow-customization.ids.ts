const workflowCustomizationTestIds = {
  page: {
    container: 'workflow-customization-page',
    header: {
      container: 'workflow-customization-header',
      title: 'workflow-customization-title',
      addButton: 'workflow-customization-add-button'
    },
    content: {
      container: 'workflow-customization-content',
      sidebar: {
        container: 'workflow-customization-sidebar-container',
        content: 'workflow-customization-sidebar-content',
        search: 'workflow-customization-search',
        sort: 'workflow-customization-sort',
        standardWorkflows: 'workflow-customization-standard-workflows',
        customWorkflows: 'workflow-customization-custom-workflows',
        editButton: (id: number) => `edit-workflow-${id}`
      },
      main: {
        container: 'workflow-customization-main',
        card: 'workflow-customization-card',
        anatomy: {
          container: 'workflow-customization-anatomy',
          title: 'workflow-customization-anatomy-title',
          list: 'workflow-customization-anatomy-list',
          item: (id: number) => `anatomy-${id}`
        }
      }
    },
    dialogs: {
      addWorkflow: {
        container: 'workflow-customization-add-dialog',
        form: 'workflow-customization-add-form',
        nameInput: 'workflow-customization-name-input',
        descriptionInput: 'workflow-customization-description-input',
        confirmButton: 'workflow-customization-add-confirm',
        cancelButton: 'workflow-customization-add-cancel'
      },
      duplicateTemplate: {
        container: 'workflow-customization-duplicate-dialog',
        confirmButton: 'workflow-customization-duplicate-confirm',
        cancelButton: 'workflow-customization-duplicate-cancel'
      },
      actionTemplate: {
        container: 'workflow-customization-action-dialog',
        confirmButton: 'workflow-customization-action-confirm',
        cancelButton: 'workflow-customization-action-cancel'
      }
    }
  }
};

const workflowListTestIds = {
  container: 'workflow-list-container',
  header: {
    container: 'workflow-list-header',
    title: 'workflow-list-title',
    sortButton: 'workflow-list-sort-button'
  },
  search: {
    container: 'workflow-list-search',
    input: 'workflow-list-search-input'
  },
  sections: {
    standard: {
      container: 'workflow-list-standard-section',
      title: 'workflow-list-standard-title',
      emptyMessage: 'workflow-list-standard-empty',
      item: (id: number) => `workflow-list-standard-item-${id}`
    },
    custom: {
      container: 'workflow-list-custom-section',
      title: 'workflow-list-custom-title',
      emptyMessage: 'workflow-list-custom-empty',
      item: (id: number) => `workflow-list-custom-item-${id}`,
      menu: {
        button: (id: number) => `workflow-list-custom-menu-${id}`,
        duplicateButton: (id: number) => `workflow-list-custom-duplicate-${id}`
      }
    }
  }
};

export {
  workflowCustomizationTestIds,
  workflowListTestIds
}; 
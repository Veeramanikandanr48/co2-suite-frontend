export const ANATOMY_LIST_TEST_IDS = {
  ANATOMY_LIST_ITEM: (id: number) => `anatomy-list-item-${id}`,
  ANATOMY_LIST_CONTAINER: 'anatomy-list-container',
  ANATOMY_NAME: (id: number) => `anatomy-name-${id}`,
  ANATOMY_PLANE_COUNT: (id: number) => `anatomy-plane-count-${id}`,
  ANATOMY_CHECKBOX: (id: number) => `anatomy-checkbox-${id}`
} as const; 
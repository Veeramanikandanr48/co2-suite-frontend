export const DS_CARD = 'card-base' as const;

export const DS_PAGE_CONTAINER = 'page-container' as const;

export const DS_PAGE_TITLE = 'page-title' as const;

export const DS_SECTION_TITLE = 'section-title' as const;

export const DS_KPI_LABEL = 'kpi-label' as const;

export const DS_KPI_VALUE = 'kpi-value' as const;

export const DS_BTN_PRIMARY = 'bg-primary hover:bg-primary/90 text-primary-foreground font-medium' as const;

export const DS_BTN_DANGER = 'text-negative-600 hover:bg-negative-50' as const;

export const DS_FORM_LABEL = 'text-sm font-medium text-foreground' as const;

export const DS_BORDER = 'border-border' as const;

export const DS_BADGE = {
  positive: 'status-badge-positive',
  negative: 'status-badge-negative',
  warning: 'status-badge-warning',
} as const;

export const DS_STAT_ICON = {
  primary: 'stat-icon-primary',
  positive: 'stat-icon-positive',
  negative: 'stat-icon-negative',
  warning: 'stat-icon-warning',
} as const;

export const DS_TEXT = {
  primary: 'text-foreground',
  secondary: 'text-muted-foreground',
  muted: 'text-neutral-500',
  link: 'text-primary',
} as const;

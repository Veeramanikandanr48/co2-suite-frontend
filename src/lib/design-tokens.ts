/**
 * Design token constants.
 * Use these typed strings instead of raw hex values in JSX className props.
 * All values map directly to CSS custom properties defined in globals.css.
 */

/** Card surface: white bg, border, rounded, subtle shadow */
export const DS_CARD = 'bg-background border border-border rounded-2xl shadow-xs' as const;

/** Standard inner page background */
export const DS_PAGE_BG = 'bg-background-inner' as const;

/** Standard outer page background (slightly darker) */
export const DS_PAGE_BG_OUTER = 'bg-background-outer' as const;

/** Page-level title text */
export const DS_PAGE_TITLE = 'text-2xl font-bold text-header-primary tracking-tight' as const;

/** Section / card heading text */
export const DS_SECTION_TITLE = 'text-sm font-bold text-header-primary' as const;

/** KPI metric label — uppercase, small, muted */
export const DS_KPI_LABEL = 'text-[11px] font-bold text-header-secondary uppercase tracking-wider' as const;

/** KPI metric value — large, dark */
export const DS_KPI_VALUE = 'text-xl font-bold text-header-primary' as const;

/** Primary action button */
export const DS_BTN_PRIMARY = 'bg-primary hover:bg-primary-300 text-primary-foreground font-semibold' as const;

/** Destructive/danger action button */
export const DS_BTN_DANGER = 'text-negative-500 hover:bg-negative-50' as const;

/** Standard form label */
export const DS_FORM_LABEL = 'text-input-label font-medium text-sm' as const;

/** Standard border colour */
export const DS_BORDER = 'border-border' as const;

/** Status badge variant classes */
export const DS_BADGE = {
  positive: 'status-badge-positive',
  negative: 'status-badge-negative',
  warning: 'status-badge-warning',
} as const;

/** Stat icon container variants */
export const DS_STAT_ICON = {
  primary: 'stat-icon-primary',
  positive: 'stat-icon-positive',
  negative: 'stat-icon-negative',
  warning: 'stat-icon-warning',
} as const;

/** Muted text helpers */
export const DS_TEXT = {
  primary: 'text-header-primary',
  secondary: 'text-header-secondary',
  muted: 'text-neutral-950',
  link: 'text-primary',
} as const;

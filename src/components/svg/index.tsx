import { IconName } from '../../types/svg-icon';
import DashboardIcon from './dashboard-icon';
import UserManagementIcon from './user-access-management';
import ProbeIcon from './probe';
import PrintIcon from './print';


export const Icons: Record<
  IconName,
  React.FC<{ className?: string; stroke?: string }>
> = {
   "DashboardIcon" : DashboardIcon,
   "UserManagementIcon": UserManagementIcon,
   "JobManagementIcon": ProbeIcon,
   "SettingsIcon": PrintIcon,
}

export { default as Close } from './close';
export { default as PlusCircle } from './plus-circle';
export { default as Verified } from './verified';
export { default as NotVerified } from './not-verified';
export { default as Warning } from './warning';
export { default as WarningCircle } from './warning-circle';
export { default as Gear } from './gear';
export { default as Probe } from './probe';
export { default as Barcode } from './barcode';
export { default as Trash } from './trash';
export { default as Filter } from './filter';
export { default as Reset } from './reset';
export { default as Save } from './save';
export { default as Vector } from './vector';
export { default as Duplicate } from './duplicate';
export { default as Triangle } from './triangle';
export { default as WarningAlert } from './warning-alert';
export { default as WavyCircle } from './wavy-circle';
export { default as XCircle } from './x-circle';
export { default as NotificationIcon } from './notification';

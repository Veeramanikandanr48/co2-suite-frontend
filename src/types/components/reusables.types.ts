import { ColumnDef } from '@tanstack/react-table';

export interface ReusableTableProps<T extends { id: string | number }> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoadingMore: boolean;
  hasMore?: boolean;
  handleLoadMore: () => void;
  onRowClick?: (id: string | number) => void;
  tableHeight?: string;
  rowHeight?: string;
}

export interface ActivityNotRelevantModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Called when the user clicks "Ok" to confirm */
  onConfirm: () => void;
  /** Called when the user closes / cancels the modal */
  onCancel: () => void;
}

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
  resetTrigger?: number;
}

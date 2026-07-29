import React from 'react';
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

export interface NavTabButtonProps {
  isActive: boolean;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  className?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  className?: string;
}

export interface SectionCardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export interface StatusBadgeProps {
  status?: string | boolean;
  label?: string;
  variant?: 'active' | 'inactive' | 'success' | 'warning' | 'error' | 'neutral';
  className?: string;
}

export interface FormSelectFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
}

export interface FormInputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'alert' | 'success';
  read: boolean;
}

export interface HeaderProps {
  onOpenMobileSidebar?: () => void;
}

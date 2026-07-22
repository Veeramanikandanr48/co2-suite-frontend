import { AxiosResponse } from "axios";
import { ReactNode } from "react"
import { Subject, MongoAbility } from "@casl/ability"
import { EAdditionalFieldError } from "@/enums/base-enum";

interface LayoutProps {
  readonly children: ReactNode;
}

interface CustomAxiosResponse<T = unknown> extends AxiosResponse<T> {
  success: boolean;
  message: string;
  additionalContext: EAdditionalFieldError;
}

type SubheadingProps = {
  children: React.ReactNode;
  className?: string;
  'data-testid'?: string;
} & React.HTMLAttributes<HTMLDivElement>;

interface DeviceField {
  ipAddress: string
  port: number
  aeTitle: string
  name?: string
  description?: string
  id?: number
}

interface WarningDialogProps {
  title: string;
  message: string;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

interface DeleteDialogProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
}

interface DropdownOption {
  id: number;
  label: string;
}

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject' | 'download';
type AppAbility = MongoAbility<[Actions, string]>;



export type {
  Actions,
  AppAbility,
  LayoutProps,
  CustomAxiosResponse,
  DeviceField,
  SubheadingProps,
  WarningDialogProps,
  DeleteDialogProps,
  DropdownOption
};
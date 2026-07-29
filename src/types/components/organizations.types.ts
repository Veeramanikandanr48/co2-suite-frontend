import { ColumnDef } from '@tanstack/react-table';
import {
  AddMemberFormState,
  FacilityFormState,
  FacilityItem,
  TableOrgUser,
} from '@/types/organizations';

export interface OrgDialogsProps {
  orgName: string;
  isDeleteOpen: boolean;
  setIsDeleteOpen: (open: boolean) => void;
  isSubmitting: boolean;
  onDeactivate: () => void;

  isAddMemberOpen: boolean;
  setIsAddMemberOpen: (open: boolean) => void;
  isAddingMember: boolean;
  addMemberForm: AddMemberFormState;
  setAddMemberForm: React.Dispatch<React.SetStateAction<AddMemberFormState>>;
  onAddMemberSubmit: (e: React.FormEvent) => void;

  isAddFacilityOpen: boolean;
  setIsAddFacilityOpen: (open: boolean) => void;
  editingFacility: any | null;
  facilityForm: FacilityFormState;
  setFacilityForm: React.Dispatch<React.SetStateAction<FacilityFormState>>;
  isSavingFacility: boolean;
  onSaveFacility: (e: React.FormEvent) => void;

  deletingFacility: any | null;
  setDeletingFacility: (fac: any | null) => void;
  onDeleteFacilityConfirm: () => void;
}

export interface OrgAddMemberDialogProps {
  orgName: string;
  isAddMemberOpen: boolean;
  setIsAddMemberOpen: (open: boolean) => void;
  addMemberForm: AddMemberFormState;
  setAddMemberForm: React.Dispatch<React.SetStateAction<AddMemberFormState>>;
  isAddingMember: boolean;
  onAddMember: (e: React.FormEvent) => void;
}

export interface FacilityDialogsProps {
  orgName: string;
  isAddFacilityOpen: boolean;
  setIsAddFacilityOpen: (open: boolean) => void;
  editingFacility: any | null;
  facilityForm: FacilityFormState;
  setFacilityForm: React.Dispatch<React.SetStateAction<FacilityFormState>>;
  isSavingFacility: boolean;
  onSaveFacility: (e: React.FormEvent) => void;
  deletingFacility: any | null;
  setDeletingFacility: (fac: any | null) => void;
  onDeleteFacilityConfirm: () => void;
}

export interface OrgFacilitiesTabProps {
  facilities: FacilityItem[];
  filteredFacilities: FacilityItem[];
  facilitiesLoading: boolean;
  facilitySearch: string;
  setFacilitySearch: (search: string) => void;
  canEdit: boolean;
  orgName: string;
  onOpenAddFacility: () => void;
  onOpenEditFacility: (fac: FacilityItem) => void;
  onDeleteFacilityConfirmOpen: (fac: FacilityItem) => void;
}

export interface OrgMembersTabProps {
  userTableData: TableOrgUser[];
  userColumns: ColumnDef<TableOrgUser>[];
  userTotalCount: number;
  userIsLoadingMore: boolean;
  userHasMore: boolean;
  setUserSearch: (search: string) => void;
  userLoadMore: () => void;
  canEdit: boolean;
  onAddMemberOpen: () => void;
}

export interface CreateOrgUserColumnsParams {
  canManageMembers: boolean;
  onToggleStatus: (userId: number, currentStatus: boolean) => void;
}

import {
  Organization,
  EditOrganizationPayload,
  OnboardOrganizationPayload,
} from '@/types/organizations';
import { Service, OrganizationService } from '@/types/services';

export interface OrgOverviewTabProps {
  orgDetails: Organization;
  isEditing: boolean;
  isSubmitting: boolean;
  editForm: EditOrganizationPayload;
  setEditForm: React.Dispatch<React.SetStateAction<EditOrganizationPayload>>;
  onSave: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
}

export interface OrgOverviewEditFormProps {
  editForm: EditOrganizationPayload;
  setEditForm: React.Dispatch<React.SetStateAction<EditOrganizationPayload>>;
  isSubmitting: boolean;
  onSave: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
}

export interface OrgHeaderProps {
  orgDetails: Organization;
  userTotalCount: number;
  isSuperAdmin: boolean;
  canEdit: boolean;
  isEditing: boolean;
  isSubmitting: boolean;
  onEditToggle: () => void;
  onSave: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
  onDeactivateOpen: () => void;
  onBack: () => void;
}

export interface OrgServicesTabProps {
  allServices: Service[];
  orgServices: OrganizationService[];
  subscribedServiceIds: Set<number>;
  servicesLoading: boolean;
  isSuperAdmin: boolean;
  assigningServiceId: number | null;
  removingServiceId: number | null;
  onRefresh: () => void;
  onAssignService: (service: Service) => void;
  onRemoveService: (service: Service) => void;
}

export interface OrgOnboardDialogProps {
  isOnboardOpen: boolean;
  setIsOnboardOpen: (open: boolean) => void;
  onboardForm: OnboardOrganizationPayload;
  setOnboardForm: React.Dispatch<React.SetStateAction<OnboardOrganizationPayload>>;
  isSubmitting: boolean;
  onOnboardSubmit: (e: React.FormEvent) => void;
}

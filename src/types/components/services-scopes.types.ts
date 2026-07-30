import { ServiceScopeItem } from '@/types/services';
import {
  Scope3CategoryType,
  InventoryItem,
  EditModalItem,
} from '@/types/inventory';

export interface ServiceConfig {
  name: string;
  tag: string;
  daysLeft: number;
}

export interface ServiceContextValue {
  code: string;
  currentConfig: ServiceConfig;
  scopeItems: ServiceScopeItem[];
  loadingScopes: boolean;
  groupedScopes: Record<string, ServiceScopeItem[]>;
  openScopes: Record<string, boolean>;
  toggleScope: (scopeName: string) => void;
}

export interface ServiceSidebarProps {
  currentConfig: ServiceConfig;
  loadingScopes: boolean;
  groupedScopes: Record<string, ServiceScopeItem[]>;
  openScopes: Record<string, boolean>;
  toggleScope: (scopeName: string) => void;
}

export interface ServiceCardProps {
  service: import('@/types/services').Service;
  isSubscribed?: boolean;
  showControls?: boolean;
  isAssigning?: boolean;
  isRemoving?: boolean;
  onAssign?: (service: import('@/types/services').Service) => void;
  onRemove?: (service: import('@/types/services').Service) => void;
}

export interface Scope1InventorySourceCardProps {
  facility: string;
  setFacility: (v: string) => void;
  dbFacilities: { id: number | string; name: string }[];
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  proofFile: File | null;
  setProofFile: (f: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export interface Scope2InventorySourceCardProps {
  facility: string;
  setFacility: (v: string) => void;
  dbFacilities: { id: number | string; name: string }[];
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  proofFile: File | null;
  setProofFile: (f: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export interface Scope3EntryFormFieldsProps {
  category: Scope3CategoryType;
  activeSubTab: string;
  efSource: string;
  setEfSource: (v: string) => void;
  availableSources: string[];
  factorVersion: string;
  setFactorVersion: (v: string) => void;
  availableVersions: string[];
  materialProduct: string;
  setMaterialProduct: (v: string) => void;
  dbFactors: any[];
  activityOption: string;
  setActivityOption: (v: string) => void;
  typeOption: string;
  setTypeOption: (v: string) => void;
  sizeOption: string;
  setSizeOption: (v: string) => void;
  distance: string;
  setDistance: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  travelOption: string;
  setTravelOption: (v: string) => void;
  peopleCount: string;
  setPeopleCount: (v: string) => void;
  fuelType: string;
  setFuelType: (v: string) => void;
  sourceOption: string;
  setSourceOption: (v: string) => void;
  wasteType: string;
  setWasteType: (v: string) => void;
  treatmentOption: string;
  setTreatmentOption: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  inventoryName: string;
  setInventoryName: (v: string) => void;
  dataAcquisitionMethod: string;
  setDataAcquisitionMethod: (v: string) => void;
  investeeScope1: string;
  setInvesteeScope1: (v: string) => void;
  investeeScope2: string;
  setInvesteeScope2: (v: string) => void;
  equityShare: string;
  setEquityShare: (v: string) => void;
}

export interface Scope3TravelSubTabsProps {
  activeSubTab: 'Flight' | 'Taxi' | 'Sea' | 'Land' | 'Hotel';
  setActiveSubTab: (v: 'Flight' | 'Taxi' | 'Sea' | 'Land' | 'Hotel') => void;
}

export interface EditInventoryModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSaved: () => void;
  dbFacilities?: any[];
}

export interface EditInventoryFormFieldsProps {
  item: InventoryItem;
  name: string;
  setName: (v: string) => void;
  facility: string;
  setFacility: (v: string) => void;
  facilities: { id: number | string; name: string }[];
  amount: string | number;
  setAmount: (v: string | number) => void;
  unit: string;
  setUnit: (v: string) => void;
  ef: string | number;
  setEf: (v: string | number) => void;
  efSource: string;
  setEfSource: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  approvalStatus: string;
  setApprovalStatus: (v: string) => void;
  comment: string;
  setComment: (v: string) => void;
  proofFile: File | null;
  setProofFile: (f: File | null) => void;
}

export interface CreateInventoryColumnsParams {
  canEdit: boolean;
  setEditingItem: (item: EditModalItem | null) => void;
  handleCopyItem: (item: InventoryItem) => void;
  handleDeleteItem: (id: number) => void;
  setSorting?: (field: string) => void;
}



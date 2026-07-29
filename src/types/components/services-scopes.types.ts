import {
  Scope3CategoryType,
  InventoryItem,
  EditModalItem,
} from '@/types/inventory';
import { ServiceScopeItem, Service } from '@/types/services';

export interface Scope3TableSectionProps {
  category: string;
  totalCount: number;
  isLoading: boolean;
  isNotRelevant: boolean;
  searchInput: string;
  setSearch: (v: string) => void;
  filterFacility: string;
  filterStatus: string;
  dbFacilities: any[];
  handleFilterUpdate: (updates: { year?: string; facility?: string; status?: string }) => void;
  setSelectedFacilityHeader: (v: string) => void;
  setSelectedYear: (v: string) => void;
  setAdditionalFilter: (v: any) => void;
  refetch: () => void;
  list: any[];
  canEdit: boolean;
  editingItem: EditModalItem | null;
  setEditingItem: (item: EditModalItem | null) => void;
  handleCopyItem: (item: any) => void;
  handleDeleteItem: (id: number) => void;
  setSorting: (field: string) => void;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
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

export interface ServiceSidebarProps {
  readonly currentConfig: {
    name: string;
    tag: string;
    daysLeft: number;
  };
  readonly activeTab: string;
  readonly setActiveTab: (tab: string) => void;
  readonly loadingScopes: boolean;
  readonly groupedScopes: Record<string, ServiceScopeItem[]>;
  readonly openScopes: Record<string, boolean>;
  readonly toggleScope: (scopeName: string) => void;
}

export interface ServiceCardProps {
  service: Service;
  isSubscribed?: boolean;
  showControls?: boolean;
  isAssigning?: boolean;
  isRemoving?: boolean;
  onAssign?: (service: Service) => void;
  onRemove?: (service: Service) => void;
}

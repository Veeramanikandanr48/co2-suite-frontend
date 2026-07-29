import { ColumnDef } from '@tanstack/react-table';
import {
  Scope1CategoryType,
  Scope2CategoryType,
  Scope3CategoryType,
  Scope2CategoryConfig,
  Scope3CategoryConfig,
  DBEmissionFactor,
  InventoryItem,
  EditModalItem,
} from '@/types/inventory';

export interface Scope1CalculationViewProps {
  category?: Scope1CategoryType;
}

export interface Scope1FormCardsProps {
  category: string;
  activityNotRelevant: boolean;
  canEdit: boolean;
  loadingEF: boolean;
  currentMatchingEF?: DBEmissionFactor;
  efSource: string;
  setEfSource: (v: string) => void;
  availableEfSources: string[];
  factorVersion: string;
  setFactorVersion: (v: string) => void;
  availableVersions: string[];
  fuelOrGasType: string;
  setFuelOrGasType: (v: string) => void;
  availableFuelOrGasTypes: string[];
  fugitiveType: 'filling' | 'leakage';
  setFugitiveType: (v: 'filling' | 'leakage') => void;
  leakagePercent: string;
  setLeakagePercent: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  inventoryName: string;
  setInventoryName: (v: string) => void;
  dataAcquisitionMethod: string;
  setDataAcquisitionMethod: (v: string) => void;
  facility: string;
  setFacility: (v: string) => void;
  dbFacilities: any[];
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  proofFile: File | null;
  setProofFile: (f: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  comment: string;
  setComment: (v: string) => void;
  approvalStatus: string;
  setApprovalStatus: (v: string) => void;
  saving: boolean;
  onSaveToDatabase: () => void;
}

export interface Scope1TableSectionProps {
  category: string;
  totalCount: number;
  isLoading: boolean;
  activityNotRelevant: boolean;
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

export interface Scope1EntryFormFieldsProps {
  category: string;
  fuelOrGasType: string;
  setFuelOrGasType: (v: string) => void;
  availableFuelOrGasTypes: string[];
  fugitiveType: 'filling' | 'leakage';
  setFugitiveType: (v: 'filling' | 'leakage') => void;
  leakagePercent: string;
  setLeakagePercent: (v: string) => void;
  amount: string;
  setAmount: (v: string) => void;
  inventoryName: string;
  setInventoryName: (v: string) => void;
  dataAcquisitionMethod: string;
  setDataAcquisitionMethod: (v: string) => void;
  currentMatchingEF?: DBEmissionFactor;
}

export interface Scope2CalculationViewProps {
  type?: Scope2CategoryType;
  category?: Scope2CategoryType | string;
}

export interface Scope2FormCardsProps {
  config: Scope2CategoryConfig;
  isNotRelevant: boolean;
  canEdit: boolean;
  loadingEF: boolean;
  currentMatchingEF?: DBEmissionFactor;
  efSource: string;
  setEfSource: (v: string) => void;
  availableEfSources: string[];
  factorVersion: string;
  setFactorVersion: (v: string) => void;
  availableVersions: string[];
  fuelOrGasType: string;
  setFuelOrGasType: (v: string) => void;
  availableFuelOrGasTypes: string[];
  energyAmount: string;
  setEnergyAmount: (v: string) => void;
  unit: string;
  setUnit: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  facility: string;
  setFacility: (v: string) => void;
  dbFacilities: any[];
  comment: string;
  setComment: (v: string) => void;
  approvalStatus: string;
  setApprovalStatus: (v: string) => void;
  submitting: boolean;
  onSaveToDatabase: () => void;
}

export interface Scope2TableSectionProps {
  isElectricity: boolean;
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

export interface Scope3CalculationViewProps {
  category?: Scope3CategoryType | string;
}

export interface Scope3FormCardsProps {
  category: Scope3CategoryType;
  activeSubTab: string;
  isNotRelevant: boolean;
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
  facility: string;
  setFacility: (v: string) => void;
  dbFacilities: any[];
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  proofFile: File | null;
  setProofFile: (f: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  comment: string;
  setComment: (v: string) => void;
  approvalStatus: string;
  setApprovalStatus: (v: string) => void;
  submitting: boolean;
  onSaveToDatabase: () => void;
}

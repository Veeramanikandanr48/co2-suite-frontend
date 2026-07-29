import { EmissionFactorItem } from '@/types/emission-factors';

export interface EmissionFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: Partial<EmissionFactorItem>) => void;
  initialData?: EmissionFactorItem | null;
  submitting?: boolean;
}

export interface CreateEmissionFactorColumnsProps {
  handleOpenEditModal: (item: EmissionFactorItem) => void;
  handleDelete: (id: string | number) => void;
  isDeletingId: string | number | null;
}

export interface EmissionFactorsToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  sourceFilter: string;
  setSourceFilter: (value: string) => void;
  availableCategories: string[];
  availableSources: string[];
  onClearFilters: () => void;
  onOpenCreateModal: () => void;
  totalCount: number;
}

export interface EmissionFactorsMetricsProps {
  totalFactorsCount: number;
  availableSourcesCount: number;
  availableCategoriesCount: number;
}

export interface FormulaBuilderFieldProps {
  formula: string;
  setFormula: (val: string) => void;
  unit: string;
  factor: number;
  fuelOrGasType: string;
}

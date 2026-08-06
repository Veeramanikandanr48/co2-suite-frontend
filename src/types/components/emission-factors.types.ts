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
  searchInput: string;
  setSearch: (v: string) => void;
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  filterSource: string;
  setFilterSource: (v: string) => void;
  setAdditionalFilter: (f: any) => void;
  refetch: () => void;
  onOpenCreateModal?: () => void;
}

export interface EmissionFactorsMetricsProps {
  metrics: {
    total: number;
    active: number;
    categoriesCount: number;
    sourcesCount: number;
  };
  onOpenCreateModal: () => void;
}

export interface FormulaBuilderFieldProps {
  formula: string;
  setFormula: (val: string) => void;
  unit: string;
  factor: number;
  fuelOrGasType: string;
}

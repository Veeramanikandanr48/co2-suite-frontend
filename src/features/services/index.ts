// Services feature barrel export

// Scope 1
export { Scope1CalculationView, type Scope1CategoryType } from './components/scope1/scope1-calculation-view';
export { Scope1FormCards } from './components/scope1/scope1-form-cards';
export { Scope1EntryFormFields } from './components/scope1/scope1-entry-form-fields';
export { Scope1InventorySourceCard } from './components/scope1/scope1-inventory-source-card';

// Scope 2
export { Scope2CalculationView, type Scope2CategoryType } from './components/scope2/scope2-calculation-view';
export { Scope2FormCards } from './components/scope2/scope2-form-cards';
export { Scope2InventorySourceCard } from './components/scope2/scope2-inventory-source-card';

// Scope 3
export { Scope3CalculationView, type Scope3CategoryType } from './components/scope3/scope3-calculation-view';
export { Scope3FormCards } from './components/scope3/scope3-form-cards';
export { Scope3EntryFormFields } from './components/scope3/scope3-entry-form-fields';
export { Scope3TravelSubTabs } from './components/scope3/scope3-travel-subtabs';

// Shared service components
export { ServiceCard } from './components/shared/service-card';
export { ServiceSidebar } from './components/shared/service-sidebar';
export { ServiceProvider } from './components/shared/service-context';
export { EditInventoryModal } from './components/shared/edit-inventory-modal';
export { createInventoryColumns } from './components/shared/inventory-table-columns';
export { ScopeTableSection } from './components/shared/scope-table-section';

// Hooks
export { useScopeCommon } from './hooks/use-scope-common';
export { useScope1Calculation } from './hooks/use-scope1-calculation';
export { useScope2Calculation } from './hooks/use-scope2-calculation';
export { useScope3Calculation } from './hooks/use-scope3-calculation';

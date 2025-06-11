import { ESelectedStatus, EFieldStatus, EWorkflowStatus } from "~/enums/workflow-customization-enum";

interface AddWorkflowDialogProps {
    headerLabel?: string;
    nameLabel?: string;
    namePlaceholder?: string;
    descriptionLabel?: string;
    descriptionPlaceholder?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmIcon?: React.ReactNode;
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    allWorkflowNames?: string[];
}

interface WorkflowData {
    id: number;
    name: string;
    description: string;
    createdBy: string;
    updatedAt: string;
}

interface WorkflowListResponse {
    listData: WorkflowData[];
    standardWorkflowListData: WorkflowData[];
    dataCount: number;
}

interface WorkflowListSidebarProps {
    standardWorkflows: WorkflowData[];
    customWorkflows: WorkflowData[];
    onSearch: (value: string) => void;
    onSort: (sorting: { field: string; order: number }) => void;
    sorting: { field: string; order: number };
    selectedWorkflow: WorkflowData | null;
    onSelectWorkflow: (workflow: WorkflowData) => void;
    onDuplicateEdit: (workflow: WorkflowData) => void;
}

interface WorkflowSectionProps {
    title: string;
    workflows: WorkflowListSidebarProps["standardWorkflows"];
    selectedWorkflow: WorkflowListSidebarProps["selectedWorkflow"];
    onSelectWorkflow: WorkflowListSidebarProps["onSelectWorkflow"];
    emptyMessage: string;
}

interface BaseMasterModel {
    id: number;
    name: string;
    mappingId: number;
    fieldStatus: EFieldStatus;
    selectedStatus: ESelectedStatus;
}

interface Annotation extends BaseMasterModel {
    isManual: boolean;
    acronym: string;
    error: string;
}

interface QualityCriterion extends BaseMasterModel {
    description: string;
}

interface DiagnosticView extends BaseMasterModel {
    noOfImageAcquisition: number;
    min: number;
    max: number;
    annotations: Annotation[];
    measurements: BaseMasterModel[];
    qualityCriterias: QualityCriterion[];
}

interface WorkflowMaster extends BaseMasterModel {
    diagnosticViews: DiagnosticView[];
}

interface WorkflowMasterPayload {
    workFlowName: string;
    workFlowDescription: string;
    anatomies: WorkflowMaster[];
}

interface DuplicateTemplateDialogProps {
    headerLabel?: string;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

interface WorkflowCardProps {
    heading: string;
    description: string;
    createdBy: string;
    lastUpdated: string;
    className?: string;
}

interface ActionTemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCancel: () => void;
    onConfirm: () => void;
    workflowMasters: WorkflowMaster[];
    setWorkflowMasters: (workflowMasters: WorkflowMaster[]) => void;
    selectedWorkflow: WorkflowData,
    actionTemplateStatus: EWorkflowStatus,
    activeAnatomyId: number,
    activeAnatomyName: string,
    setActiveAnatomyId: (activeAnatomyId: number) => void,
    setActiveAnatomyName: (activeAnatomyName: string) => void
}

export type {
    AddWorkflowDialogProps,
    WorkflowData,
    WorkflowListResponse,
    WorkflowListSidebarProps,
    WorkflowSectionProps,
    WorkflowMaster,
    DiagnosticView,
    QualityCriterion,
    Annotation,
    WorkflowCardProps,
    DuplicateTemplateDialogProps,
    ActionTemplateDialogProps,
    BaseMasterModel,
    WorkflowMasterPayload
}
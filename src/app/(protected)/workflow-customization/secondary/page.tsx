"use client"

import { PlusCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SubheadingDivider } from "~/components/reusables/form-fields/sub-heading";
import { Button } from "~/components/ui/button";
import AddWorkflowDialog from "~/components/workflow-customization/add-workflow";
import WorkflowListSidebar from "~/components/workflow-customization/workflow-list";
import { API_LIST } from "~/lib/api-list";
import { apiService } from "~/lib/api-service";
import { CustomAxiosResponse } from "~/types";
import { WorkflowData, WorkflowListResponse, WorkflowMaster, WorkflowMasterPayload } from "~/types/workflow";
import WorkflowCard from "~/components/workflow-customization/workflow-card";
import ActionTemplateDialog from "~/components/workflow-customization/action-template";
import { FormProvider, useForm } from "react-hook-form";
import { WorkflowConfigurationType } from "~/types/form";
import { WorkflowConfigurationSchema } from "~/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FORM_DEFAULT_VALUES } from "~/lib/variables";
import { ESelectedStatus, EWorkflowStatus } from "~/enums/workflow-customization-enum";
import AnatomyAccordion from "~/components/workflow-customization/anatomy-accordion";
import ProtocolCheckboxHelpers from "~/lib/protocol-checkbox-helpers";
import { Save } from "@/components/svg";
import { workflowCustomizationTestIds } from '@/components/test-ids/workflow-customization.ids';
import { UnSavedDialog } from "@/components/reusables/dialogs/unsaved.dialog";
import { useLoader } from "@/context/loader-context";

export default function Secondary() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [duplicateTemplateOpen, setDuplicateTemplateOpen] = useState(false);
    const [actionTemplateOpen, setActionTemplateOpen] = useState(false);
    const [standardWorkflows, setStandardWorkflows] = useState<WorkflowData[]>([]);
    const [customWorkflows, setCustomWorkflows] = useState<WorkflowData[]>([]);
    const [initialLoad, setInitialLoad] = useState(true);
    const [search, setSearch] = useState('');
    const [searchResetCounter, setSearchResetCounter] = useState(0);
    const [sorting, setSorting] = useState({ field: 'updatedAt', order: 0 });
    const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData>({} as WorkflowData);
    const [newWorkflow, setNewWorkflow] = useState<WorkflowData>({} as WorkflowData);
    const [workflowMasters, setWorkflowMasters] = useState<WorkflowMaster[]>([]);
    const [actionTemplateStatus, setActionTemplateStatus] = useState<EWorkflowStatus>(EWorkflowStatus.NEW);
    const [activeAnatomyId, setActiveAnatomyId] = useState<number>(0);
    const [activeAnatomyName, setActiveAnatomyName] = useState<string>("");
    const [openAccordionId, setOpenAccordionId] = useState<string>("");
    const [contextWorkFlowValue, setContextWorkFlowValue] = useState<string[]>([]);
    const [parentId, setParentId] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false)
    const { showLoader, hideLoader } = useLoader();

    const { getFilteredSelectedAnatomies } = ProtocolCheckboxHelpers;

    const form = useForm<WorkflowConfigurationType>({
        resolver: zodResolver(WorkflowConfigurationSchema),
        defaultValues: FORM_DEFAULT_VALUES.workflowConfiguration,
        mode: "onBlur",
    });

    const { formState, getValues, reset, trigger } = form;

    const fetchWorkflowList = useCallback(async (protocolId: number | undefined = undefined) => {
        try {
            setIsLoading(true)
            const response: CustomAxiosResponse<WorkflowListResponse> = await apiService.post(API_LIST.GET_ALL_WORKFLOWS, { searchInput: protocolId ? "" : search, sortField: sorting.field, sortOrder: sorting.order }, { params: { initialLoad: initialLoad, protocolId } });
            const { listData, standardWorkflowListData } = response?.data ?? {};
            if (response?.data) {
                setInitialLoad(false);
                setCustomWorkflows(listData);
                const uniqueWorkflowNames: string[] = listData?.map(workflow => workflow?.name?.toLowerCase());
                setContextWorkFlowValue(prev => [...prev, ...Array.from(new Set(uniqueWorkflowNames))]);

                if (initialLoad) {
                    const standardWorkflow: WorkflowData[] = standardWorkflowListData;
                    const firstStandardWorkflow: WorkflowData = standardWorkflow?.[0] ?? {} as WorkflowData;
                    setStandardWorkflows(standardWorkflow);
                    if (Object.keys(firstStandardWorkflow ?? {})?.length) {
                        getWorkflowById(firstStandardWorkflow?.id);
                        setSelectedWorkflow(firstStandardWorkflow ?? null);
                    }
                    const allWorkflowNames: string[] = [
                        ...(listData ?? []).map(workflow => workflow.name.toLowerCase()),
                        ...(standardWorkflowListData ?? []).map(workflow => workflow.name.toLowerCase())
                    ];
                    const uniqueWorkflowNames: string[] = Array.from(new Set(allWorkflowNames));
                    setContextWorkFlowValue(uniqueWorkflowNames);
                }
                if (protocolId) {
                    const workflow: WorkflowData = listData.find(workflow => workflow.id === protocolId) ?? {} as WorkflowData;
                    setSelectedWorkflow(workflow);
                    getWorkflowById(workflow?.id);
                    setSearchResetCounter(prev => prev + 1);
                }
            }
        } catch {
        } finally {
            setIsLoading(false)
        }
    }, [initialLoad, search, sorting, setContextWorkFlowValue]);

    const getWorkflowById = async (id: number, isDuplicate: boolean = false) => {
        try {

            setIsLoading(true)
            const response: CustomAxiosResponse<WorkflowMaster[]> = await apiService.getById(API_LIST.GET_WORKFLOW_BY_ID, id);
            if (response?.data) {
                setWorkflowMasters(response?.data);
                if (isDuplicate) {
                    const firstSelectedAnatomy: WorkflowMaster = response?.data?.find(anatomy => anatomy.selectedStatus === ESelectedStatus.SELECTED || anatomy.selectedStatus === ESelectedStatus.INTERMEDIATE) ?? {} as WorkflowMaster;
                    setActiveAnatomyId(firstSelectedAnatomy?.id);
                    setActiveAnatomyName(firstSelectedAnatomy?.name);
                }
            }
        }
        catch {
        } finally {
            setIsLoading(false)
        }
    }

    const getWorkMasters = async () => {
        try {
            setIsLoading(true)
            const response: CustomAxiosResponse<WorkflowMaster[]> = await apiService.get(API_LIST.GET_WORKFLOW_MASTER_DATA);
            if (response?.data) {
                setWorkflowMasters(response.data);
            }
        }
        catch {
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchWorkflowList();
    }, [fetchWorkflowList]);

    useEffect(() => {
      if (isLoading) {
        showLoader();
      } else {
        hideLoader();
      }
    }, [isLoading, showLoader, hideLoader]);

    const handleDuplicateEdit = (workflow: WorkflowData) => {
        setSelectedWorkflow(workflow);
        setDuplicateTemplateOpen(true);
        setWorkflowMasters([]);
    };

    const handleWorkflowSelection = (workflow: WorkflowData) => {
        setSelectedWorkflow(workflow);
        setOpenAccordionId("");
        getWorkflowById(workflow?.id);
    }

    const handleAccordionChange = (value: string) => {
        setOpenAccordionId(value);
    }

    const handleCreateConfirm = () => {
        setDialogOpen(false);
        if (actionTemplateStatus === EWorkflowStatus.DUPLICATE) {
            getWorkflowById(selectedWorkflow?.id, true);
            setParentId(selectedWorkflow?.id);
        } else {
            getWorkMasters();
        }
        const { name, description } = form.getValues();
        setNewWorkflow({ name, description: description ?? '', id: 0, createdBy: "", updatedAt: "" });
        setActionTemplateOpen(true);
    }

    const handleDuplicateTemplateConfirm = () => {
        setDuplicateTemplateOpen(false);
        reset({
            name: selectedWorkflow.name + " - Copy",
            description: selectedWorkflow.description,
            contextWorkFlowValue: contextWorkFlowValue
        });
        trigger();
        setActionTemplateStatus(EWorkflowStatus.DUPLICATE)
        setDialogOpen(true);
    }

    const handleWorkflowMaster = async (workflowMaster: WorkflowMasterPayload, id: number) => {
        let response: CustomAxiosResponse<{ protocolId: number }> | null = null;
        try {
            setIsLoading(true)
            if (actionTemplateStatus === EWorkflowStatus.EDIT) {
                response = await apiService.put(API_LIST.UPDATE_WORKFLOW, id, { data: workflowMaster }, { headers: { 'X-Skip-Toast': 'false' } });
            } else {
                response = await apiService.post(API_LIST.CREATE_WORKFLOW, { data: workflowMaster }, { headers: { 'X-Skip-Toast': 'false' } });
            }
            const { protocolId } = response?.data ?? {};
            if (protocolId) {
                fetchWorkflowList(protocolId);
            }
            reset({ ...FORM_DEFAULT_VALUES.workflowConfiguration, contextWorkFlowValue: contextWorkFlowValue });

        }
        catch {
            setActionTemplateOpen(true);
        } finally {
            setIsLoading(false)
        }
    }

    const handleActionTemplateConfirm = () => {
        const formData = getValues();
        const selectedAnatomies: WorkflowMaster[] = getFilteredSelectedAnatomies(workflowMasters);

        const payload: WorkflowMasterPayload = {
            workFlowName: formData.name,
            workFlowDescription: formData.description ?? '',
            anatomies: selectedAnatomies,
            ...(parentId ? { parentId } : {})
        };

        handleWorkflowMaster(payload, selectedWorkflow?.id);
        setActionTemplateOpen(false);
    };

    const handleActionTemplateCancel = () => {
        getWorkflowById(selectedWorkflow?.id);
        setActionTemplateStatus(EWorkflowStatus.NEW);
        setActionTemplateOpen(false);
        setNewWorkflow({ name: "", description: "", id: 0, createdBy: "", updatedAt: "" })
    }

    const handleAddDialogCancel = ()=> {
        getWorkflowById(selectedWorkflow?.id);
        setDialogOpen(false);
    }

    const handleAddWorkflow = () => {
        setActionTemplateStatus(EWorkflowStatus.NEW);
        form.reset({ ...FORM_DEFAULT_VALUES.workflowConfiguration, contextWorkFlowValue: contextWorkFlowValue });
        setDialogOpen(true);
        setParentId(0);
        setActiveAnatomyId(0);
        setActiveAnatomyName("");
        setWorkflowMasters([]);
    }

    const handleDuplicateTemplateCancel = () => {
        setDuplicateTemplateOpen(false);
        getWorkflowById(selectedWorkflow?.id);
    }
    
    return (
        <div data-testid={workflowCustomizationTestIds.page.container}>
        <SubheadingDivider>
        <div
    className="flex justify-between items-center"
    data-testid={workflowCustomizationTestIds.page.header.container}
  >
    <div>
      <p
        className="capitalize text-[16px] font-semibold text-gray-800"
        data-testid={workflowCustomizationTestIds.page.header.title}
      >
        Customization
      </p>
    </div>
                
    </div>
            </SubheadingDivider>
            <div className="flex justify-between items-center">
                <p className="text-sm text-neutral-400 font-semibold mt-1">
                    Workflow Customization
                </p>

                <Button
                    type="button"
                    onClick={handleAddWorkflow}
                    className="bg-primary-500 mt-2 !border-primary-500 hover:bg-primary-600 text-light-100 text-sm font-bold rounded-sm w-[190px] leading-[24px] px-[13px] py-2 flex items-center gap-2 justify-center"
                    data-testid={workflowCustomizationTestIds.page.header.addButton}
                >
                    <PlusCircle className="h-4 w-4" stroke="white" />
                    Add A Workflow
                </Button>
      </div>


            <div className="w-full h-[calc(100vh-180px)] bg-background-outer gap-1 rounded-xs flex mt-4" data-testid={workflowCustomizationTestIds.page.content.container}>
                <div className="w-[20%] bg-light-100" data-testid={workflowCustomizationTestIds.page.content.sidebar.container}>
                    <WorkflowListSidebar
                        standardWorkflows={standardWorkflows}
                        customWorkflows={customWorkflows}
                        onSearch={setSearch}
                        onSort={(e) => { setSorting(e) }}
                        sorting={sorting}
                        selectedWorkflow={selectedWorkflow}
                        onSelectWorkflow={handleWorkflowSelection}
                        onDuplicateEdit={handleDuplicateEdit}
                        searchResetCounter={searchResetCounter}
                    />
                </div>
                <div className="w-[80%] space-y-2" data-testid={workflowCustomizationTestIds.page.content.main.container}>
                    <WorkflowCard
                        heading={selectedWorkflow?.name}
                        description={selectedWorkflow?.description}
                        createdBy={selectedWorkflow?.createdBy}
                        lastUpdated={selectedWorkflow?.updatedAt}
                        className="w-full h-[27%]"
                        data-testid={workflowCustomizationTestIds.page.content.main.card}
                    />
                    <div className="w-full h-[72%] space-y-2 bg-light-100 p-4" data-testid={workflowCustomizationTestIds.page.content.main.anatomy.container}>
                        <div className="flex flex-col gap-2 h-[calc(100%-47px)] mt-1 overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400" data-testid={workflowCustomizationTestIds.page.content.main.anatomy.list}>
                            {workflowMasters
                                .filter(anatomy => anatomy.selectedStatus !== ESelectedStatus.UNSELECTED)
                                .map(anatomy => (
                                    <AnatomyAccordion
                                        key={anatomy.id}
                                        anatomy={anatomy}
                                        isOpen={openAccordionId === String(anatomy.id)}
                                        onValueChange={handleAccordionChange}
                                        data-testid={workflowCustomizationTestIds.page.content.main.anatomy.item(anatomy.id)}
                                    />
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            <FormProvider {...form}>
                <AddWorkflowDialog
                    open={dialogOpen}
                    onConfirm={handleCreateConfirm}
                    headerLabel={`${actionTemplateStatus === EWorkflowStatus.DUPLICATE ? "Rename New Workflow" : "New Hospital Custom Workflows"} `}
                    nameLabel={"Workflow Name *"}
                    namePlaceholder="type here..."
                    descriptionLabel={ "Description"}
                    descriptionPlaceholder="type here..."
                    confirmLabel={`${actionTemplateStatus === EWorkflowStatus.DUPLICATE ? "Save" : "Create"}`}
                    confirmIcon={actionTemplateStatus === EWorkflowStatus.DUPLICATE ?
                        <Save className="h-4 w-4" stroke={formState.isValid ? "white" : "var(--neutral-900)"} /> :
                        <PlusCircle className="h-4 w-4" stroke={formState.isValid ? "white" : "var(--neutral-900)"} />
                    }
                    onCancel={handleAddDialogCancel}
                    data-testid={workflowCustomizationTestIds.page.dialogs.addWorkflow.container}
                />
            </FormProvider>

            <UnSavedDialog
              open={duplicateTemplateOpen}
              title="Duplicate Workflow?"
              message="This action will create an exact copy."
              onConfirm={handleDuplicateTemplateConfirm}
              onCancel={handleDuplicateTemplateCancel}
            />

            <ActionTemplateDialog
                open={actionTemplateOpen}
                onOpenChange={setActionTemplateOpen}
                onConfirm={handleActionTemplateConfirm}
                onCancel={handleActionTemplateCancel}
                workflowMasters={workflowMasters}
                setWorkflowMasters={setWorkflowMasters}
                selectedWorkflow={newWorkflow}
                actionTemplateStatus={actionTemplateStatus}
                activeAnatomyId={activeAnatomyId}
                activeAnatomyName={activeAnatomyName}
                setActiveAnatomyId={setActiveAnatomyId}
                setActiveAnatomyName={setActiveAnatomyName}
                data-testid={workflowCustomizationTestIds.page.dialogs.actionTemplate.container}
            />
        </div>
    )
}
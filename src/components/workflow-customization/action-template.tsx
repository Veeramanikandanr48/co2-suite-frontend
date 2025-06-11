"use client"
import { Dialog, DialogContent, DialogTitle, DialogOverlay, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { ActionTemplateDialogProps, DiagnosticView, WorkflowMaster } from "~/types/workflow"
import { Button } from "../ui/button"
import WorkflowCard from "./workflow-card"
import { Save, WarningAlert } from "../svg"
import { useState, useMemo } from "react"
import { ESelectedStatus } from "~/enums/workflow-customization-enum"
import AnatomyList from "./anatomy-list"
import AnatomyDetailView from "./anatomy-detail-view"
import ProtocolCheckboxHelpers from "../../lib/protocol-checkbox-helpers"
import { showWarningToast } from "../toast-variant"
import { X } from "lucide-react"
import { workflowTestIds } from '../test-ids/workflow.ids'
import { ANATOMY_LIST_TEST_IDS } from '../test-ids/anatomy-list.ids'

export default function ActionTemplateDialog({
    open,
    onOpenChange,
    onConfirm,
    onCancel,
    workflowMasters,
    setWorkflowMasters,
    selectedWorkflow,
    activeAnatomyId,
    activeAnatomyName,
    setActiveAnatomyId,
    setActiveAnatomyName
}: Readonly<ActionTemplateDialogProps>) {

    const [showDialog, setShowDialog] = useState(false);
    const {
        selectOrUnselectAllInAnatomy,
        setAnatomyAndChildrenStatus,
        setDiagnosticViewAndChildrenStatus,
        updateChildStatus,
        updateViewStatus,
        computeAnatomyTriState,
        updateViewsWithAnnotationChange,
        updateDiagnosticViewsWithAnnotationErrors,
        incrementImageAcquisition,
        decrementImageAcquisition
    } = ProtocolCheckboxHelpers;
    const isSaveButtonDisabled: boolean = useMemo(() => {
        return workflowMasters.every(anatomy => anatomy.selectedStatus === ESelectedStatus.UNSELECTED);
    }, [workflowMasters]);


    const handleAnatomyToggle = (id: number) => {
        if(id !== activeAnatomyId) {
            handleSelectAnatomy(id, false, true);
        } else {
            handleSelectDeselectAnatomy(id);
        }
    };

    const handleSelectDeselectAnatomy = (id: number) => {
        const updatedWorkflowMasters = workflowMasters?.map((anatomy: WorkflowMaster) => {
            if (anatomy.id === id) {
                if (anatomy.selectedStatus === ESelectedStatus.SELECTED) {
                    return selectOrUnselectAllInAnatomy(anatomy, ESelectedStatus.UNSELECTED);
                } else {
                    return selectOrUnselectAllInAnatomy(anatomy, ESelectedStatus.SELECTED);
                }
            }
            return anatomy;
        });
        setWorkflowMasters(updatedWorkflowMasters);
    }

    const handleCheckboxChange = (checked: boolean, type: string, diagnosticViewId: number, childId?: number) => {
        let updatedWorkflowMasters = workflowMasters?.map(anatomy => {
            if (anatomy.id !== activeAnatomyId) return anatomy;

            if (type === "anatomy") {
                return setAnatomyAndChildrenStatus(anatomy, checked ? ESelectedStatus.SELECTED : ESelectedStatus.UNSELECTED);
            }

            return {
                ...anatomy,
                diagnosticViews: anatomy.diagnosticViews.map(view => {
                    if (view.id !== diagnosticViewId) return view;

                    if (type === "view") {
                        return setDiagnosticViewAndChildrenStatus(view, checked ? ESelectedStatus.SELECTED : ESelectedStatus.UNSELECTED);
                    }

                    const updatedView = updateChildStatus(view, type, childId!, checked);
                    return updateViewStatus(updatedView);
                })
            };
        });

        updatedWorkflowMasters = updatedWorkflowMasters?.map(anatomy => {
            if (anatomy.id !== activeAnatomyId) return anatomy;
            return {
                ...anatomy,
                selectedStatus: computeAnatomyTriState(anatomy.diagnosticViews)
            };
        });
        setWorkflowMasters(updatedWorkflowMasters);
    };

    const handleOnConfirm = () => {
        handleSelectAnatomy(activeAnatomyId, true);
    }

    const handleSelectAnatomy = (id: number, isConfirmClicked: boolean = false, isAnatomyToggle: boolean = false) => {

        if(id === activeAnatomyId && !isConfirmClicked) {
            return;
        }

        const currentAnatomy = workflowMasters.find(anatomy => anatomy.id === activeAnatomyId);
        const selectedDiagnosticViews: DiagnosticView[] = currentAnatomy?.diagnosticViews?.filter(
            view => view.selectedStatus === ESelectedStatus.SELECTED
        ) || [];
        const getAnatomyName = workflowMasters.find(anatomy => anatomy.id === id)?.name;

        if (selectedDiagnosticViews.length === 0 && !isConfirmClicked && !isAnatomyToggle) {
            setActiveAnatomyId(id);
            setActiveAnatomyName(getAnatomyName ?? "");
            return;
        }

        const allViewsHaveQualityCriteria = selectedDiagnosticViews.every(dv =>
            dv.qualityCriterias?.some(qc => qc.selectedStatus === ESelectedStatus.SELECTED)
        );

        const hasInvalidAnnotationsRef: { value: boolean } = { value: false };
        const updatedWorkflowMasters: WorkflowMaster[] = workflowMasters.map(anatomy => {
            if (anatomy.id !== activeAnatomyId) return anatomy;

            const updatedDiagnosticViews = updateDiagnosticViewsWithAnnotationErrors(
                anatomy.diagnosticViews,
                hasInvalidAnnotationsRef
            );
            return { ...anatomy, diagnosticViews: updatedDiagnosticViews };
        });

        if (!allViewsHaveQualityCriteria && hasInvalidAnnotationsRef.value) {
            setWorkflowMasters(updatedWorkflowMasters);
            showWarningToast("Please select at least one structural criteria for each diagnostic view and ensure all selected annotations have valid acronyms.");
            return;
        }

        if (!allViewsHaveQualityCriteria) {
            showWarningToast("Please select at least one structural criteria for each selected diagnostic view.");
            return;
        }

        if (hasInvalidAnnotationsRef.value) {
            setWorkflowMasters(updatedWorkflowMasters);
            showWarningToast("Please validate all selected annotation acronyms.");
            return;
        }

        if (isConfirmClicked) {
            onConfirm();
        } else if (isAnatomyToggle) {
            handleSelectDeselectAnatomy(id);
            setActiveAnatomyId(id);
            setActiveAnatomyName(getAnatomyName ?? "");
        } else {
            setActiveAnatomyId(id);
            setActiveAnatomyName(getAnatomyName ?? "");
        }
    };

    const handleAnnotationAcronymChange = (
        diagnosticViewId: number,
        annotationId: number,
        value: string
    ) => {
        const updatedWorkflowMasters = workflowMasters.map(anatomy =>
            updateAnatomy(anatomy, activeAnatomyId, diagnosticViewId, annotationId, value)
        );

        setWorkflowMasters(updatedWorkflowMasters);
    };

    const handleIncrementImageAcquisition = (diagnosticViewId: number) => {
        const updatedWorkflowMasters: WorkflowMaster[] = workflowMasters.map(anatomy => {
            if (anatomy.id !== activeAnatomyId) return anatomy;
            return {
                ...anatomy,
                diagnosticViews: anatomy.diagnosticViews?.map(view => 
                    view.id === diagnosticViewId 
                        ? incrementImageAcquisition(view)
                        : view
                )
            };
        });
        setWorkflowMasters(updatedWorkflowMasters);
    };

    const handleDecrementImageAcquisition = (diagnosticViewId: number) => {
        const updatedWorkflowMasters: WorkflowMaster[] = workflowMasters?.map(anatomy => {
            if (anatomy.id !== activeAnatomyId) return anatomy;
            return {
                ...anatomy,
                diagnosticViews: anatomy.diagnosticViews.map(view => 
                    view.id === diagnosticViewId 
                        ? decrementImageAcquisition(view)
                        : view
                )
            };
        });
        setWorkflowMasters(updatedWorkflowMasters);
    };

    const updateAnatomy = (
        anatomy: WorkflowMaster,
        activeAnatomyId: number,
        diagnosticViewId: number,
        annotationId: number,
        value: string
    ): WorkflowMaster => {
        if (anatomy.id !== activeAnatomyId) return anatomy;
        const updatedViews = updateViewsWithAnnotationChange(anatomy.diagnosticViews, diagnosticViewId, annotationId, value);
        return { ...anatomy, diagnosticViews: updatedViews };
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange} data-testid={workflowTestIds.actionTemplateDialog}>
                <DialogOverlay className="fixed inset-0 bg-black/45 backdrop-blur-3xs" data-testid={workflowTestIds.dialogOverlay} />
                <DialogTitle className="" data-testid={workflowTestIds.dialogTitle}> </DialogTitle>
                <DialogContent className="max-w-[99%] h-[93vh] bg-background-outer mt-8 p-0 gap-0 rounded-none" data-testid={workflowTestIds.dialogContent}>
                    <div className="flex flex-col gap-4 p-3">
                        <div className="flex gap-4 w-full">
                            <div className="w-[25vw] h-[81vh] bg-light-100 border-[1px] border-neutral-100" data-testid={workflowTestIds.anatomySection}>
                                <div className="w-full h-[6%] bg-light-100 flex items-center">
                                    <p className="text-sm font-normal text-neutral-400 py-2 px-4 leading-[20px] capitalize" data-testid={workflowTestIds.anatomy.title}>ANATOMY LIST</p>
                                </div>
                                <AnatomyList
                                    anatomies={workflowMasters}
                                    activeAnatomyId={activeAnatomyId}
                                    onToggle={handleAnatomyToggle}
                                    onSelect={handleSelectAnatomy}
                                    data-testid={ANATOMY_LIST_TEST_IDS.ANATOMY_LIST_CONTAINER}
                                />
                            </div>
                            <div className="flex flex-col gap-2 w-[72vw] h-[88vh]" data-testid={workflowTestIds.workflowSection}>
                                <div className="w-full h-[25%] max-h-[25%]">
                                    <WorkflowCard
                                        heading={selectedWorkflow?.name}
                                        description={selectedWorkflow?.description}
                                        createdBy={selectedWorkflow?.createdBy}
                                        lastUpdated={selectedWorkflow?.updatedAt}
                                        className="w-full h-full border-[1px] border-neutral-100"
                                        data-testid={workflowTestIds.workflowCard.container}
                                    />
                                </div>
                                <div className={`flex flex-col gap-2 w-full ${activeAnatomyName ? 'h-[70%]' : 'h-[73%]'}`} data-testid={workflowTestIds.detailSection}>
                                    {
                                        activeAnatomyName && (
                                            <div className="w-full h-[10%] bg-light-100 border-[1px] border-neutral-100 flex items-center">
                                                <p className="text-lg font-black text-neutral-400 px-2 leading-[20px]">{activeAnatomyName}</p>
                                            </div>
                                        )
                                    }
                                    <div className="w-full h-[100%] pb-2 bg-light-100 border-[1px] border-neutral-100 rounded-xs overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                                        <AnatomyDetailView
                                            activeAnatomyId={activeAnatomyId}
                                            workflowMasters={workflowMasters}
                                            onCheckboxChange={handleCheckboxChange}
                                            handleAcronymChange={handleAnnotationAcronymChange}
                                            onIncrementImageAcquisition={handleIncrementImageAcquisition}
                                            onDecrementImageAcquisition={handleDecrementImageAcquisition}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="h-[54px] absolute w-full bottom-0 bg-light-100 shadow-[0px_-5px_10px_0px_rgba(0,0,0,0.2)]" data-testid={workflowTestIds.dialogFooter}>
                        <div className="flex justify-end gap-8 px-4 py-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setShowDialog(true)} 
                                className="text-sm rounded-sm leading-[1.5rem] font-bold w-[8.4rem] gap-2"
                                data-testid={workflowTestIds.buttons.exit}
                            >
                                Exit
                            </Button>
                            <Button 
                                onClick={isSaveButtonDisabled ? undefined : handleOnConfirm} 
                                data-testid={workflowTestIds.buttons.save}
                                disabled={isSaveButtonDisabled} 
                                className={`bg-primary-500 !border-primary-500 text-white text-sm rounded-sm leading-[1.5rem] font-bold flex items-center justify-center w-[8.4rem] gap-2 ${isSaveButtonDisabled && 'bg-neutral-400 text-neutral-900 cursor-not-allowed !border-none'}`}
                            >
                                <Save className="w-4 h-4" stroke={`${isSaveButtonDisabled ? "#000" : "#FFFFFF"}`} />
                                Save
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showDialog}>
                <DialogOverlay className="fixed inset-0 bg-black/45" />
                <DialogContent className="sm:max-w-[400px] p-6">
                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity focus:outline-none">
                        <X className="h-5 w-5" onClick={() => setShowDialog(false)} />
                    </DialogClose>
                    <div className="text-center flex flex-col px-6 pt-6">
                        <DialogTitle className="flex justify-center items-center text-medium gap-2">
                            <WarningAlert />
                            <p className="text-base text-modal-heading font-medium">
                              Unsaved Changes
                            </p>
                        </DialogTitle>
                        <div className="mt-2">
                            <p className="text-base text-modal-content font-normal">
                              Exiting now will discard all your changes.
                            </p>
                            <p className="text-center text-base text-modal-content font-normal mt-[10px]">Do you still want to continue?</p>

                        </div>
                        <div className="mt-6 flex justify-center gap-5">
                            <Button
                                onClick={() => setShowDialog(false)}
                                data-testid={workflowTestIds.buttons.exitDialogSave}
                                className={`w-[8.15rem] h-[2.4rem] px-6 py-3 rounded-sm border border-header-secondary text-header-secondary bg-white`}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                data-testid={workflowTestIds.buttons.dontSave}
                                onClick={() => {
                                    onCancel();
                                    setShowDialog(false)
                                }}
                                className="w-[8.15rem] h-[2.4rem] px-6 py-3 rounded-sm border border-primary-500 text-primary-500 bg-white"
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
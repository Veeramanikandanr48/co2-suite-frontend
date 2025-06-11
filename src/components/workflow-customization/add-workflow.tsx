"use client"
import { Dialog, DialogContent, DialogTitle, DialogOverlay } from "@/components/ui/dialog"
import { Close, PlusCircle } from "../svg"
import { AddWorkflowDialogProps } from "~/types/workflow"
import { Button } from "../ui/button"
import FormInput from "../reusables/form-fields/form-input"
import { useFormContext } from "react-hook-form"
import { WorkflowConfigurationType } from "~/types/form"
import { workflowTestIds } from '../test-ids/workflow.ids';

export default function AddWorkflowDialog({
    open,
    onConfirm,
    onCancel,
    headerLabel = "New Hospital Custom Workflows",
    nameLabel = "Workflow Name *",
    namePlaceholder = "type here...",
    descriptionLabel = "Description",
    descriptionPlaceholder = "type here...",
    confirmLabel = "Create",
    cancelLabel = "Cancel",
    confirmIcon = <PlusCircle className="h-4 w-4" data-testid={workflowTestIds.addWorkflow.plusCircleIcon}/>,
}: Readonly<AddWorkflowDialogProps>) {

    const { formState, handleSubmit } = useFormContext<WorkflowConfigurationType>();

    return (
        <Dialog open={open} data-testid={workflowTestIds.addWorkflow.dialog}>
            <DialogOverlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-3xs" data-testid={workflowTestIds.addWorkflow.overlay} />
            <DialogContent className="sm:max-w-[553px] p-0 gap-0" data-testid={workflowTestIds.addWorkflow.content}>
                <form onSubmit={handleSubmit(onConfirm)} data-testid={workflowTestIds.addWorkflow.form}>
                    <DialogTitle data-testid={workflowTestIds.addWorkflow.title}> </DialogTitle>
                    <div className="flex justify-between items-center px-4 pt-3" data-testid={workflowTestIds.addWorkflow.header}>
                        <p className="text-base font-bold text-neutral-400 leading-[20px]">{headerLabel}</p>
                        <button type="button" onClick={onCancel} className="text-gray-700 hover:text-gray-500" data-testid={workflowTestIds.addWorkflow.closeButton}>
                            <Close className="h-6 w-6" stroke="var(--neutral-800)" data-testid={workflowTestIds.addWorkflow.closeIcon} />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2 py-4 px-4">
                        <div className="px-4">
                            <FormInput
                                name="name"
                                label={nameLabel}
                                placeholder={namePlaceholder}
                                className="w-full"
                                labelClassName="text-[10px] font-semibold text-neutral-500 mb-1 leading-[14px]"
                                vertical
                                data-testid={workflowTestIds.addWorkflow.nameInput}
                                autoFocus
                            />
                        </div>
                        <div className="px-4">
                            <FormInput
                                name="description"
                                label={descriptionLabel}
                                placeholder={descriptionPlaceholder}
                                className="w-full"
                                labelClassName="text-[10px] font-semibold text-neutral-500 mb-1 leading-[14px]"
                                vertical
                                data-testid={workflowTestIds.addWorkflow.descriptionInput}
                            />
                        </div>
                    </div>

                    <div className="flex justify-center gap-12 p-4 border-t-[1px] border-neutral-400">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="flex items-center rounded-sm gap-2 border-blue-600 text-blue-600 w-[120px]"
                            data-testid={workflowTestIds.addWorkflow.cancelButton}
                        >
                            <Close className="h-4 w-4" data-testid={workflowTestIds.addWorkflow.closeIcon} />
                            {cancelLabel}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!formState.isValid}
                            className={`flex items-center rounded-sm text-bold gap-2 bg-primary-500 !border-primary-500 text-white w-[120px] ${!formState.isValid ? 'bg-neutral-400 text-neutral-900 cursor-not-allowed !border-none' : ''}`}
                            data-testid={workflowTestIds.addWorkflow.confirmButton}
                        >
                            {confirmIcon}
                            {confirmLabel}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

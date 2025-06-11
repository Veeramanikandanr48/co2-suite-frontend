import { Annotation, QualityCriterion, DiagnosticView, WorkflowMaster, BaseMasterModel } from "~/types/workflow";
import { ESelectedStatus } from "~/enums/workflow-customization-enum";
import { AnnotationAcronymSchema } from "~/lib/schemas";
import { ZodError } from "zod";


/**
 * Helper class for handling checkbox operations on workflow masters
 */
class ProtocolCheckboxHelpers {

    /**
     * Select or unselect all in anatomy
     * @param anatomy - The anatomy to select or unselect all in
     * @param selectedStatus - The status to set the selected status to
     * @returns The updated anatomy
     */
    static selectOrUnselectAllInAnatomy(anatomy: WorkflowMaster, selectedStatus: ESelectedStatus): WorkflowMaster {
        return {
            ...anatomy,
            selectedStatus: selectedStatus,
            diagnosticViews: anatomy.diagnosticViews.map((view: DiagnosticView) => ({
                ...view,
                selectedStatus: selectedStatus,
                qualityCriterias: view.qualityCriterias.map((criteria: QualityCriterion) => ({
                    ...criteria,
                    selectedStatus: selectedStatus
                })),
                annotations: view.annotations.map((annotation: Annotation) => ({
                    ...annotation,
                    selectedStatus: selectedStatus,
                    acronym: selectedStatus === ESelectedStatus.SELECTED ? annotation.acronym : "",
                    error: selectedStatus === ESelectedStatus.SELECTED ? annotation.error : ""
                })),
                measurements: view.measurements.map((measurement: BaseMasterModel) => ({
                    ...measurement,
                    selectedStatus: selectedStatus
                }))
            }))
        };
    }

    /**
     * Set the status of the diagnostic view and its children
     * @param view - The diagnostic view to set the status of
     * @param status - The status to set the selected status to
     * @returns The updated diagnostic view
     */
    static setDiagnosticViewAndChildrenStatus(view: DiagnosticView, status: ESelectedStatus): DiagnosticView {
        return {
            ...view,
            selectedStatus: status,
            qualityCriterias: view.qualityCriterias.map((qc: QualityCriterion) => ({ ...qc, selectedStatus: status })),
            measurements: view.measurements.map((m: BaseMasterModel) => ({ ...m, selectedStatus: status })),
            annotations: view.annotations.map((a: Annotation) => ({
                ...a,
                selectedStatus: status,
                acronym: status === ESelectedStatus.SELECTED ? a.acronym : "",
                error: status === ESelectedStatus.SELECTED ? a.error : ""
            })),
        };
    }

    /**
     * Set the status of the anatomy and its children
     * @param anatomy - The anatomy to set the status of
     * @param status - The status to set the selected status to
     * @returns The updated anatomy
     */
    static setAnatomyAndChildrenStatus(anatomy: WorkflowMaster, status: ESelectedStatus): WorkflowMaster {
        return {
            ...anatomy,
            selectedStatus: status,
            diagnosticViews: anatomy.diagnosticViews.map((view: DiagnosticView) => ProtocolCheckboxHelpers.setDiagnosticViewAndChildrenStatus(view, status)),
        };
    }

    /**
     * Compute the tri-state of the anatomy
     * @param diagnosticViews - The diagnostic views to compute the tri-state of
     * @returns The tri-state of the anatomy
     */
    static computeAnatomyTriState(diagnosticViews: DiagnosticView[]): ESelectedStatus {
        const total = diagnosticViews.length;
        const selected = diagnosticViews.filter(v => v.selectedStatus === ESelectedStatus.SELECTED).length;
        if (selected === 0) return ESelectedStatus.UNSELECTED;
        if (selected === total) return ESelectedStatus.SELECTED;
        return ESelectedStatus.INTERMEDIATE;
    }

    /**
     * Update the status of a child of the diagnostic view
     * @param view - The diagnostic view to update the status of
     * @param type - The type of child to update the status of
     * @param childId - The id of the child to update the status of
     * @param checked - Whether the child is checked
     * @returns The updated diagnostic view
     */
    static updateChildStatus(view: DiagnosticView, type: string, childId: number, checked: boolean): DiagnosticView {
        const updatedView = { ...view };
        if (type === "qc") {
            updatedView.qualityCriterias = view.qualityCriterias.map(qc =>
                qc.id === childId ? { ...qc, selectedStatus: checked ? ESelectedStatus.SELECTED : ESelectedStatus.UNSELECTED } : qc
            );
        } else if (type === "measurement") {
            updatedView.measurements = view.measurements.map(m =>
                m.id === childId ? { ...m, selectedStatus: checked ? ESelectedStatus.SELECTED : ESelectedStatus.UNSELECTED } : m
            );
        } else if (type === "annotation") {
            updatedView.annotations = view.annotations.map(a => {
                if (a.id === childId) {
                    return {
                        ...a,
                        selectedStatus: checked ? ESelectedStatus.SELECTED : ESelectedStatus.UNSELECTED,
                        acronym: checked ? a.acronym : "",
                        error: checked ? a.error : ""
                    };
                }
                return a;
            });
        }
        return updatedView;
    }

    /**
     * Update the status of the diagnostic view
     * @param view - The diagnostic view to update the status of
     * @returns The updated diagnostic view
     */
    static updateViewStatus(view: DiagnosticView): DiagnosticView {
        const allChildren = [
            ...view.qualityCriterias,
            ...view.measurements,
            ...view.annotations,
        ];
        const total = allChildren.length;
        const selected = allChildren.filter(c => c.selectedStatus === ESelectedStatus.SELECTED).length;
        if (selected === total) {
            view.selectedStatus = ESelectedStatus.SELECTED;
        } else if (selected === 0) {
            view.selectedStatus = ESelectedStatus.UNSELECTED;
        } else {
            view.selectedStatus = ESelectedStatus.SELECTED;
        }
        return view;
    }

    static validateAcronym(acronym: string): string {
        try {
            AnnotationAcronymSchema.parse({ acronym });
            return "";
        } catch (error) {
            if (error instanceof ZodError) {
                return error.errors[0]?.message || "Invalid input";
            } else if (error instanceof Error) {
                return error.message;
            }
            return "";
        }
    }

    static updateAnnotationWithError(
        annotation: Annotation,
        value: string | undefined
    ): Annotation {
        const error: string = ProtocolCheckboxHelpers.validateAcronym(value ?? annotation.acronym);
        return { ...annotation, acronym: value ?? annotation.acronym, error };
    }

    static updateAnnotationsWithError(
        annotations: Annotation[],
        annotationId: number,
        value: string
    ): Annotation[] {
        return annotations.map(annotation =>
            annotation.id === annotationId
                ? ProtocolCheckboxHelpers.updateAnnotationWithError(annotation, value)
                : annotation
        );
    }

    static updateDiagnosticViewWithAnnotationErrors(
        view: DiagnosticView,
        hasInvalidAnnotationsRef: { value: boolean }
    ): DiagnosticView {
        if (view.selectedStatus !== ESelectedStatus.SELECTED) return view;
        const updatedAnnotations = view.annotations.map(a => {
            if (a.selectedStatus !== ESelectedStatus.SELECTED) return a;
            const updated = ProtocolCheckboxHelpers.updateAnnotationWithError(a, undefined);
            if (updated.error) hasInvalidAnnotationsRef.value = true;
            return updated;
        });
        return { ...view, annotations: updatedAnnotations };
    }

    static updateDiagnosticViewsWithAnnotationErrors(
        diagnosticViews: DiagnosticView[],
        hasInvalidAnnotationsRef: { value: boolean }
    ): DiagnosticView[] {
        return diagnosticViews.map(view =>
            ProtocolCheckboxHelpers.updateDiagnosticViewWithAnnotationErrors(view, hasInvalidAnnotationsRef)
        );
    }

    static updateViewsWithAnnotationChange(
        views: DiagnosticView[],
        diagnosticViewId: number,
        annotationId: number,
        value: string
    ): DiagnosticView[] {
        return views.map(view => {
            if (view.id !== diagnosticViewId) return view;
            return {
                ...view,
                annotations: ProtocolCheckboxHelpers.updateAnnotationsWithError(
                    view.annotations,
                    annotationId,
                    value
                )
            };
        });
    }

    static filterSelected<T extends { selectedStatus: ESelectedStatus }>(items?: T[]): T[] {
        return items?.filter(item => item.selectedStatus === ESelectedStatus.SELECTED) || [];
    }

    static getFilteredDiagnosticViews(views: DiagnosticView[] = []): DiagnosticView[] {
        return views
            .filter(view => view.selectedStatus === ESelectedStatus.SELECTED)
            .map(view => ({
                ...view,
                qualityCriterias: ProtocolCheckboxHelpers.filterSelected(view.qualityCriterias),
                measurements: ProtocolCheckboxHelpers.filterSelected(view.measurements),
                annotations: ProtocolCheckboxHelpers.filterSelected(view.annotations),
            }));
    }

    static isAnatomySelected(anatomy: WorkflowMaster): boolean {
        return (
            anatomy.selectedStatus === ESelectedStatus.SELECTED ||
            anatomy.selectedStatus === ESelectedStatus.INTERMEDIATE
        );
    }

    static getFilteredSelectedAnatomies(anatomies: WorkflowMaster[]): WorkflowMaster[] {
        return anatomies
            .filter(ProtocolCheckboxHelpers.isAnatomySelected)
            .map(anatomy => ({
                ...anatomy,
                selectedStatus: ESelectedStatus.SELECTED,
                diagnosticViews: ProtocolCheckboxHelpers.getFilteredDiagnosticViews(anatomy.diagnosticViews),
            }));
    }

    static incrementImageAcquisition(view: DiagnosticView): DiagnosticView {
        if (view.noOfImageAcquisition < view.max) {
            return {
                ...view,
                noOfImageAcquisition: view.noOfImageAcquisition + 1
            };
        }
        return view;
    }

    static decrementImageAcquisition(view: DiagnosticView): DiagnosticView {
        if (view.noOfImageAcquisition > view.min) {
            return {
                ...view,
                noOfImageAcquisition: view.noOfImageAcquisition - 1
            };
        }
        return view;
    }
}

export default ProtocolCheckboxHelpers;
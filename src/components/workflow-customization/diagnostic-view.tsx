"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Minus, Plus } from "lucide-react"
import type { DiagnosticView } from "~/types/workflow"
import { ESelectedStatus } from "~/enums/workflow-customization-enum"
import { useMemo } from "react"
import { workflowTestIds } from '../test-ids/workflow.ids';

interface DiagnosticViewProps {
    view: DiagnosticView
    onCheckboxChange: (checked: boolean, type: string, diagnosticViewId: number, childId?: number) => void,
    handleAcronymChange: (diagnosticViewId: number, annotationId: number, value: string) => void
    onIncrementImageAcquisition: (diagnosticViewId: number) => void
    onDecrementImageAcquisition: (diagnosticViewId: number) => void
}

interface AcquisitionButtonProps {
    icon: React.ReactNode;
    onClick: () => void;
    disabled: boolean;
    dataTestId?: string;
}

const AcquisitionButton = ({ icon, onClick, disabled, dataTestId }: AcquisitionButtonProps) => (
    <button 
        className={`text-lg font-bold px-1 ${disabled ? 'opacity-50 cursor-not-allowed' : 'text-primary-500'}`}
        onClick={onClick}
        disabled={disabled}
        data-testid={dataTestId}
    >
        {icon}
    </button>
);

const AcquisitionControls = ({ 
    view, 
    onIncrement, 
    onDecrement 
}: { 
    view: DiagnosticView; 
    onIncrement: () => void; 
    onDecrement: () => void; 
}) => {
    const isIncrementDisabled: boolean = useMemo(() => view.noOfImageAcquisition >= view.max, [view.noOfImageAcquisition, view.max]);
    const isDecrementDisabled: boolean = useMemo(() => view.noOfImageAcquisition <= view.min, [view.noOfImageAcquisition, view.min]);

    return (
        <div className="flex items-center border border-primary-300 rounded-md px-2 py-1 gap-2 bg-light-600" data-testid={workflowTestIds.diagnosticView.acquisition.controls.container}>
            <AcquisitionButton
                icon={<Minus className="h-4 w-4" stroke={isDecrementDisabled ? "var(--neutral-400)" : "var(--primary-500)"} />}
                onClick={onDecrement}
                disabled={isDecrementDisabled}
                dataTestId={workflowTestIds.diagnosticView.acquisition.controls.decrement}
            />
            <span className="text-sm px-2 font-bold text-neutral-500" data-testid={workflowTestIds.diagnosticView.acquisition.controls.count}>{view?.noOfImageAcquisition}</span>
            <AcquisitionButton
                icon={<Plus className="h-4 w-4" stroke={isIncrementDisabled ? "var(--neutral-400)" : "var(--primary-500)"} />}
                onClick={onIncrement}
                disabled={isIncrementDisabled}
                dataTestId={workflowTestIds.diagnosticView.acquisition.controls.increment}
            />
        </div>
    );
};

export default function DiagnosticViewComponent({ 
    view, 
    onCheckboxChange, 
    handleAcronymChange,
    onIncrementImageAcquisition,
    onDecrementImageAcquisition 
}: Readonly<DiagnosticViewProps>) {
    return (
        <div className="gap-4 pb-4" data-testid={workflowTestIds.diagnosticView.container}>
            <div className="flex items-center justify-between w-[70%]" data-testid={workflowTestIds.diagnosticView.header.container}>
                <div className="flex items-center gap-2 mb-2">
                    <Checkbox
                        data-testid={workflowTestIds.diagnosticView.header.checkbox(view.id)}
                        {...(view.selectedStatus === ESelectedStatus.SELECTED ? { 'data-selected-testid': workflowTestIds.diagnosticView.header.selected } : {})}
                        checked={view.selectedStatus === ESelectedStatus.SELECTED}
                        onCheckedChange={(checked) => {
                            onCheckboxChange(checked as boolean, "view", view.id)
                        }}
                        className="w-4 h-4 rounded-xs border-neutral-400"
                    />
                    <span className="text-base font-medium text-neutral-400 uppercase tracking-tight" data-testid={workflowTestIds.diagnosticView.header.name}>{view.name}</span>
                </div>
                <div className="flex items-center gap-16" data-testid={workflowTestIds.diagnosticView.acquisition.container}>
                    <span className="text-sm font-bold text-neutral-400" data-testid={workflowTestIds.diagnosticView.acquisition.label}>
                        Acquisition <span className="font-normal italic text-xs">(max: {view?.max})</span>
                    </span>
                    <AcquisitionControls
                        view={view}
                        onIncrement={() => onIncrementImageAcquisition(view.id)}
                        onDecrement={() => onDecrementImageAcquisition(view.id)}
                    />
                </div>
            </div>

            {/* Structural Criteria Section */}
            {view.qualityCriterias.length > 0 && (
                <div className="" data-testid={workflowTestIds.diagnosticView.qualityCriteria.container}>
                    <div className="flex items-center">
                        <span className="text-[13px] font-normal text-neutral-600 uppercase tracking-wide" data-testid={workflowTestIds.diagnosticView.qualityCriteria.title}>STRUCTURAL CRITERIA</span>
                        <div className="flex-1 border-t border-neutral-100 ml-2 h-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 p-2 mb-2 w-[80%]" data-testid={workflowTestIds.diagnosticView.qualityCriteria.list}>
                        {view.qualityCriterias.map((qc) => (
                            <div key={qc.id} className="flex items-center gap-2" data-testid={workflowTestIds.diagnosticView.qualityCriteria.item(qc.id)}>
                                <Checkbox
                                    data-testid={workflowTestIds.diagnosticView.qualityCriteria.checkbox(qc.id)}
                                    {...(qc.selectedStatus === ESelectedStatus.SELECTED ? { 'data-selected-testid': workflowTestIds.diagnosticView.qualityCriteria.selected } : {})}
                                    checked={qc.selectedStatus === ESelectedStatus.SELECTED}
                                    onCheckedChange={(checked) => {
                                        onCheckboxChange(checked as boolean, "qc", view.id, qc.id)
                                    }}
                                    className="w-[14px] h-[14px] rounded-xs border-neutral-500"
                                />
                                <span className="text-sm text-neutral-400 font-medium capitalize">{qc.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Measurements Section */}
            <div className="" data-testid={workflowTestIds.diagnosticView.measurement.container}>
                <div className="flex items-center">
                    <span className="text-[13px] font-normal text-neutral-600 uppercase tracking-wide" data-testid={workflowTestIds.diagnosticView.measurement.title}>MEASUREMENTS</span>
                    <div className="flex-1 border-t border-neutral-100 ml-2 h-1" />
                </div>
                {view.measurements.length > 0 ? (
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 p-2 mb-2" data-testid={workflowTestIds.diagnosticView.measurement.list}>
                        {view.measurements.map((m) => (
                            <div key={m.id} className="flex items-center gap-2" data-testid={workflowTestIds.diagnosticView.measurement.item(m.id)}>
                                <Checkbox
                                    data-testid={workflowTestIds.diagnosticView.measurement.checkbox(m.id)}
                                    {...(m.selectedStatus === ESelectedStatus.SELECTED ? { 'data-selected-testid': workflowTestIds.diagnosticView.measurement.selected } : {})}
                                    checked={m.selectedStatus === ESelectedStatus.SELECTED}
                                    onCheckedChange={(checked) => {
                                        onCheckboxChange(checked as boolean, "measurement", view.id, m.id)
                                    }}
                                    className="w-[14px] h-[14px] rounded-xs border-neutral-500"
                                />
                                <span className="text-sm text-neutral-400 font-medium capitalize">{m.name}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mx-2 py-2 text-sm text-neutral-400 font-medium capitalize" data-testid={workflowTestIds.diagnosticView.measurement.empty}>No Measurements</p>
                )}
            </div>

            {/* Annotations Section */}
            <div className="" data-testid={workflowTestIds.diagnosticView.annotation.container}>
                <div className="flex items-center">
                    <span className="text-[13px] font-normal text-neutral-600 uppercase tracking-wide" data-testid={workflowTestIds.diagnosticView.annotation.title}>ANNOTATIONS</span>
                    <div className="flex-1 border-t border-neutral-100 ml-2 h-1" />
                </div>
                {view.annotations.length > 0 ? (
                    <div className="flex flex-col gap-2 p-2" data-testid={workflowTestIds.diagnosticView.annotation.list}>
                        {view.annotations.map((a) => (
                            <div key={a.id} className="flex items-center gap-2" data-testid={workflowTestIds.diagnosticView.annotation.item(a.id)}>
                                <div className="flex items-center gap-2 w-[40%]">
                                    <Checkbox
                                        data-testid={workflowTestIds.diagnosticView.annotation.checkbox(a.id)}
                                        {...(a.selectedStatus === ESelectedStatus.SELECTED ? { 'data-selected-testid': workflowTestIds.diagnosticView.annotation.selected } : {})}
                                        checked={a.selectedStatus === ESelectedStatus.SELECTED}
                                        onCheckedChange={(checked) => {
                                            onCheckboxChange(checked as boolean, "annotation", view.id, a.id)
                                        }}
                                        className="w-[14px] h-[14px] rounded-xs border-neutral-500"
                                    />
                                    <span className="text-sm text-neutral-400 font-medium capitalize">{a.name}</span>
                                </div>
                                <div className="flex flex-col" data-testid={workflowTestIds.diagnosticView.annotation.input.container}>
                                    <input
                                        type="text"
                                        className={`border ${a.error ? 'border-red-500' : 'border-input-border'} placeholder:text-input-placeholder rounded-md px-3 py-1 text-sm focus:outline-none`}
                                        placeholder="type here..."
                                        disabled={a.selectedStatus !== ESelectedStatus.SELECTED}
                                        value={a.acronym}
                                        onChange={(e) => {
                                            handleAcronymChange(view.id, a.id, e.target.value.toUpperCase())
                                        }}
                                        data-testid={workflowTestIds.diagnosticView.annotation.input.field}
                                    />
                                    {a.error && (
                                        <span className="w-[180px] text-wrap text-xs text-red-500 mt-1" data-testid={workflowTestIds.diagnosticView.annotation.input.error}>{a.error}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mx-2 py-2 text-sm text-neutral-400 font-medium capitalize" data-testid={workflowTestIds.diagnosticView.annotation.empty}>No Annotations</p>
                )}
            </div>
        </div>
    )
}

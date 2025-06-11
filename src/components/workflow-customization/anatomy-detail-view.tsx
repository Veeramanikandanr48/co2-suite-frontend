"use client"

import type { WorkflowMaster } from "~/types/workflow"
import DiagnosticViewComponent from "./diagnostic-view"

interface AnatomyDetailViewProps {
  activeAnatomyId: number
  workflowMasters: WorkflowMaster[]
  onCheckboxChange: (checked: boolean, type: string, diagnosticViewId: number, childId?: number) => void
  handleAcronymChange: (diagnosticViewId: number, annotationId: number, value: string) => void
  onIncrementImageAcquisition: (diagnosticViewId: number) => void
  onDecrementImageAcquisition: (diagnosticViewId: number) => void
}

export default function AnatomyDetailView({
  activeAnatomyId,
  workflowMasters,
  onCheckboxChange,
  handleAcronymChange,
  onIncrementImageAcquisition,
  onDecrementImageAcquisition
}: AnatomyDetailViewProps) {
  const activeAnatomy: WorkflowMaster | undefined = workflowMasters?.find((a) => a.id === activeAnatomyId)

  if (!activeAnatomy) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-input-placeholder text-sm font-normal tracking-tight">Please choose items from the package to continue creating a custom workflow.</p>
      </div>
    )
  }

  return (
    <div className="p-4 h-full overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
      {activeAnatomy?.diagnosticViews.map((view) => (
        <DiagnosticViewComponent
          key={view.id}
          view={view}
          onCheckboxChange={onCheckboxChange}
          handleAcronymChange={handleAcronymChange}
          onIncrementImageAcquisition={onIncrementImageAcquisition}
          onDecrementImageAcquisition={onDecrementImageAcquisition}
        />
      ))}
    </div>
  )
}

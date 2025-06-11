import React from "react";
import SearchBar from "~/components/reusables/form-fields/search-bar";
import { ArrowUpDown, MoreVertical } from "lucide-react";
import { Duplicate } from "~/components/svg";
import { WorkflowListSidebarProps, WorkflowSectionProps, WorkflowData } from "~/types/workflow";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { workflowListTestIds } from "@/components/test-ids/workflow-customization.ids";

const WorkflowSection: React.FC<WorkflowSectionProps & {
    showMenu?: boolean;
    onDuplicateEdit: (workflow: WorkflowData) => void;
}> = ({
    title,
    workflows,
    selectedWorkflow,
    onSelectWorkflow,
    emptyMessage,
    showMenu = false,
    onDuplicateEdit,
}) => {
    const isStandard = title === "OMEA Standard Workflows";
    const sectionTestIds = isStandard ? workflowListTestIds.sections.standard : workflowListTestIds.sections.custom;

    return (
        <>
            <div 
                data-testid={sectionTestIds.title}
                className="px-2 pt-4 pb-2 text-[10px] font-normal text-neutral-950 leading-[20px] italic capitalize"
            >
                {title}
            </div>
            {workflows && workflows.length > 0 ? (
                workflows?.map((workflow: WorkflowData, idx: number) => {
                    const isActive: boolean = selectedWorkflow?.id === workflow.id;
                    return (
                        <div
                            key={workflow.id}
                            data-testid={sectionTestIds.item(workflow.id)}
                            className={`relative flex items-center h-[47px] text-sm cursor-pointer px-5 py-6 ${
                                isActive
                                    ? "bg-light-300 text-neutral-800"
                                    : "hover:bg-gray-50 text-neutral-400"
                            } ${idx !== 0 ? "border-t border-neutral-200" : ""}`}
                            onClick={() => selectedWorkflow?.id === workflow.id ? undefined : onSelectWorkflow(workflow)}
                            onKeyDown={(e) => { if (e.key === 'Enter') onSelectWorkflow(workflow); }}
                            
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary-500" />
                            )}
                            <div className="transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap font-normal text-xs leading-[20px] flex justify-between w-full items-center">
                                <p className="truncate text-neutral-400 leading-[20px] text-xs">{workflow.name}</p>
                                {showMenu && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                data-testid={workflowListTestIds.sections.custom.menu.button(workflow.id)}
                                                className="-mr-2 p-1 rounded"
                                                onClick={e => e.stopPropagation()}
                                                aria-label="More options"
                                            >
                                                <MoreVertical className="h-4 w-4 text-neutral-400" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent align="end" className="w-[160px] p-0 -mr-4">
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    onDuplicateEdit(workflow);
                                                }}
                                                data-testid={workflowListTestIds.sections.custom.menu.duplicateButton(workflow.id)}
                                                className="flex items-center gap-2 px-3 py-2 text-xs font-normal text-text-primary bg-light-100 cursor-pointer w-full border-[1px] border-light-600"
                                            >
                                                <Duplicate className="h-4 w-4" />
                                                Duplicate & Edit
                                            </button>
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>
                        </div>
                    );
                })
            ) : (
                <div 
                    data-testid={sectionTestIds.emptyMessage}
                    className="px-4 pt-4 pb-2 text-xs text-neutral-400 italic capitalize"
                >
                    {emptyMessage}
                </div>
            )}
        </>
    );
};

const WorkflowListSidebar: React.FC<WorkflowListSidebarProps & { searchResetCounter?: number }> = ({
    standardWorkflows,
    customWorkflows,
    onSearch,
    onSort,
    sorting,
    selectedWorkflow,
    onSelectWorkflow,
    onDuplicateEdit,
    searchResetCounter = 0,
}) => {
    const toggleSortOrder = () =>
        onSort({ field: "name", order: sorting.order === 0 ? 1 : 0 });

    return (
        <div 
            data-testid={workflowListTestIds.container}
            className="w-full h-full bg-light-100 flex flex-col rounded-tl-sm border-neutral-300"
        >
            <div 
                data-testid={workflowListTestIds.header.container}
                className="flex flex-col items-center gap-2 border-b border-neutral-400 w-full"
            >
                <div className="flex items-center px-3 py-[6px] justify-between w-full h-[45px]">
                    <p 
                        data-testid={workflowListTestIds.header.title}
                        className="text-sm font-bold text-neutral-400 leading-[20px]"
                    >
                        Imaging Workflow
                    </p>
                    <button 
                        data-testid={workflowListTestIds.header.sortButton}
                        onClick={toggleSortOrder} 
                        className="p-2" 
                        aria-label="Sort"
                    >
                        <ArrowUpDown
                            className={`h-4 w-4 ${sorting.order === 0 ? "stroke-gray-600" : "stroke-neutral-400"
                                }`}
                        />
                    </button>
                </div>
            </div>
            <SearchBar
              data-testid={workflowListTestIds.search.input}
              placeholder="Search for a workflow.."
              onSearch={onSearch}
              className="w-full h-9 placeholder:text-input-placeholder placeholder:italic rounded-none"
              resetTrigger={searchResetCounter}
            />

            <div className="overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400">
                <WorkflowSection
                    title="OMEA Standard Workflows"
                    workflows={standardWorkflows}
                    selectedWorkflow={selectedWorkflow}
                    onSelectWorkflow={onSelectWorkflow}
                    emptyMessage="No OMEA Standard Workflows found"
                    onDuplicateEdit={onDuplicateEdit}
                />
                <hr className="border-neutral-300" /> {/* Add this line for the border above Hospital Standard Workflows */}
                <WorkflowSection
                    title="Hospital Standard Workflows"
                    workflows={customWorkflows}
                    selectedWorkflow={selectedWorkflow}
                    onSelectWorkflow={onSelectWorkflow}
                    emptyMessage="No Hospital Standard Workflows found"
                    showMenu
                    onDuplicateEdit={onDuplicateEdit}
                />
            </div>
        </div>
    );
};

export default WorkflowListSidebar;
